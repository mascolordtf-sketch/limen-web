-- Private Studio media. Objects are isolated by the project UUID in the first path segment.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invitation-media',
  'invitation-media',
  false,
  20971520,
  array[
    'image/jpeg', 'image/png', 'image/webp',
    'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav'
  ]
);

create policy "assigned_members_read_project_media_objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'invitation-media'
    and exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and (
          member.role = 'administrator'
          or exists (
            select 1
            from public.project_access access
            where access.project_id::text = (storage.foldername(name))[1]
              and access.user_id = (select auth.uid())
          )
        )
    )
  );

create policy "assigned_editors_create_project_media_objects"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'invitation-media'
    and exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and (
          member.role = 'administrator'
          or exists (
            select 1
            from public.project_access access
            where access.project_id::text = (storage.foldername(name))[1]
              and access.user_id = (select auth.uid())
              and access.role in ('administrator', 'editor')
          )
        )
    )
  );

create policy "assigned_editors_update_project_media_objects"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'invitation-media'
    and exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and (
          member.role = 'administrator'
          or exists (
            select 1
            from public.project_access access
            where access.project_id::text = (storage.foldername(name))[1]
              and access.user_id = (select auth.uid())
              and access.role in ('administrator', 'editor')
          )
        )
    )
  )
  with check (
    bucket_id = 'invitation-media'
    and exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and (
          member.role = 'administrator'
          or exists (
            select 1
            from public.project_access access
            where access.project_id::text = (storage.foldername(name))[1]
              and access.user_id = (select auth.uid())
              and access.role in ('administrator', 'editor')
          )
        )
    )
  );

create policy "assigned_editors_delete_project_media_objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'invitation-media'
    and exists (
      select 1
      from public.platform_members member
      where member.id = (select auth.uid())
        and member.active
        and (
          member.role = 'administrator'
          or exists (
            select 1
            from public.project_access access
            where access.project_id::text = (storage.foldername(name))[1]
              and access.user_id = (select auth.uid())
              and access.role in ('administrator', 'editor')
          )
        )
    )
  );
