-- Make public availability explicit before exposing lifecycle controls in Studio.
-- A known paused or archived project must never fall back to a bundled fixture.

drop function public.get_public_invitation(text);

create function public.get_public_invitation(p_public_code text)
returns table (
  delivery_state text,
  project_id uuid,
  publication_id uuid,
  schema_version integer,
  revision integer,
  document jsonb,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    case
      when project.status in ('paused', 'expired', 'archived') then 'unavailable'
      when project.public_source = 'fixture' then 'fixture'
      when project.public_source = 'publication'
        and project.status = 'published'
        and publication.id is not null then 'publication'
      else 'unavailable'
    end as delivery_state,
    project.id,
    publication.id,
    publication.schema_version,
    publication.revision,
    publication.document,
    publication.published_at
  from public.invitation_projects project
  left join lateral (
    select candidate.*
    from public.invitation_publications candidate
    where candidate.project_id = project.id
      and candidate.status = 'active'
    limit 1
  ) publication on true
  where p_public_code is not null
    and length(btrim(p_public_code)) between 1 and 80
    and project.public_code = btrim(p_public_code)
  limit 1;
$$;

comment on function public.get_public_invitation(text) is
  'Resolves public delivery explicitly so paused, expired, and archived projects cannot fall back to bundled fixtures.';

revoke all on function public.get_public_invitation(text)
  from public, anon, authenticated;
grant execute on function public.get_public_invitation(text)
  to anon, authenticated;

create function public.set_invitation_lifecycle(
  p_project_id uuid,
  p_action text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  project_row public.invitation_projects%rowtype;
  has_active_publication boolean;
  next_status text;
begin
  if caller_id is null or not exists (
    select 1
    from public.platform_members member
    where member.id = caller_id
      and member.active
      and member.role = 'administrator'
  ) then
    raise exception using errcode = 'P0001', message = 'Tu cuenta no puede administrar invitaciones.';
  end if;

  if p_action is null or p_action not in ('pause', 'reactivate', 'archive', 'restore') then
    raise exception using errcode = 'P0001', message = 'La operación solicitada no es válida.';
  end if;

  select project.*
  into project_row
  from public.invitation_projects project
  where project.id = p_project_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'No encontramos la invitación solicitada.';
  end if;

  select exists (
    select 1
    from public.invitation_publications publication
    where publication.project_id = p_project_id
      and publication.status = 'active'
  ) into has_active_publication;

  case p_action
    when 'pause' then
      if project_row.status in ('paused', 'expired', 'archived')
        or (project_row.public_source = 'publication'
          and (project_row.status <> 'published' or not has_active_publication))
      then
        raise exception using errcode = 'P0001', message = 'Esta invitación no está disponible para pausar.';
      end if;
      next_status := 'paused';

    when 'reactivate' then
      if project_row.status <> 'paused' then
        raise exception using errcode = 'P0001', message = 'Sólo se puede reactivar una invitación pausada.';
      end if;
      if project_row.public_source = 'publication' and not has_active_publication then
        raise exception using errcode = 'P0001', message = 'Publicá una versión antes de reactivar la invitación.';
      end if;
      next_status := 'published';

    when 'archive' then
      if project_row.status = 'archived' then
        raise exception using errcode = 'P0001', message = 'La invitación ya está archivada.';
      end if;
      next_status := 'archived';

    when 'restore' then
      if project_row.status <> 'archived' then
        raise exception using errcode = 'P0001', message = 'Sólo se puede restaurar una invitación archivada.';
      end if;
      -- Restoring never makes a public link available without a second,
      -- explicit reactivation. Draft-only projects return to draft.
      next_status := case
        when project_row.public_source = 'publication' and not has_active_publication then 'draft'
        else 'paused'
      end;
  end case;

  update public.invitation_projects
  set status = next_status,
      updated_at = now()
  where id = p_project_id;

  return jsonb_build_object(
    'projectId', p_project_id,
    'status', next_status
  );
end;
$$;

comment on function public.set_invitation_lifecycle(uuid, text) is
  'Lets an active platform administrator pause, reactivate, archive, or safely restore an invitation.';

revoke all on function public.set_invitation_lifecycle(uuid, text)
  from public, anon, authenticated;
grant execute on function public.set_invitation_lifecycle(uuid, text)
  to authenticated;
