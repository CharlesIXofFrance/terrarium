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
TRUNCATE TABLE public.communities CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

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
  'owner',
  true,
  NOW(),
  NOW(),
  3,
  '{}',
  '{}'
),
(
  '00000000-0000-0000-0000-000000000002',
  'member@test.com',
  'Test',
  'Member',
  'member',
  true,
  NOW(),
  NOW(),
  3,
  '{}',
  '{}'
);

-- Create test community
INSERT INTO public.communities (
  id,
  name,
  slug,
  description,
  owner_id,
  created_at,
  updated_at
) VALUES (
  'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
  'Test Community',
  'test-community',
  'A test community for development',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
);

-- Create test community members
INSERT INTO public.community_members (
  profile_id,
  community_id,
  role,
  status,
  onboarding_completed,
  created_at,
  updated_at
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
  'owner',
  'active',
  true,
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0000-000000000002',
  'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
  'member',
  'active',
  true,
  NOW(),
  NOW()
);
