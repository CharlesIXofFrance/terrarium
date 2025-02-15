begin;
select plan(4);

-- Clean up any existing test data
truncate auth.users cascade;

-- Create test users with fixed UUIDs
insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at)
values 
    ('00000000-0000-0000-0000-000000000001', 'admin@test.com', '{"role": "admin"}'::jsonb, now()),
    ('00000000-0000-0000-0000-000000000002', 'owner@test.com', '{"role": "owner"}'::jsonb, now()),
    ('00000000-0000-0000-0000-000000000003', 'member@test.com', '{"role": "member"}'::jsonb, now()),
    ('00000000-0000-0000-0000-000000000004', 'employer@test.com', '{"role": "employer"}'::jsonb, now());

-- Test 1: Email users exist
select ok(
    exists(select 1 from auth.users where email like '%@%' limit 1),
    'Email users should exist'
);

-- Test 2: Profile email matches auth email
select results_eq(
    'SELECT COUNT(*) FROM auth.users u JOIN public.profiles p ON u.id = p.id WHERE u.email = p.email',
    ARRAY[4::bigint],
    'Profile emails should match auth emails'
);

-- Test 3: Email format
select ok(
    not exists(select 1 from auth.users where email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    'All emails should be valid format'
);

-- Test 4: Email verification
select ok(
    exists(select 1 from auth.users where email_confirmed_at is not null),
    'Some users should have confirmed emails'
);

-- Finish the tests
SELECT * FROM finish();
ROLLBACK;
