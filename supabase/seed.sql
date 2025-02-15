-- Seed file for Terrarium database
-- This file provides initial test data for development and testing

-- 1. Create storage bucket for community assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'community-assets',
    'community-assets',
    false,
    5242880, -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Reset database state
DO $$
BEGIN
    -- Drop policies first to avoid dependency issues
    DROP POLICY IF EXISTS "Communities are viewable by members" ON public.communities;
    DROP POLICY IF EXISTS "Community owners can update their communities" ON public.communities;
    DROP POLICY IF EXISTS "Members can view their memberships" ON public.community_members;
    DROP POLICY IF EXISTS "Allow member insert with community context" ON public.community_members;
    DROP POLICY IF EXISTS "Profiles are viewable by users who created them." ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
    
    -- Truncate tables in proper order
    TRUNCATE TABLE public.community_members CASCADE;
    TRUNCATE TABLE public.communities CASCADE;
    TRUNCATE TABLE public.profiles CASCADE;
END $$;

-- 3. Create test users in auth schema (for various roles)
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES 
    -- Platform Admin
    ('00000000-0000-0000-0000-000000000001', 'admin@test.com', jsonb_build_object(
        'first_name', 'Platform',
        'last_name', 'Admin',
        'role', 'admin',
        'is_platform_user', true
    )),
    -- Community Owner
    ('00000000-0000-0000-0000-000000000002', 'owner@test.com', jsonb_build_object(
        'first_name', 'Community',
        'last_name', 'Owner',
        'role', 'owner',
        'is_platform_user', false
    )),
    -- Regular Member
    ('00000000-0000-0000-0000-000000000003', 'member@test.com', jsonb_build_object(
        'first_name', 'Regular',
        'last_name', 'Member',
        'role', 'member',
        'last_name', 'Member',
        'role', 'member'
    )),
    -- Employer
    ('00000000-0000-0000-0000-000000000004', 'employer@test.com', jsonb_build_object(
        'first_name', 'Test',
        'last_name', 'Employer',
        'role', 'employer'
    ))
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- 4. Create corresponding profiles using public.app_role
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    onboarding_complete,
    metadata,
    created_at,
    updated_at
) VALUES
    -- Platform Admin
    (
        '00000000-0000-0000-0000-000000000001',
        'admin@test.com',
        'Platform',
        'Admin',
        'admin'::public.app_role,
        true,
        jsonb_build_object('permissions', array['manage_users', 'manage_communities', 'view_analytics']),
        NOW(),
        NOW()
    ),
    -- Community Owner
    (
        '00000000-0000-0000-0000-000000000002',
        'owner@test.com',
        'Community',
        'Owner',
        'owner'::public.app_role,
        true,
        jsonb_build_object('permissions', array['manage_community', 'manage_members', 'view_analytics']),
        NOW(),
        NOW()
    ),
    -- Regular Member
    (
        '00000000-0000-0000-0000-000000000003',
        'member@test.com',
        'Regular',
        'Member',
        'member'::public.app_role,
        true,
        jsonb_build_object('permissions', array['view_content', 'participate_discussions']),
        NOW(),
        NOW()
    ),
    -- Employer
    (
        '00000000-0000-0000-0000-000000000004',
        'employer@test.com',
        'Test',
        'Employer',
        'employer'::public.app_role,
        true,
        jsonb_build_object('permissions', array['post_jobs', 'manage_applications']),
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    onboarding_complete = EXCLUDED.onboarding_complete,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- 5. Insert test communities
INSERT INTO public.communities (
    id,
    name,
    slug,
    description,
    owner_id,
    settings,
    metadata,
    branding,
    onboarding_completed,
    created_at,
    updated_at
) VALUES
    -- Tech Community
    (
        'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
        'Tech Community',
        'tech-community',
        'A community for tech professionals',
        '00000000-0000-0000-0000-000000000002',
        jsonb_build_object('features', array['jobs', 'events', 'discussions'], 'privacy', 'public', 'join_type', 'open'),
        jsonb_build_object('industry', 'Technology', 'size', 'Large', 'location', 'Global'),
        jsonb_build_object('primary_color', '#4F46E5', 'logo_url', null, 'banner_url', null),
        true,
        NOW(),
        NOW()
    ),
    -- Startup Hub
    (
        'a7b2cd1e-0f9e-3d8c-b7a6-18d52c4b3353',
        'Startup Hub',
        'startup-hub',
        'Connect with startup founders and investors',
        '00000000-0000-0000-0000-000000000002',
        jsonb_build_object('features', array['jobs', 'events', 'mentorship'], 'privacy', 'private', 'join_type', 'application'),
        jsonb_build_object('industry', 'Startups', 'size', 'Medium', 'location', 'Global'),
        jsonb_build_object('primary_color', '#10B981', 'logo_url', null, 'banner_url', null),
        true,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    owner_id = EXCLUDED.owner_id,
    updated_at = NOW(),
    settings = EXCLUDED.settings,
    metadata = EXCLUDED.metadata,
    branding = EXCLUDED.branding,
    onboarding_completed = EXCLUDED.onboarding_completed;

-- 6. Create community memberships
INSERT INTO public.community_members (
    profile_id,
    community_id,
    status,
    onboarding_complete,
    metadata,
    created_at,
    updated_at
) VALUES
    -- Tech Community Members
    (
        '00000000-0000-0000-0000-000000000001',
        'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
        'active',
        true,
        jsonb_build_object('joined_reason', 'Platform administration', 'interests', array['community_management', 'tech_trends']),
        NOW(),
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
        'active',
        true,
        jsonb_build_object('joined_reason', 'Community owner', 'interests', array['community_growth', 'member_engagement']),
        NOW(),
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
        'active',
        true,
        jsonb_build_object('joined_reason', 'Professional networking', 'interests', array['job_opportunities', 'skill_development']),
        NOW(),
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
        'active',
        true,
        jsonb_build_object('joined_reason', 'Talent recruitment', 'interests', array['hiring', 'industry_trends']),
        NOW(),
        NOW()
    ),
    -- Startup Hub Members
    (
        '00000000-0000-0000-0000-000000000001',
        'a7b2cd1e-0f9e-3d8c-b7a6-18d52c4b3353',
        'active',
        true,
        jsonb_build_object('joined_reason', 'Platform administration', 'interests', array['community_oversight', 'startup_ecosystem']),
        NOW(),
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'a7b2cd1e-0f9e-3d8c-b7a6-18d52c4b3353',
        'active',
        true,
        jsonb_build_object('joined_reason', 'Community owner', 'interests', array['startup_support', 'investor_relations']),
        NOW(),
        NOW()
    )
ON CONFLICT (profile_id, community_id) DO UPDATE SET
    status = EXCLUDED.status,
    onboarding_complete = EXCLUDED.onboarding_complete,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();
