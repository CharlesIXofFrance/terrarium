/*
---
id: "20250205221100"
title: "Fix ambiguous column in test user setup"
description: >
  Fixes ambiguous column references in the setup_test_user function by:
  - Using explicit type casting for roles
  - Implementing proper UPSERT patterns for profiles and user_roles
  - Adding proper security definer and search path settings
  - Granting appropriate permissions to roles
affected_tables:
  - "auth.users"
  - "public.profiles"
  - "public.user_roles"
dependencies:
  - "20250205221000_fix_role_casting.sql"
rollback: |
  DROP FUNCTION IF EXISTS public.setup_test_user(uuid, text, text, boolean);
---
*/

-- Drop existing function
DROP FUNCTION IF EXISTS public.setup_test_user(uuid, text, text, boolean);

-- Create function to properly set up test users with roles
CREATE OR REPLACE FUNCTION public.setup_test_user(
    p_user_id uuid,
    p_user_email text,
    p_user_role text,
    p_is_platform_user boolean DEFAULT false
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update auth.users role
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        to_jsonb(p_user_role)
    )
    WHERE id = p_user_id;

    -- Upsert profile
    INSERT INTO public.profiles (
        id,
        email,
        role,
        first_name,
        last_name,
        onboarding_complete,
        metadata
    )
    VALUES (
        p_user_id,
        p_user_email,
        p_user_role::app_role,
        'Test',
        CASE WHEN p_user_role = 'owner' THEN 'Owner' ELSE 'Member' END,
        true,
        CASE WHEN p_is_platform_user THEN '{"is_platform_user": true}'::jsonb ELSE '{}'::jsonb END
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        role = EXCLUDED.role,
        metadata = EXCLUDED.metadata;

    -- Upsert user_roles
    INSERT INTO public.user_roles (
        user_id,
        email,
        role
    )
    VALUES (
        p_user_id,
        p_user_email,
        p_user_role::app_role
    )
    ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO postgres;
