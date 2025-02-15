/*
---
id: "20250207144430"
title: "Update Baseline Migration"
description: >
  Updates the baseline migration to remove RLS policies that are being recreated in later migrations
affected_tables:
  - "public.communities"
  - "public.community_members"
dependencies:
  - "20250207144429"
rollback: |
  -- No rollback needed as this is just removing policies
---
*/

-- Drop all community policies
DROP POLICY IF EXISTS "Service role can manage all communities" ON public.communities;
DROP POLICY IF EXISTS "Anyone can view communities" ON public.communities;
DROP POLICY IF EXISTS "Community owners can create communities" ON public.communities;
DROP POLICY IF EXISTS "Community owners can update their communities" ON public.communities;
DROP POLICY IF EXISTS "Community owners can update community" ON public.communities;

-- Drop all community member policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.community_members;
DROP POLICY IF EXISTS "Service role can manage all memberships" ON public.community_members;
DROP POLICY IF EXISTS "Allow member insert with community context" ON public.community_members;
DROP POLICY IF EXISTS "Members can update their own memberships" ON public.community_members;
DROP POLICY IF EXISTS "Members cannot delete other memberships" ON public.community_members;
DROP POLICY IF EXISTS "Allow member insert" ON public.community_members;
