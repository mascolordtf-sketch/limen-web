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
      and project.public_source = 'publication'
      and project.status = 'published'
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

-- Publishing creates a new immutable snapshot, but it must not bypass an
-- explicit pause, expiry, or archive decision made for the public link.
create or replace function public.publish_invitation_draft(
  p_project_id uuid,
  p_expected_draft_revision integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  project_row public.invitation_projects%rowtype;
  draft_row public.invitation_drafts%rowtype;
  next_publication_revision integer;
  publication_row public.invitation_publications%rowtype;
begin
  if caller_id is null then
    raise exception using errcode = 'P0001', message = 'Tu sesión no está disponible.';
  end if;

  if not exists (
    select 1
    from public.platform_members member
    where member.id = caller_id
      and member.active
      and member.role = 'administrator'
  ) then
    raise exception using errcode = 'P0001', message = 'Tu cuenta no puede publicar invitaciones.';
  end if;

  select project.*
  into project_row
  from public.invitation_projects project
  where project.id = p_project_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'No encontramos el proyecto que querés publicar.';
  end if;

  select draft.*
  into draft_row
  from public.invitation_drafts draft
  where draft.project_id = p_project_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'Guardá el borrador antes de publicarlo.';
  end if;

  if p_expected_draft_revision is null or draft_row.revision <> p_expected_draft_revision then
    raise exception using errcode = 'P0001', message = 'El borrador cambió. Esperá a que termine de guardarse y volvé a intentar.';
  end if;

  if exists (
    select 1
    from public.invitation_publications publication
    where publication.project_id = p_project_id
      and publication.draft_revision = draft_row.revision
  ) then
    raise exception using errcode = 'P0001', message = 'Esta revisión del borrador ya tiene una publicación.';
  end if;

  if draft_row.schema_version <> 1
    or jsonb_typeof(draft_row.document) <> 'object'
    or draft_row.document->>'templateId' <> 'origin01'
    or draft_row.document->>'eventType' <> project_row.event_type
    or draft_row.document->>'code' <> project_row.public_code
    or jsonb_typeof(draft_row.document->'event') <> 'object'
    or jsonb_typeof(draft_row.document->'content') <> 'object'
    or jsonb_typeof(draft_row.document->'identities') <> 'array'
    or jsonb_typeof(draft_row.document->'modules') <> 'array'
    or jsonb_typeof(draft_row.document->'media') <> 'array'
  then
    raise exception using errcode = 'P0001', message = 'La invitación no supera la validación estructural para publicar.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(draft_row.document->'media') media
    where media ? 'storageKey'
      and not exists (
        select 1
        from public.project_media_assets asset
        where asset.project_id = p_project_id
          and asset.storage_key = media->>'storageKey'
          and asset.status = 'ready'
      )
  ) then
    raise exception using errcode = 'P0001', message = 'Hay archivos privados que no están listos para publicar.';
  end if;

  select coalesce(max(publication.revision), 0) + 1
  into next_publication_revision
  from public.invitation_publications publication
  where publication.project_id = p_project_id;

  update public.invitation_publications
  set status = 'superseded'
  where project_id = p_project_id
    and status = 'active';

  insert into public.invitation_publications (
    project_id,
    public_code,
    schema_version,
    revision,
    draft_revision,
    document,
    status,
    published_by
  ) values (
    p_project_id,
    project_row.public_code,
    draft_row.schema_version,
    next_publication_revision,
    draft_row.revision,
    draft_row.document,
    'active',
    caller_id
  )
  returning * into publication_row;

  update public.invitation_projects
  set status = case
        when project_row.status in ('paused', 'expired', 'archived') then project_row.status
        else 'published'
      end,
      updated_at = now()
  where id = p_project_id;

  return jsonb_build_object(
    'id', publication_row.id,
    'revision', publication_row.revision,
    'draftRevision', publication_row.draft_revision,
    'status', publication_row.status,
    'publishedAt', publication_row.published_at
  );
end;
$$;

comment on function public.publish_invitation_draft(uuid, integer) is
  'Creates an immutable publication while preserving paused, expired, and archived public lifecycle states.';

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
  changed_at timestamptz := now();
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
      updated_at = changed_at
  where id = p_project_id;

  return jsonb_build_object(
    'projectId', p_project_id,
    'status', next_status,
    'updatedAt', changed_at
  );
end;
$$;

comment on function public.set_invitation_lifecycle(uuid, text) is
  'Lets an active platform administrator pause, reactivate, archive, or safely restore an invitation.';

revoke all on function public.set_invitation_lifecycle(uuid, text)
  from public, anon, authenticated;
grant execute on function public.set_invitation_lifecycle(uuid, text)
  to authenticated;
