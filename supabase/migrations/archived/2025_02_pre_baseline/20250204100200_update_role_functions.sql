/*
---
affected_tables: []
dependencies: []
description: 'Update role-related functions to use new role names

  Migrated from legacy format.'
id: 20250204100200_update_role_functions
rollback: '-- To be added

  DROP FUNCTION IF EXISTS function_name CASCADE;'
title: Update role-related functions to use new role names

---
*/

-- Drop and recreate is_platform_admin as is_admin
DROP FUNCTION IF EXISTS public.is_platform_admin() CASCADE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check service_role first
    IF auth.role() = 'service_role' THEN
        RETURN true;
    END IF;

    -- Check if user is authenticated
    IF auth.role() != 'authenticated' THEN
        RETURN false;
    END IF;

    -- Check admin role
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'admin'::user_role
    );
END $$;

-- Create new RLS policies using is_admin
DROP POLICY IF EXISTS "Admins can update any community" ON public.communities;
CREATE POLICY "Admins can update any community"
    ON public.communities FOR UPDATE
    USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage all members" ON public.community_members;
CREATE POLICY "Admins can manage all members"
    ON public.community_members FOR ALL
    USING (is_admin());

-- Update is_owner to use is_admin
CREATE OR REPLACE FUNCTION public.is_owner(community_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check service_role first
    IF auth.role() = 'service_role' THEN
        RETURN true;
    END IF;

    -- Check if user is authenticated
    IF auth.role() != 'authenticated' THEN
        RETURN false;
    END IF;

    -- Check platform admin
    IF public.is_admin() THEN
        RETURN true;
    END IF;

    -- Check community owner role
    RETURN EXISTS (
        SELECT 1
        FROM community_members cm
        WHERE cm.profile_id = auth.uid()
            AND cm.community_id = community_id
            AND cm.role = 'owner'::user_role
    );
END $$;
