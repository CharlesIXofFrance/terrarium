BEGIN;

-- Plan the tests
SELECT plan(6);

-- Create a test user with email verification request
WITH new_user AS (
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        raw_user_meta_data,
        raw_app_meta_data,
        aud,
        role,
        created_at,
        updated_at,
        confirmation_token,
        email_change_confirm_status,
        is_sso_user,
        is_anonymous
    ) VALUES (
        '00000000-0000-0000-0000-000000000098',
        '00000000-0000-0000-0000-000000000000',
        'verify@test.com',
        crypt('password123', gen_salt('bf')), -- Proper password hashing
        jsonb_build_object(
            'first_name', 'Verify',
            'last_name', 'Test',
            'role', 'member'
        ),
        jsonb_build_object(
            'provider', 'email',
            'providers', ARRAY['email']::text[]
        ),
        'authenticated',
        'authenticated',
        NOW(),
        NOW(),
        encode(gen_random_bytes(32), 'base64'),
        0,
        false,
        false
    ) RETURNING *
)
SELECT true, 'Inserting test user';

SELECT pg_sleep(0.1);

-- Test user database role and app role
SELECT ok(
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = '00000000-0000-0000-0000-000000000098'
        AND role = 'authenticated' -- This is the Supabase database role
        AND raw_user_meta_data->>'role' = 'member' -- This is our app-specific role
    ),
    'User should have authenticated database role and member app role'
);

-- Test identity creation
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000098',
    '00000000-0000-0000-0000-000000000098',
    jsonb_build_object('sub', '00000000-0000-0000-0000-000000000098', 'email', 'verify@test.com'),
    'email',
    'verify@test.com',
    NOW(),
    NOW()
);

SELECT ok(
    EXISTS (
        SELECT 1 FROM auth.identities
        WHERE user_id = '00000000-0000-0000-0000-000000000098'
        AND provider = 'email'
    ),
    'User identity should be created'
);

-- Test profile creation
SELECT ok(
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = '00000000-0000-0000-0000-000000000098'
    ),
    'Profile should be created'
);

-- Test metadata handling
SELECT ok(
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = '00000000-0000-0000-0000-000000000098'
        AND raw_user_meta_data->>'first_name' = 'Verify'
        AND raw_user_meta_data->>'last_name' = 'Test'
    ),
    'User metadata should be properly stored'
);

-- Simulate email verification with token
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    confirmation_token = NULL,
    confirmation_sent_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000098';

-- Test email verification
SELECT ok(
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = '00000000-0000-0000-0000-000000000098'
        AND email_confirmed_at IS NOT NULL
        AND confirmation_token IS NULL
    ),
    'Email should be verified and token cleared'
);

-- Test user role in profiles
SELECT ok(
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = '00000000-0000-0000-0000-000000000098'
        AND role = 'member'::public.app_role
    ),
    'User role should be set in profile'
);

-- Clean up
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000098';

-- Finish the tests
SELECT * FROM finish();
ROLLBACK;
