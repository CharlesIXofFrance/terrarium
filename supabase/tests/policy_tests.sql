BEGIN;

-- Plan the tests
SELECT plan(6);

-- Use postgres role for setup
SET LOCAL ROLE postgres;

-- Grant necessary permissions
GRANT ALL ON auth.users TO postgres;
GRANT ALL ON auth.identities TO postgres;
GRANT ALL ON auth.sessions TO postgres;

-- Clean up existing test data
TRUNCATE auth.users CASCADE;
-- This will cascade to:
-- - public.profiles (via trigger)
-- - public.communities (via owner_id FK)
-- - public.community_members (via profile_id FK)

-- Create test users with metadata
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('00000000-0000-0000-0000-000000000001', 'owner@test.com', jsonb_build_object('role', 'owner')),
('00000000-0000-0000-0000-000000000002', 'member@test.com', jsonb_build_object('role', 'member')),
('00000000-0000-0000-0000-000000000003', 'other@test.com', jsonb_build_object('role', 'member'));

-- Wait for trigger to create profiles
SELECT pg_sleep(0.1);

-- Create test community
INSERT INTO public.communities (id, name, slug, owner_id) VALUES
('00000000-0000-0000-0000-000000000001', 'Test Community', 'test-community', '00000000-0000-0000-0000-000000000001');

-- Create test memberships
INSERT INTO public.community_members (id, community_id, profile_id) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

-- Test cases
-- Test 1: Owner can view their community
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" TO '00000000-0000-0000-0000-000000000001';
SELECT ok(
    EXISTS (
        SELECT 1 FROM public.communities WHERE id = '00000000-0000-0000-0000-000000000001'
    ),
    'Owner should be able to view their community'
);

-- Test 2: Owner can update their community
SELECT lives_ok(
    $$
    UPDATE public.communities 
    SET name = 'Updated Test Community'
    WHERE id = '00000000-0000-0000-0000-000000000001'
    $$,
    'Owner should be able to update their community'
);

-- Test 3: Owner can add members
SELECT lives_ok(
    $$
    INSERT INTO public.community_members (community_id, profile_id)
    VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003')
    $$,
    'Owner should be able to add members'
);

-- Test 4: Member cannot update community
SET LOCAL "request.jwt.claim.sub" TO '00000000-0000-0000-0000-000000000002';
WITH update_attempt AS (
    UPDATE communities 
    SET name = 'Hacked Community'
    WHERE id = '00000000-0000-0000-0000-000000000001'
    RETURNING 1
)
SELECT is(
    (SELECT count(*) FROM update_attempt),
    0::bigint,
    'Member should not be able to update community'
);

-- Test 5: Member can update their own membership
SELECT lives_ok(
    $$
    UPDATE public.community_members
    SET deleted = false
    WHERE profile_id = '00000000-0000-0000-0000-000000000002'
    $$,
    'Member should be able to update their own membership'
);

-- Test 6: Member cannot delete other memberships
WITH update_attempt AS (
    UPDATE community_members
    SET deleted = true
    WHERE profile_id = '00000000-0000-0000-0000-000000000003'
    RETURNING 1
)
SELECT is(
    (SELECT count(*) FROM update_attempt),
    0::bigint,
    'Member should not be able to delete other memberships'
);

ROLLBACK;
