/*
---
id: "20250207150328"
title: "Consolidated Community Policies"
description: >
  Consolidates all community and community member policies into a single migration.
  Uses restrictive policies to prevent members from updating communities and
  permissive policies for all other operations.
affected_tables:
  - "public.communities"
  - "public.community_members"
dependencies:
  - "20250206121400"
rollback: |
  DROP POLICY IF EXISTS "Community owners can update their communities" ON public.communities;
  DROP POLICY IF EXISTS "Service role can manage all communities" ON public.communities;
  DROP POLICY IF EXISTS "Anyone can view communities" ON public.communities;
  DROP POLICY IF EXISTS "Community owners can create communities" ON public.communities;
  DROP POLICY IF EXISTS "Allow member insert with community context" ON public.community_members;
  DROP POLICY IF EXISTS "Users can view their own memberships" ON public.community_members;
  DROP POLICY IF EXISTS "Service role can manage all memberships" ON public.community_members;
  DROP POLICY IF EXISTS "Members can update their own memberships" ON public.community_members;
  DROP POLICY IF EXISTS "Members cannot delete other memberships" ON public.community_members;
---
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Service role can manage all communities" ON public.communities;
DROP POLICY IF EXISTS "Anyone can view communities" ON public.communities;
DROP POLICY IF EXISTS "Community owners can create communities" ON public.communities;
DROP POLICY IF EXISTS "Community owners can update their communities" ON public.communities;
DROP POLICY IF EXISTS "Default deny" ON public.communities;
DROP POLICY IF EXISTS "Members cannot update communities" ON public.communities;
DROP POLICY IF EXISTS "Allow member insert with community context" ON public.community_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.community_members;
DROP POLICY IF EXISTS "Service role can manage all memberships" ON public.community_members;
DROP POLICY IF EXISTS "Members can update their own memberships" ON public.community_members;
DROP POLICY IF EXISTS "Members cannot delete other memberships" ON public.community_members;

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Create community policies in correct order
CREATE POLICY "Service role can manage all communities"
    ON public.communities
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anyone can view communities"
    ON public.communities
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Community owners can create communities"
    ON public.communities
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'owner'::public.app_role
        )
    );

CREATE POLICY "Community owners can update their communities"
    ON public.communities
    AS RESTRICTIVE
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'owner'::public.app_role
            AND profiles.id = owner_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'owner'::public.app_role
            AND profiles.id = owner_id
        )
    );

-- Create community member policies
CREATE POLICY "Service role can manage all memberships"
    ON public.community_members
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view their own memberships"
    ON public.community_members
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "Allow member insert with community context"
    ON public.community_members
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.communities c
            WHERE c.id = community_id
            AND c.owner_id = auth.uid()
        )
    );

CREATE POLICY "Members can update their own memberships"
    ON public.community_members
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Members cannot delete other memberships"
    ON public.community_members
    AS PERMISSIVE
    FOR DELETE
    TO authenticated
    USING (profile_id = auth.uid());
