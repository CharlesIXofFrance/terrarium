-- Revoke all public access
revoke all on storage.objects from anon, public;
revoke all on storage.buckets from anon, public;

-- Ensure bucket is private
update storage.buckets
set public = false
where id = 'community-assets';

-- Drop any existing policies
drop policy if exists "Community owners can upload assets" on storage.objects;
drop policy if exists "Community owners can update assets" on storage.objects;
drop policy if exists "Community owners can delete assets" on storage.objects;
drop policy if exists "Community members can view assets" on storage.objects;

-- Recreate policies with stricter authentication checks
create policy "Community owners can upload assets"
  on storage.objects for insert
  to authenticated
  with check (
    auth.role() = 'authenticated' and
    bucket_id = 'community-assets' and
    exists (
      select 1 from communities c
      where c.id = (storage.foldername(name))[1]::uuid
      and c.owner_id = auth.uid()
    )
  );

create policy "Community owners can update assets"
  on storage.objects for update
  to authenticated
  using (
    auth.role() = 'authenticated' and
    bucket_id = 'community-assets' and
    exists (
      select 1 from communities c
      where c.id = (storage.foldername(name))[1]::uuid
      and c.owner_id = auth.uid()
    )
  );

create policy "Community owners can delete assets"
  on storage.objects for delete
  to authenticated
  using (
    auth.role() = 'authenticated' and
    bucket_id = 'community-assets' and
    exists (
      select 1 from communities c
      where c.id = (storage.foldername(name))[1]::uuid
      and c.owner_id = auth.uid()
    )
  );

create policy "Community members can view assets"
  on storage.objects for select
  to authenticated
  using (
    auth.role() = 'authenticated' and
    bucket_id = 'community-assets' and
    exists (
      select 1 from communities c
      join community_members cm on c.id = cm.community_id
      where c.id = (storage.foldername(name))[1]::uuid
      and (
        c.owner_id = auth.uid() or
        cm.profile_id = auth.uid()
      )
    )
  );
