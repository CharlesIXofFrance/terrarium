BEGIN;

\ir helpers/auth_helpers.sql

-- Create test schema and functions
CREATE SCHEMA IF NOT EXISTS tests;

CREATE OR REPLACE FUNCTION tests.create_supabase_user(
  email text,
  password text
) RETURNS uuid AS $$
DECLARE
  uid uuid;
BEGIN
  uid := gen_random_uuid();

  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  )
  VALUES (
    uid,
    '00000000-0000-0000-0000-000000000000',
    email,
    crypt(password, gen_salt('bf')),
    now(),
    now(),
    '{"provider": "email"}',
    '{"role": "member"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

  RETURN uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Plan the tests
SELECT plan(3);

-- Test 1: Create and verify user
SELECT lives_ok(
  $$ SELECT tests.create_supabase_user('test1@example.com', 'password123') $$,
  'Should create user successfully'
);

-- Test 2: Check user metadata
SELECT is(
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE email = 'test1@example.com'),
  'member',
  'Should set default role to member'
);

-- Test 3: Check user role
SELECT is(
  (SELECT role FROM auth.users WHERE email = 'test1@example.com'),
  'authenticated',
  'Should set authenticated role'
);

-- Clean up
DELETE FROM auth.users WHERE email LIKE 'test%@example.com';

-- Finish the tests
SELECT * FROM finish();
ROLLBACK;
