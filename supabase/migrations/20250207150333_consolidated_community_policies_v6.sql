/*
---
id: "20250207150333"
title: "Consolidated Community Policies V6 with Debug"
description: >
  Consolidates all community and community member policies into a single migration.
  Ensures proper access control for communities and memberships with soft-delete support.
affected_tables:
  - "public.communities"
  - "public.community_members"
dependencies:
  - "20250206121400"
rollback: |
  -- Drop all policies in reverse order
  DROP POLICY IF EXISTS "members_can_delete_own_membership" ON public.community_members;
  DROP POLICY IF EXISTS "members_can_update_own_membership" ON public.community_members;
  DROP POLICY IF EXISTS "members_can_join_communities" ON public.community_members;
  DROP POLICY IF EXISTS "members_can_view_memberships" ON public.community_members;
  DROP POLICY IF EXISTS "service_role_can_manage_memberships" ON public.community_members;
  DROP POLICY IF EXISTS "owners_can_delete_communities" ON public.communities;
  DROP POLICY IF EXISTS "owners_can_update_communities" ON public.communities;
  DROP POLICY IF EXISTS "owners_can_create_communities" ON public.communities;
  DROP POLICY IF EXISTS "authenticated_can_view_communities" ON public.communities;
  DROP POLICY IF EXISTS "service_role_can_manage_communities" ON public.communities;
---
*/

-- Debug functions for auth state and RLS policies
CREATE OR REPLACE FUNCTION debug_auth()
RETURNS TABLE (
    auth_role text,
    jwt_sub text,
    jwt_email text,
    jwt_role text,
    user_id uuid,
    user_email text,
    user_role public.app_role
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        auth.role()::text         as auth_role,
        (auth.jwt() ->> 'sub')    as jwt_sub,
        (auth.jwt() ->> 'email')  as jwt_email,
        (auth.jwt() ->> 'role')   as jwt_role,
        auth.uid()                as user_id,
        p.email                   as user_email,
        p.role                    as user_role
    FROM public.profiles p
    WHERE p.id = auth.uid();
END;
$$;

-- Function to check RLS policies for a table
CREATE OR REPLACE FUNCTION debug_rls_policies(target_table text)
RETURNS TABLE (
    policy_name text,
    cmd text,
    roles text[],
    qual text,
    with_check text
)
SECURITY DEFINER
LANGUAGE sql
AS $$
    SELECT
        policyname::text as policy_name,
        cmd::text,
        roles::text[],
        qual::text,
        with_check::text
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = target_table;
$$;

-- Function to test RLS policy execution
CREATE OR REPLACE FUNCTION test_rls_policy(
    target_table text,
    test_user_id uuid,
    test_cmd text DEFAULT 'SELECT'
)
RETURNS TABLE (
    policy_name text,
    cmd text,
    policy_passed boolean,
    error text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    policy_rec record;
    test_result boolean;
    err_msg text;
BEGIN
    -- Set test context
    PERFORM set_config('request.jwt.claim.sub', test_user_id::text, true);
    SET LOCAL ROLE authenticated;
    
    FOR policy_rec IN 
        SELECT policyname, cmd, qual, with_check 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = target_table
        AND (cmd = test_cmd OR cmd = 'ALL')
    LOOP
        BEGIN
            -- Test USING clause
            IF policy_rec.qual IS NOT NULL THEN
                EXECUTE 'SELECT ' || policy_rec.qual INTO test_result;
            ELSE
                test_result := true;
            END IF;

            -- Test WITH CHECK clause for INSERT/UPDATE
            IF (test_cmd IN ('INSERT', 'UPDATE')) AND policy_rec.with_check IS NOT NULL THEN
                EXECUTE 'SELECT ' || policy_rec.with_check INTO test_result;
            END IF;

            RETURN QUERY
            SELECT 
                policy_rec.policyname::text,
                policy_rec.cmd::text,
                test_result,
                NULL::text;

        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY
            SELECT 
                policy_rec.policyname::text,
                policy_rec.cmd::text,
                false,
                SQLERRM;
        END;
    END LOOP;
    
    -- Reset context
    RESET ROLE;
    PERFORM set_config('request.jwt.claim.sub', '', true);
 END;
$$;

-- Ensure deleted columns exist
DO $$
BEGIN
    IF NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'communities'
         AND column_name = 'deleted'
    ) THEN
       ALTER TABLE public.communities ADD COLUMN deleted boolean NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'community_members'
         AND column_name = 'deleted'
    ) THEN
       ALTER TABLE public.community_members ADD COLUMN deleted boolean NOT NULL DEFAULT false;
    END IF;
END
$$;

-- Create communities_count view for tracking active communities per owner
CREATE OR REPLACE VIEW public.communities_count AS
SELECT 
    p.id as profile_id,
    COUNT(c.*) FILTER (WHERE NOT c.deleted) as active_count
FROM public.profiles p
LEFT JOIN public.communities c ON c.owner_id = p.id
GROUP BY p.id;

-- Drop all existing policies and functions to avoid conflicts
DROP POLICY IF EXISTS "service_role_can_manage_communities" ON public.communities;
DROP POLICY IF EXISTS "authenticated_can_view_communities" ON public.communities;
DROP POLICY IF EXISTS "owners_can_create_communities" ON public.communities;
DROP POLICY IF EXISTS "owners_can_update_communities" ON public.communities;
DROP POLICY IF EXISTS "owners_can_delete_communities" ON public.communities;

DROP POLICY IF EXISTS "service_role_can_manage_memberships" ON public.community_members;
DROP POLICY IF EXISTS "members_can_view_memberships" ON public.community_members;
DROP POLICY IF EXISTS "members_can_join_communities" ON public.community_members;
DROP POLICY IF EXISTS "members_can_update_own_membership" ON public.community_members;
DROP POLICY IF EXISTS "members_can_delete_own_membership" ON public.community_members;

DROP FUNCTION IF EXISTS public.is_owner;
DROP FUNCTION IF EXISTS public.owns_community;

-- Create security definer functions
CREATE OR REPLACE FUNCTION public.is_owner(user_id uuid)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = user_id
        AND role = 'owner'::public.app_role
    );
$$;

CREATE OR REPLACE FUNCTION public.owns_community(user_id uuid, target_community_id uuid)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM communities c
        WHERE c.id = target_community_id
        AND c.owner_id = user_id
        AND NOT c.deleted
    );
$$;

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.communities FORCE ROW LEVEL SECURITY;
ALTER TABLE public.community_members FORCE ROW LEVEL SECURITY;

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members FORCE ROW LEVEL SECURITY;

--------------------------------------
-- Communities table RLS Policies
--------------------------------------

-- Service role: manage all communities
CREATE POLICY "service_role_can_manage_communities"
    ON public.communities
    FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Authenticated users: view communities
CREATE POLICY "authenticated_can_view_communities"
    ON public.communities
    FOR SELECT
    TO authenticated
    USING (
        (deleted = false)
        OR (
            -- Owners can see their deleted communities
            EXISTS (
                SELECT 1
                FROM public.profiles p
                WHERE p.id = public.communities.owner_id
                    AND p.id = auth.uid()
                    AND p.role = 'owner'::public.app_role
            )
        )
    );

-- Community owners: create communities
CREATE POLICY "owners_can_create_communities"
    ON public.communities
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Must be an owner
        EXISTS (
            SELECT 1
            FROM public.profiles pr
            WHERE pr.id = auth.uid()
              AND pr.role = 'owner'::public.app_role
        )
        -- Must match new row's owner_id
        AND owner_id = auth.uid()
        -- Must have an owner set
        AND owner_id IS NOT NULL
        -- Must not be deleted on creation
        AND deleted = false
    );

-- Community owners: update their communities
CREATE POLICY "owners_can_update_communities"
    ON public.communities
    FOR UPDATE
    TO authenticated
    USING (
        -- Must be owner and community not already deleted
        EXISTS (
            SELECT 1
            FROM public.profiles pr
            WHERE pr.id = auth.uid()
              AND pr.role = 'owner'::public.app_role
              AND pr.id = communities.owner_id
        )
        AND NOT deleted
    )
    WITH CHECK (
        -- Must be owner and community not already deleted
        EXISTS (
            SELECT 1
            FROM public.profiles pr
            WHERE pr.id = auth.uid()
              AND pr.role = 'owner'::public.app_role
              AND pr.id = communities.owner_id
        )
        AND NOT deleted
    );

-- Community owners: delete (soft-delete) their communities
CREATE POLICY "owners_can_delete_communities"
    ON public.communities
    FOR DELETE
    TO authenticated
    USING (
        -- Must be owner and community not already deleted
        EXISTS (
            SELECT 1
            FROM public.profiles pr
            WHERE pr.id = auth.uid()
              AND pr.role = 'owner'::public.app_role
              AND pr.id = communities.owner_id
        )
        AND NOT deleted
    );

-------------------------------------
-- community_members table RLS Policies
--------------------------------------

-- Service role: manage all memberships
CREATE POLICY "service_role_can_manage_memberships"
    ON public.community_members
    FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Members: view memberships
CREATE POLICY "members_can_view_memberships"
    ON public.community_members
    FOR SELECT
    TO authenticated
    USING (
        -- Can see own membership
        profile_id = auth.uid()
        -- Must not be deleted
        AND deleted = false
    );

-- Members: join communities
CREATE POLICY "members_can_join_communities"
    ON public.community_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Must be authenticated
        auth.uid() IS NOT NULL
        -- Must be joining as self
        AND profile_id = auth.uid()
        -- Must not be deleted on creation
        AND deleted = false
        -- Community must exist and not be deleted
        AND EXISTS (
            SELECT 1
            FROM public.communities c
            WHERE c.id = community_id
              AND c.deleted = false
        )
        -- Must not already be a member
        AND NOT EXISTS (
            SELECT 1
            FROM public.community_members cm
            WHERE cm.community_id = community_members.community_id
              AND cm.profile_id = community_members.profile_id
              AND cm.deleted = false
        )
    );

-- Members: update own membership
CREATE POLICY "members_can_update_own_membership"
    ON public.community_members
    FOR UPDATE
    TO authenticated
    USING (
        -- Must be updating own membership
        profile_id = auth.uid()
        -- Must not be deleted
        AND NOT deleted
        -- Must be a member, not an owner
        AND EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'member'::public.app_role
        )
    )
    WITH CHECK (
        -- Must be updating own membership
        profile_id = auth.uid()
        -- Must not be setting to deleted
        AND NOT deleted
        -- Must be a member, not an owner
        AND EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'member'::public.app_role
        )
        -- Community must exist and not be deleted
        AND EXISTS (
            SELECT 1
            FROM public.communities c
            WHERE c.id = community_id
              AND c.deleted = false
        )
    );

-- Members: delete own membership
CREATE POLICY "members_can_delete_own_membership"
    ON public.community_members
    FOR UPDATE
    TO authenticated
    USING (
        -- Must be a member, not an owner
        EXISTS (
            SELECT 1
            FROM public.profiles pr
            WHERE pr.id = auth.uid()
              AND pr.role = 'member'::public.app_role
        )
        -- Must be own membership
        AND profile_id = auth.uid()
        -- Cannot delete already deleted memberships
        AND deleted = false
        -- Community must exist and not be deleted
        AND EXISTS (
            SELECT 1
            FROM public.communities c
            WHERE c.id = community_id
              AND c.deleted = false
        )
    )
    WITH CHECK (
        -- Must be a member, not an owner
        EXISTS (
            SELECT 1
            FROM public.profiles pr
            WHERE pr.id = auth.uid()
              AND pr.role = 'member'::public.app_role
        )
        -- Must be own membership
        AND profile_id = auth.uid()
        -- Must be setting to deleted
        AND deleted = true
    );



-- Function to enforce community update permissions
CREATE OR REPLACE FUNCTION public.enforce_community_update()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    user_role text;
    user_id uuid;
BEGIN
    -- Get current role and user ID
    user_role := auth.role();
    user_id := auth.uid();

    -- Allow service_role to bypass
    IF user_role = 'service_role' THEN
        RETURN NEW;
    END IF;

    -- Only enforce permissions for authenticated users
    IF user_role = 'authenticated' THEN
        -- Check if user is owner and has permission
        IF NOT EXISTS (
            SELECT 1
            FROM public.profiles pr
            WHERE pr.id = user_id
            AND pr.role = 'owner'::public.app_role
            AND (pr.id = OLD.owner_id OR pr.id = NEW.owner_id)
        ) THEN
            RAISE EXCEPTION 'permission denied for table communities'
                USING HINT = 'User does not own this community',
                      ERRCODE = '42501';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for community updates
DROP TRIGGER IF EXISTS enforce_community_update_trigger ON public.communities;
CREATE TRIGGER enforce_community_update_trigger
    BEFORE UPDATE ON public.communities
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_community_update();

-- Function to check if a user is a member of a community
CREATE OR REPLACE FUNCTION public.is_community_member(user_id uuid, target_community_id uuid)
RETURNS boolean
SECURITY DEFINER
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.community_members
        WHERE profile_id = user_id
        AND community_id = target_community_id
        AND NOT deleted
    );
END;
$$;

-- Function to enforce membership update permissions
CREATE OR REPLACE FUNCTION public.enforce_membership_update()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    user_role text;
    user_id uuid;
BEGIN
    -- Get current role and user ID
    user_role := auth.role();
    user_id := auth.uid();

    -- Allow service_role to bypass
    IF user_role = 'service_role' THEN
        RETURN NEW;
    END IF;

    -- Only enforce permissions for authenticated users
    IF user_role = 'authenticated' THEN
        -- User is managing their own membership
        IF NEW.profile_id = user_id THEN
            -- Verify user is a member
            IF NOT EXISTS (
                SELECT 1
                FROM public.profiles p
                WHERE p.id = user_id
                AND p.role = 'member'::public.app_role
            ) THEN
                RAISE EXCEPTION 'permission denied for table community_members'
                    USING HINT = 'Only members can manage their own membership',
                          ERRCODE = '42501';
            END IF;
        ELSE
            -- User must be an owner managing the community
            IF NOT EXISTS (
                SELECT 1
                FROM public.profiles p
                JOIN public.communities c ON c.owner_id = p.id
                WHERE p.id = user_id
                AND p.role = 'owner'::public.app_role
                AND c.id = NEW.community_id
                AND NOT c.deleted
            ) THEN
                RAISE EXCEPTION 'permission denied for table community_members'
                    USING HINT = 'Only owners can manage other memberships',
                          ERRCODE = '42501';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for membership updates
DROP TRIGGER IF EXISTS enforce_membership_update_trigger ON public.community_members;
CREATE TRIGGER enforce_membership_update_trigger
    BEFORE UPDATE ON public.community_members
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_membership_update();

-- Drop old functions and policies if they exist
DROP FUNCTION IF EXISTS public.check_community_owner(uuid);
DROP FUNCTION IF EXISTS public.owns_community(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_owner(uuid);

-- Create helper functions first
CREATE OR REPLACE FUNCTION public.is_owner(user_id uuid)
RETURNS boolean
SECURITY DEFINER
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = user_id
        AND role = 'owner'::public.app_role
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.owns_community(user_id uuid, target_community_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM communities c
        WHERE c.id = target_community_id
        AND c.owner_id = user_id
        AND NOT c.deleted
    );
$$;

-- Drop existing community member policies
DROP POLICY IF EXISTS "members_can_view_memberships" ON public.community_members;
DROP POLICY IF EXISTS "members_can_update_own_membership" ON public.community_members;
DROP POLICY IF EXISTS "members_can_delete_own_membership" ON public.community_members;
DROP POLICY IF EXISTS "owners_can_manage_members" ON public.community_members;

-- Members: view memberships they have access to
CREATE POLICY "members_can_view_memberships"
    ON public.community_members
    FOR SELECT
    TO authenticated
    USING (
        -- Members can see their own memberships
        profile_id = auth.uid()
        OR
        -- Owners can see memberships in their communities
        public.owns_community(auth.uid(), community_id)
    );

-- Members: update their own membership
CREATE POLICY "members_can_update_own_membership"
    ON public.community_members
    FOR UPDATE
    TO authenticated
    USING (
        -- Must be updating their own membership
        profile_id = auth.uid()
    )
    WITH CHECK (
        -- Must be their own membership and not deleted
        profile_id = auth.uid()
        AND NOT deleted
    );

-- Members: delete their own membership
CREATE POLICY "members_can_delete_own_membership"
    ON public.community_members
    FOR UPDATE
    TO authenticated
    USING (
        -- Must be deleting their own membership
        profile_id = auth.uid()
    )
    WITH CHECK (
        -- Must be their own membership and setting deleted to true
        profile_id = auth.uid()
        AND deleted = true
    );

-- Owners: create members in their communities
CREATE POLICY "owners_can_create_members"
    ON public.community_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Must be owner of the community
        public.owns_community(auth.uid(), community_id)
    );

-- Owners: update members in their communities
CREATE POLICY "owners_can_update_members"
    ON public.community_members
    FOR UPDATE
    TO authenticated
    USING (
        -- Must be owner of the community
        public.owns_community(auth.uid(), community_id)
    )
    WITH CHECK (
        -- Must be owner of the community
        public.owns_community(auth.uid(), community_id)
    );

-- Owners: delete members in their communities
CREATE POLICY "owners_can_delete_members"
    ON public.community_members
    FOR UPDATE
    TO authenticated
    USING (
        -- Must be owner of the community
        public.owns_community(auth.uid(), community_id)
    )
    WITH CHECK (
        -- Must be owner of the community and setting deleted to true
        public.owns_community(auth.uid(), community_id)
        AND deleted = true
    );