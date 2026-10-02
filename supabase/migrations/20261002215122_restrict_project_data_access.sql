-- Tighten browser access after the initial schema migration.
-- Permission administration and publication remain server-side operations.

revoke insert, delete on table public.project_access from authenticated;
revoke update (role) on table public.project_access from authenticated;
revoke insert on table public.invitation_publications from authenticated;
revoke update (status) on table public.invitation_publications from authenticated;
revoke delete on table public.invitation_drafts from authenticated;

drop policy if exists "active_members_read_projects" on public.invitation_projects;
drop policy if exists "active_members_create_projects" on public.invitation_projects;
drop policy if exists "active_members_update_projects" on public.invitation_projects;
drop policy if exists "active_members_manage_project_access" on public.project_access;
drop policy if exists "active_members_manage_drafts" on public.invitation_drafts;
drop policy if exists "active_members_read_publications" on public.invitation_publications;
drop policy if exists "active_members_create_publications" on public.invitation_publications;
drop policy if exists "active_members_update_publication_status" on public.invitation_publications;
drop policy if exists "active_members_read_media" on public.project_media_assets;
drop policy if exists "active_members_create_media" on public.project_media_assets;
drop policy if exists "active_members_update_media_status" on public.project_media_assets;
drop policy if exists "active_members_delete_media" on public.project_media_assets;

create policy "assigned_members_read_projects"
  on public.invitation_projects for select
  to authenticated
  using (
    exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and member.role = 'administrator'
    )
    or exists (
      select 1
      from public.project_access access
      where access.project_id = invitation_projects.id
        and access.user_id = (select auth.uid())
    )
  );

create policy "administrators_create_projects"
  on public.invitation_projects for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and member.role = 'administrator'
    )
  );

create policy "assigned_editors_update_projects"
  on public.invitation_projects for update
  to authenticated
  using (
    exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and member.role = 'administrator'
    )
    or exists (
      select 1
      from public.project_access access
      where access.project_id = invitation_projects.id
        and access.user_id = (select auth.uid())
        and access.role in ('administrator', 'editor')
    )
  )
  with check (
    exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and member.role = 'administrator'
    )
    or exists (
      select 1
      from public.project_access access
      where access.project_id = invitation_projects.id
        and access.user_id = (select auth.uid())
        and access.role in ('administrator', 'editor')
    )
  );

create policy "members_read_own_project_access"
  on public.project_access for select
  to authenticated
  using (
    exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid()) and member.active
    )
    and (
      user_id = (select auth.uid())
      or exists (
        select 1
        from public.platform_members member
        where member.id = (select auth.uid())
          and member.active
          and member.role = 'administrator'
      )
    )
  );

create policy "assigned_editors_read_drafts"
  on public.invitation_drafts for select
  to authenticated
  using (
    exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and member.role = 'administrator'
    )
    or exists (
      select 1
      from public.project_access access
      where access.project_id = invitation_drafts.project_id
        and access.user_id = (select auth.uid())
        and access.role in ('administrator', 'editor')
    )
  );

create policy "assigned_editors_create_drafts"
  on public.invitation_drafts for insert
  to authenticated
  with check (
    updated_by = (select auth.uid())
    and (
      exists (
        select 1
        from public.platform_members member
        where member.id = (select auth.uid())
          and member.active
          and member.role = 'administrator'
      )
      or exists (
        select 1
        from public.project_access access
        where access.project_id = invitation_drafts.project_id
          and access.user_id = (select auth.uid())
          and access.role in ('administrator', 'editor')
      )
    )
  );

create policy "assigned_editors_update_drafts"
  on public.invitation_drafts for update
  to authenticated
  using (
    exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and member.role = 'administrator'
    )
    or exists (
      select 1
      from public.project_access access
      where access.project_id = invitation_drafts.project_id
        and access.user_id = (select auth.uid())
        and access.role in ('administrator', 'editor')
    )
  )
  with check (
    updated_by = (select auth.uid())
    and (
      exists (
        select 1
        from public.platform_members member
        where member.id = (select auth.uid())
          and member.active
          and member.role = 'administrator'
      )
      or exists (
        select 1
        from public.project_access access
        where access.project_id = invitation_drafts.project_id
          and access.user_id = (select auth.uid())
          and access.role in ('administrator', 'editor')
      )
    )
  );

create policy "assigned_members_read_publications"
  on public.invitation_publications for select
  to authenticated
  using (
    exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and member.role = 'administrator'
    )
    or exists (
      select 1
      from public.project_access access
      where access.project_id = invitation_publications.project_id
        and access.user_id = (select auth.uid())
    )
  );

create policy "assigned_members_read_media"
  on public.project_media_assets for select
  to authenticated
  using (
    exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and member.role = 'administrator'
    )
    or exists (
      select 1
      from public.project_access access
      where access.project_id = project_media_assets.project_id
        and access.user_id = (select auth.uid())
    )
  );

create policy "assigned_editors_create_media"
  on public.project_media_assets for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and (
      exists (
        select 1
        from public.platform_members member
        where member.id = (select auth.uid())
          and member.active
          and member.role = 'administrator'
      )
      or exists (
        select 1
        from public.project_access access
        where access.project_id = project_media_assets.project_id
          and access.user_id = (select auth.uid())
          and access.role in ('administrator', 'editor')
      )
    )
  );

create policy "assigned_editors_update_media_status"
  on public.project_media_assets for update
  to authenticated
  using (
    exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and member.role = 'administrator'
    )
    or exists (
      select 1
      from public.project_access access
      where access.project_id = project_media_assets.project_id
        and access.user_id = (select auth.uid())
        and access.role in ('administrator', 'editor')
    )
  )
  with check (
    exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and member.role = 'administrator'
    )
    or exists (
      select 1
      from public.project_access access
      where access.project_id = project_media_assets.project_id
        and access.user_id = (select auth.uid())
        and access.role in ('administrator', 'editor')
    )
  );

create policy "assigned_editors_delete_media"
  on public.project_media_assets for delete
  to authenticated
  using (
    exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and member.role = 'administrator'
    )
    or exists (
      select 1
      from public.project_access access
      where access.project_id = project_media_assets.project_id
        and access.user_id = (select auth.uid())
        and access.role in ('administrator', 'editor')
    )
  );
