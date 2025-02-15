begin;
select plan(8);

-- Clean up any existing test data
truncate auth.users cascade;

-- Create test users with fixed UUIDs for predictability
insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at)
values 
    ('00000000-0000-0000-0000-000000000001', 'test_owner@example.com', '{"role": "owner", "first_name": "Test", "last_name": "Owner"}'::jsonb, now()),
    ('00000000-0000-0000-0000-000000000002', 'test_member@example.com', '{"role": "member", "first_name": "Test", "last_name": "Member"}'::jsonb, now());

-- Set up test users with proper roles
SELECT setup_test_user('00000000-0000-0000-0000-000000000001', 'test_owner@example.com', 'owner');
SELECT setup_test_user('00000000-0000-0000-0000-000000000002', 'test_member@example.com', 'member');

-- Create test community
insert into public.communities (name, slug, owner_id)
values ('Test Community', 'test-community', '00000000-0000-0000-0000-000000000001');

-- Test 1: Verify initial setup
select ok(
    exists(select 1 from auth.users where email = 'test_owner@example.com'),
    'Owner should be created'
);

-- Test as owner
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
set local request.jwt.claim.email = 'test_owner@example.com';
set local request.jwt.claim.role = 'authenticated';

-- Test 2: Owner can create community
select lives_ok(
    $$
    insert into public.communities (name, slug, owner_id)
    values ('New Community', 'new-community', '00000000-0000-0000-0000-000000000001')
    $$,
    'Owner should be able to create a community'
);

-- Test 3: Owner can update their community
select lives_ok(
    $$
    update public.communities
    set name = 'Updated Test Community'
    where slug = 'test-community'
    $$,
    'Owner should be able to update their community'
);

-- Test 4: Owner can add members
select lives_ok(
    $$
    insert into public.community_members (community_id, profile_id)
    values (
        (select id from public.communities where slug = 'test-community'),
        (select id from public.profiles where email = 'test_member@example.com')
    )
    $$,
    'Owner should be able to add members to their community'
);

-- Test as member
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
set local request.jwt.claim.email = 'test_member@example.com';
set local request.jwt.claim.role = 'authenticated';

-- Test 5: Member cannot create community
SELECT throws_ok(
    $$
    INSERT INTO public.communities (name, slug, owner_id)
    VALUES ('Member Community', 'member-community', '00000000-0000-0000-0000-000000000002')
    $$,
    'new row violates row-level security policy for table "communities"',
    'Member should not be able to create a community'
);

-- Test 6: Member cannot update community
WITH update_attempt AS (
    UPDATE communities
    SET name = 'Hacked Community'
    WHERE slug = 'test-community'
    RETURNING 1
)
SELECT is(
    (SELECT count(*) FROM update_attempt),
    0::bigint,
    'Member should not be able to update community'
);

-- Test 7: Member can update their own membership
select lives_ok(
    $$
    update public.community_members cm
    set deleted = false
    where cm.profile_id = '00000000-0000-0000-0000-000000000002'
    $$,
    'Member should be able to update their own membership'
);

-- Test 8: Member cannot delete other memberships
WITH update_attempt AS (
    UPDATE community_members
    SET deleted = true
    WHERE profile_id = '00000000-0000-0000-0000-000000000001'
    RETURNING 1
)
SELECT is(
    (SELECT count(*) FROM update_attempt),
    0::bigint,
    'Member should not be able to delete other memberships'
);

select * from finish();
rollback;
