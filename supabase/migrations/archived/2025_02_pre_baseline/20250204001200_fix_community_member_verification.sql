/*
---
id: "20250204001200"
title: "Fix community member verification performance"
description: >
  Improves community member verification by adding proper foreign key constraints
  and indexes. Updates the community_members table to cascade delete when a profile
  is deleted, and adds a composite index to optimize community member verification
  queries.
affected_tables:
  - "public.community_members"
dependencies:
  - "20250204001100_add_profile_member_relationship.sql"
rollback: |
  DROP INDEX IF EXISTS idx_community_members_community_profile;
  ALTER TABLE community_members DROP CONSTRAINT IF EXISTS community_members_profile_id_fkey;
  ALTER TABLE community_members
  ADD CONSTRAINT community_members_profile_id_fkey
  FOREIGN KEY (profile_id)
  REFERENCES profiles(id);
---
*/

-- Drop existing foreign key if it exists
ALTER TABLE community_members
DROP CONSTRAINT IF EXISTS community_members_profile_id_fkey;

-- Add foreign key constraint with proper index
ALTER TABLE community_members
ADD CONSTRAINT community_members_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add index for the community member verification query
CREATE INDEX IF NOT EXISTS idx_community_members_community_profile
ON community_members (community_id, profile_id);
