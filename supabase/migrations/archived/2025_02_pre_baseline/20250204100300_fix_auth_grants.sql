/*
---
affected_tables: []
dependencies: []
description: 'Fix auth grants by removing non-existent tables

  Migrated from legacy format.'
id: 20250204100300_fix_auth_grants
rollback: '-- To be added

  DROP FUNCTION IF EXISTS function_name CASCADE;'
title: Fix auth grants by removing non-existent tables

---
*/

-- Drop unnecessary grants
DROP POLICY IF EXISTS "Platform admins can update any community." ON public.communities;
DROP POLICY IF EXISTS "Platform admins can manage all members." ON public.community_members;

-- Recreate policies with new function name
CREATE POLICY "Admins can update any community."
    ON public.communities FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can manage all members."
    ON public.community_members FOR ALL
    USING (is_admin());
