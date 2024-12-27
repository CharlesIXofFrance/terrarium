-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-assets',
  'community-assets',
  false,
  5242880, -- 5MB limit
  array['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp']
)
on conflict (id) do update set
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS
alter table storage.objects enable row level security;

-- Create policies for community-assets bucket
create policy "Community owners can upload assets"
  on storage.objects for insert
  to authenticated
  with check (
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
    bucket_id = 'community-assets' and
    (
      exists (
        select 1 from communities c
        where c.id = (storage.foldername(name))[1]::uuid
        and c.owner_id = auth.uid()
      ) or
      exists (
        select 1 from community_members cm
        where cm.community_id = (storage.foldername(name))[1]::uuid
        and cm.profile_id = auth.uid()
        and cm.role = 'member'
      )
    )
  );
