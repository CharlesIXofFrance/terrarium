/*
---
id: "20250204001100"
title: "Add profile-member relationship"
description: >
  Establishes a proper relationship between profiles and community members by adding
  a foreign key constraint. This ensures referential integrity and automatically
  removes community memberships when a profile is deleted.
affected_tables:
  - "public.community_members"
  - "public.profiles"
dependencies:
  - "20250204001000_fix_role_type.sql"
rollback: |
  ALTER TABLE community_members
  DROP CONSTRAINT IF EXISTS community_members_profile_id_fkey;
---
*/

-- Add foreign key constraint from community_members to profiles
ALTER TABLE community_members
ADD CONSTRAINT community_members_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES profiles(id)
ON DELETE CASCADE;
