# Storage Security Requirements

## Overview

This document outlines the security requirements for the Terrarium storage system in production.

## Storage Bucket Configuration

### Community Assets Bucket

- Bucket Name: `community-assets`
- Access: Private (not public)
- RLS (Row Level Security): Enabled

## Role-Based Access Control

### 1. Community Admin Role

- Must be set in both:
  - Session claims (`app_metadata.role = 'community_admin'`)
  - Profile table (`profiles.role = 'community_admin'`)
- Required for all write operations (upload/update/delete)

### 2. Member Role

- Must be set in both:
  - Session claims (`app_metadata.role = 'member'`)
  - Profile table (`profiles.role = 'member'`)
- Required for read operations only

## Path Validation Requirements

### 1. Community Asset Paths

- Format: `{community-slug}/{asset-type}/{filename}`
- Validation using `split_part(name, '/', 1)` for community slug
- Must match community slug in database

### 2. Asset Types

- Supported types:
  - `logo/`
  - `banner/`
  - Other types as needed per community
- No restrictions on subfolder names
- Must follow path format convention

## Required Security Policies

### 1. Upload Permissions

- Only community owners can upload files
- Must be authenticated
- Must be uploading to their own community's folder
- File size limit: 5MB
- Allowed file types: Images only

### 2. View Permissions

- Community owners can view their community's files
- Community members can view their community's files
- Must be authenticated
- No public access

### 3. Delete/Update Permissions

- Only community owners can delete/update files
- Must be authenticated
- Must be their own community's files

## SQL Migration for Production

```sql
-- Revoke all public access
revoke all on storage.objects from anon, public;
revoke all on storage.buckets from anon, public;

-- Ensure bucket is private
update storage.buckets
set public = false
where id = 'community-assets';

-- Enable RLS
alter table storage.objects enable row level security;

-- Create policies
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
```

## Implementation Checklist for Production

1. [ ] Create private storage bucket
2. [ ] Enable RLS on storage.objects
3. [ ] Apply security policies
4. [ ] Test all policies in staging environment before production
5. [ ] Set up monitoring for failed access attempts
6. [ ] Document any required backup procedures

## Testing Environment Considerations

For the testing environment:

- Keep security policies more permissive for easier development
- Focus on testing the core functionality
- Use basic RLS policies to ensure the general flow works
- Document any security-related TODOs for production

## Notes

- Always test security changes in staging before applying to production
- Keep production security policies stricter than testing environment
- Regularly audit access patterns and adjust policies as needed
- Consider implementing rate limiting in production
