-- Publish immutable snapshots through one validated, atomic operation.
-- The public renderer continues using the current static registry in this phase.

alter table public.invitation_publications
  add column draft_revision integer;

update public.invitation_publications
set draft_revision = revision
where draft_revision is null;

alter table public.invitation_publications
  alter column draft_revision set not null,
  add constraint invitation_publications_draft_revision_positive check (draft_revision > 0),
  add constraint invitation_publications_project_draft_revision_key unique (project_id, draft_revision);

-- Project lifecycle changes are privileged operations. Editors retain the other
-- explicitly granted project columns but cannot mark a project as published.
revoke update (status) on table public.invitation_projects from authenticated;

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
  set status = 'published', updated_at = now()
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
  'Creates an immutable publication from the exact saved draft revision after authorization and structural validation.';

revoke execute on function public.publish_invitation_draft(uuid, integer)
  from public, anon, authenticated;
grant execute on function public.publish_invitation_draft(uuid, integer)
  to authenticated;
