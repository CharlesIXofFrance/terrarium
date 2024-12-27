-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('community-assets', 'community-assets', false)
on conflict (id) do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Remove old policies if they exist
drop policy if exists "Community members can access assets" on storage.objects;
drop policy if exists "Community owners can manage assets" on storage.objects;

-- Policy for viewing assets (both owners and members)
create policy "Community members can access assets"
on storage.objects for select
to authenticated
using (
  bucket_id = 'community-assets' 
  and (
    exists (
      select 1 from community_members cm
      where cm.profile_id = auth.uid()
      and cm.community_id = (storage.foldername(name))[1]::uuid
    )
    or
    exists (
      select 1 from communities c
      where c.owner_id = auth.uid()
      and c.id = (storage.foldername(name))[1]::uuid
    )
  )
);

-- Policy for managing assets (owners only)
create policy "Community owners can manage assets"
on storage.objects for all
to authenticated
using (
  bucket_id = 'community-assets'
  and exists (
    select 1 from communities c
    where c.owner_id = auth.uid()
    and c.id = (storage.foldername(name))[1]::uuid
  )
)
with check (
  bucket_id = 'community-assets'
  and exists (
    select 1 from communities c
    where c.owner_id = auth.uid()
    and c.id = (storage.foldername(name))[1]::uuid
  )
);
