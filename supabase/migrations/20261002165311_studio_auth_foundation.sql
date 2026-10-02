-- LIMEN Studio: identidad interna, proyectos y snapshots publicables.
-- Las invitaciones públicas actuales continúan siendo archivos estáticos.

create table public.platform_members (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('administrator', 'editor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index platform_members_active_idx on public.platform_members (active) where active;

create table public.invitation_projects (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  internal_name text not null,
  event_type text not null,
  plan_code text not null check (plan_code in ('essential', 'premium', 'premium_access')),
  plan_version integer not null default 1 check (plan_version > 0),
  status text not null default 'draft' check (status in (
    'awaiting_information', 'draft', 'internal_review', 'client_review',
    'approved', 'published', 'paused', 'expired', 'archived'
  )),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invitation_projects_created_by_idx on public.invitation_projects (created_by);
create index invitation_projects_status_idx on public.invitation_projects (status);

create table public.project_access (
  project_id uuid not null references public.invitation_projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('administrator', 'editor', 'host', 'reviewer', 'reception', 'support')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index project_access_user_id_idx on public.project_access (user_id);

create table public.invitation_drafts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.invitation_projects (id) on delete cascade,
  schema_version integer not null default 1 check (schema_version > 0),
  revision integer not null default 1 check (revision > 0),
  document jsonb not null,
  updated_by uuid not null references auth.users (id),
  updated_at timestamptz not null default now()
);

create index invitation_drafts_updated_by_idx on public.invitation_drafts (updated_by);

create table public.invitation_publications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.invitation_projects (id) on delete cascade,
  public_code text not null,
  schema_version integer not null check (schema_version > 0),
  revision integer not null check (revision > 0),
  document jsonb not null,
  status text not null default 'active' check (status in ('active', 'superseded', 'paused', 'expired')),
  published_by uuid not null references auth.users (id),
  published_at timestamptz not null default now(),
  unique (project_id, revision)
);

create index invitation_publications_project_id_idx on public.invitation_publications (project_id);
create index invitation_publications_published_by_idx on public.invitation_publications (published_by);
create index invitation_publications_public_code_idx on public.invitation_publications (public_code);
create unique index invitation_publications_one_active_project_idx
  on public.invitation_publications (project_id) where status = 'active';
create unique index invitation_publications_one_active_code_idx
  on public.invitation_publications (public_code) where status = 'active';

create table public.project_media_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.invitation_projects (id) on delete cascade,
  storage_key text not null unique,
  kind text not null check (kind in ('image', 'audio')),
  status text not null default 'pending' check (status in ('pending', 'ready', 'failed', 'removed')),
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  original_filename text not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create index project_media_assets_project_id_idx on public.project_media_assets (project_id);
create index project_media_assets_created_by_idx on public.project_media_assets (created_by);

alter table public.platform_members enable row level security;
alter table public.invitation_projects enable row level security;
alter table public.project_access enable row level security;
alter table public.invitation_drafts enable row level security;
alter table public.invitation_publications enable row level security;
alter table public.project_media_assets enable row level security;

revoke all on table public.platform_members from anon, authenticated;
revoke all on table public.invitation_projects from anon, authenticated;
revoke all on table public.project_access from anon, authenticated;
revoke all on table public.invitation_drafts from anon, authenticated;
revoke all on table public.invitation_publications from anon, authenticated;
revoke all on table public.project_media_assets from anon, authenticated;

grant select on table public.platform_members to authenticated;
grant select, insert, delete on table public.invitation_projects to authenticated;
grant update (public_code, internal_name, event_type, plan_code, plan_version, status, updated_at)
  on table public.invitation_projects to authenticated;
grant select, insert, delete on table public.project_access to authenticated;
grant update (role) on table public.project_access to authenticated;
grant select, insert, delete on table public.invitation_drafts to authenticated;
grant update (schema_version, revision, document, updated_by, updated_at)
  on table public.invitation_drafts to authenticated;
grant select, insert on table public.invitation_publications to authenticated;
grant update (status) on table public.invitation_publications to authenticated;
grant select, insert, delete on table public.project_media_assets to authenticated;
grant update (status) on table public.project_media_assets to authenticated;

create policy "members_read_own_membership" on public.platform_members for select to authenticated
  using (id = (select auth.uid()));

create policy "active_members_read_projects" on public.invitation_projects for select to authenticated
  using (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active));

create policy "active_members_create_projects" on public.invitation_projects for insert to authenticated
  with check (created_by = (select auth.uid()) and exists (
    select 1 from public.platform_members member where member.id = (select auth.uid()) and member.active));

create policy "active_members_update_projects" on public.invitation_projects for update to authenticated
  using (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active))
  with check (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active));

create policy "administrators_delete_projects" on public.invitation_projects for delete to authenticated
  using (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active and member.role = 'administrator'));

create policy "active_members_manage_project_access" on public.project_access for all to authenticated
  using (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active))
  with check (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active));

create policy "active_members_manage_drafts" on public.invitation_drafts for all to authenticated
  using (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active))
  with check (updated_by = (select auth.uid()) and exists (
    select 1 from public.platform_members member where member.id = (select auth.uid()) and member.active));

create policy "active_members_read_publications" on public.invitation_publications for select to authenticated
  using (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active));

create policy "active_members_create_publications" on public.invitation_publications for insert to authenticated
  with check (published_by = (select auth.uid()) and exists (
    select 1 from public.platform_members member where member.id = (select auth.uid()) and member.active));

create policy "active_members_update_publication_status" on public.invitation_publications for update to authenticated
  using (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active))
  with check (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active));

create policy "active_members_read_media" on public.project_media_assets for select to authenticated
  using (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active));

create policy "active_members_create_media" on public.project_media_assets for insert to authenticated
  with check (created_by = (select auth.uid()) and exists (
    select 1 from public.platform_members member where member.id = (select auth.uid()) and member.active));

create policy "active_members_update_media_status" on public.project_media_assets for update to authenticated
  using (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active))
  with check (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active));

create policy "active_members_delete_media" on public.project_media_assets for delete to authenticated
  using (exists (select 1 from public.platform_members member
    where member.id = (select auth.uid()) and member.active));
