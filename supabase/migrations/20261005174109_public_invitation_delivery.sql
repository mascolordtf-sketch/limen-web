-- Public delivery remains opt-in per project. Existing links keep using their
-- bundled fixture until an administrator explicitly switches the source.

alter table public.invitation_projects
  add column public_source text not null default 'fixture'
  check (public_source in ('fixture', 'publication'));

create index invitation_projects_public_source_idx
  on public.invitation_projects (public_source)
  where public_source = 'publication';

create schema if not exists private;

create or replace function private.is_active_publication_media(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.invitation_projects project
    join public.invitation_publications publication
      on publication.project_id = project.id
     and publication.status = 'active'
    join public.project_media_assets asset
      on asset.project_id = project.id
     and asset.storage_key = p_object_name
     and asset.status = 'ready'
    where project.public_source = 'publication'
      and project.status = 'published'
      and jsonb_typeof(publication.document->'media') = 'array'
      and exists (
        select 1
        from jsonb_array_elements(publication.document->'media') media
        where media->>'storageKey' = p_object_name
      )
  );
$$;

comment on function private.is_active_publication_media(text) is
  'Allows Storage to expose only ready assets referenced by the active opt-in publication.';

revoke all on function private.is_active_publication_media(text)
  from public, anon, authenticated;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_active_publication_media(text)
  to anon, authenticated;

create policy "public_read_active_publication_media_objects"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'invitation-media'
    and private.is_active_publication_media(name)
  );

create or replace function public.get_public_invitation(p_public_code text)
returns table (
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
    project.id,
    publication.id,
    publication.schema_version,
    publication.revision,
    publication.document,
    publication.published_at
  from public.invitation_projects project
  join public.invitation_publications publication
    on publication.project_id = project.id
   and publication.status = 'active'
  where p_public_code is not null
    and length(btrim(p_public_code)) between 1 and 80
    and project.public_code = btrim(p_public_code)
    and project.public_source = 'publication'
    and project.status = 'published'
  limit 1;
$$;

comment on function public.get_public_invitation(text) is
  'Returns the single active publication selected for public delivery, without exposing draft or membership tables.';

revoke all on function public.get_public_invitation(text)
  from public, anon, authenticated;
grant execute on function public.get_public_invitation(text)
  to anon, authenticated;

create or replace function public.set_invitation_public_source(
  p_project_id uuid,
  p_public_source text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
begin
  if caller_id is null or not exists (
    select 1
    from public.platform_members member
    where member.id = caller_id
      and member.active
      and member.role = 'administrator'
  ) then
    raise exception using errcode = 'P0001', message = 'Tu cuenta no puede cambiar la fuente pública.';
  end if;

  if p_public_source is null or p_public_source not in ('fixture', 'publication') then
    raise exception using errcode = 'P0001', message = 'La fuente pública solicitada no es válida.';
  end if;

  if not exists (
    select 1
    from public.invitation_projects project
    where project.id = p_project_id
  ) then
    raise exception using errcode = 'P0001', message = 'No encontramos el proyecto solicitado.';
  end if;

  if p_public_source = 'publication' and not exists (
    select 1
    from public.invitation_projects project
    join public.invitation_publications publication
      on publication.project_id = project.id
     and publication.status = 'active'
    where project.id = p_project_id
      and project.status = 'published'
  ) then
    raise exception using errcode = 'P0001', message = 'El proyecto necesita una publicación activa antes de habilitar esta fuente.';
  end if;

  update public.invitation_projects
  set public_source = p_public_source,
      updated_at = now()
  where id = p_project_id;
end;
$$;

comment on function public.set_invitation_public_source(uuid, text) is
  'Lets an active platform administrator explicitly switch public delivery between the bundled fixture and the active publication.';

revoke all on function public.set_invitation_public_source(uuid, text)
  from public, anon, authenticated;
grant execute on function public.set_invitation_public_source(uuid, text)
  to authenticated;
