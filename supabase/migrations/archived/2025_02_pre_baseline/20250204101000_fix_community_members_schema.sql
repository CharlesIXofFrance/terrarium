/*
---
affected_tables: []
dependencies: []
description: 'Fix community_members table to use new role schema

  Migrated from legacy format.'
id: 20250204101000_fix_community_members_schema
rollback: '-- To be added

  DROP FUNCTION IF EXISTS function_name CASCADE;'
title: Fix community_members table to use new role schema

---
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.community_members CASCADE;

-- Create community_members table with updated schema
CREATE TABLE public.community_members (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'pending',
    onboarding_step integer DEFAULT 1,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz DEFAULT timezone('utc'::text, now()),
    UNIQUE (community_id, profile_id)
);

-- Add indexes for performance
CREATE INDEX community_members_community_id_idx ON public.community_members(community_id);
CREATE INDEX community_members_profile_id_idx ON public.community_members(profile_id);
CREATE INDEX community_members_status_idx ON public.community_members(status);

-- Enable RLS
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON public.community_members TO authenticated;
GRANT ALL ON public.community_members TO anon;

-- Create policies
CREATE POLICY "Users can read their own community memberships"
    ON public.community_members FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own community memberships"
    ON public.community_members FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Community admins can read all members"
    ON public.community_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Community admins can update all members"
    ON public.community_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );
