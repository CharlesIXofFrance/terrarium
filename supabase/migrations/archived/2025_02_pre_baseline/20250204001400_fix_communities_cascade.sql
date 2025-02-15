/*
---
id: "20250204001400"
title: "Fix communities cascade delete"
description: >
  Updates the communities table foreign key constraint to cascade delete when
  the owner user is deleted. This ensures proper cleanup of community data
  when a user account is removed.
affected_tables:
  - "public.communities"
dependencies:
  - "20250204001300_fix_user_roles_query.sql"
rollback: |
  ALTER TABLE public.communities DROP CONSTRAINT communities_owner_id_fkey;
  ALTER TABLE public.communities ADD CONSTRAINT communities_owner_id_fkey 
      FOREIGN KEY (owner_id) REFERENCES auth.users(id);
---
*/

-- Fix communities table to cascade delete when owner is deleted
ALTER TABLE public.communities DROP CONSTRAINT communities_owner_id_fkey;
ALTER TABLE public.communities ADD CONSTRAINT communities_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
