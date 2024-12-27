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

-- Insert test data
INSERT INTO auth.users (id, email)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'test@example.com'),
    ('11111111-1111-1111-1111-111111111111', 'test2@example.com')
ON CONFLICT (id) DO NOTHING;

-- Create profiles directly
INSERT INTO public.profiles (id, full_name, email, role)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Test User', 'test@example.com', 'member'),
    ('11111111-1111-1111-1111-111111111111', 'Test User 2', 'test2@example.com', 'member')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.communities (id, name, slug, description, owner_id)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Test Community',
    'test-community',
    'A test community',
    '00000000-0000-0000-0000-000000000000'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.community_members (community_id, profile_id, role)
VALUES 
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'admin'),
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'member')
ON CONFLICT (community_id, profile_id) DO NOTHING;
