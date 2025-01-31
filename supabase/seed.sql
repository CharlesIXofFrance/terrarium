-- Seed file for Terrarium database
-- This ensures we have the necessary initial data for testing

-- Create storage bucket with proper configuration
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

-- Reset database
DO $$ 
BEGIN
    -- Drop all policies first to avoid dependency issues
    DROP POLICY IF EXISTS "Communities are viewable by members" ON public.communities;
    DROP POLICY IF EXISTS "Community owners can update their communities" ON public.communities;
    DROP POLICY IF EXISTS "Members can view their memberships" ON public.community_members;
    DROP POLICY IF EXISTS "Allow member insert with community context" ON public.community_members;
    DROP POLICY IF EXISTS "Profiles are viewable by users who created them." ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

    -- Now truncate tables in correct order
    TRUNCATE TABLE public.community_members CASCADE;
    TRUNCATE TABLE public.communities CASCADE;
    TRUNCATE TABLE public.profiles CASCADE;
END $$;

-- Insert test users first
INSERT INTO auth.users (id, email)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'owner@test.com'),
    ('00000000-0000-0000-0000-000000000002', 'member@test.com')
ON CONFLICT (id) DO NOTHING;

-- Create test profiles
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  profile_complete,
  created_at,
  updated_at,
  onboarding_step,
  community_metadata,
  metadata
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'owner@test.com',
  'Test',
  'Owner',
  'owner'::public.user_role,
  true,
  NOW(),
  NOW(),
  3,
  '{}',
  '{}'::jsonb
),
(
  '00000000-0000-0000-0000-000000000002',
  'member@test.com',
  'Test',
  'Member',
  'member'::public.user_role,
  true,
  NOW(),
  NOW(),
  3,
  '{}',
  '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  profile_complete = EXCLUDED.profile_complete,
  updated_at = NOW(),
  onboarding_step = EXCLUDED.onboarding_step,
  community_metadata = EXCLUDED.community_metadata,
  metadata = EXCLUDED.metadata;

-- Create test community
INSERT INTO public.communities (
  id,
  name,
  slug,
  description,
  owner_id,
  created_at,
  updated_at,
  settings,
  metadata,
  branding,
  onboarding_completed
) VALUES (
  'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
  'Test Community',
  'test-community',
  'A test community for development',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW(),
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  false
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

-- Create test community members
INSERT INTO public.community_members (
  profile_id,
  community_id,
  role,
  status,
  onboarding_completed,
  created_at,
  updated_at,
  metadata
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
  'owner'::public.user_role,
  'active',
  true,
  NOW(),
  NOW(),
  '{}'::jsonb
),
(
  '00000000-0000-0000-0000-000000000002',
  'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
  'member'::public.user_role,
  'active',
  true,
  NOW(),
  NOW(),
  '{}'::jsonb
)
ON CONFLICT (profile_id, community_id) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  onboarding_completed = EXCLUDED.onboarding_completed,
  updated_at = NOW(),
  metadata = EXCLUDED.metadata;
