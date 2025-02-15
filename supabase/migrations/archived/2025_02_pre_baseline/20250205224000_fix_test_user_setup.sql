/*
---
id: "20250205224000"
title: "Fix test user setup function"
description: >
  Updates the setup_test_user function to match the current profiles schema.
  Changes include:
  - Proper handling of first_name and last_name fields
  - Better error handling for role type casting
  - Improved metadata handling for platform users
affected_tables:
  - "public.profiles"
  - "public.user_roles"
dependencies:
  - "20250205223900_consolidate_role_setup.sql"
rollback: |
  -- Revert to previous version of setup_test_user function
  DROP FUNCTION IF EXISTS public.setup_test_user(uuid, text, text, boolean);
---
*/

-- Create or replace the setup_test_user function with proper role handling
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
DECLARE
    v_role public.app_role;
BEGIN
    -- Cast the role string to enum
    BEGIN
        v_role := p_user_role::public.app_role;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid role: %. Must be one of: owner, admin, member, employer', p_user_role;
    END;

    -- Update auth.users role
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        to_jsonb(p_user_role)
    )
    WHERE id = p_user_id;

    -- Delete existing profile if it exists
    DELETE FROM public.profiles WHERE id = p_user_id;

    -- Insert new profile with platform user metadata if needed
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        onboarding_complete,
        metadata
    )
    VALUES (
        p_user_id,
        p_user_email,
        split_part(p_user_email, '@', 1),  -- Use email prefix as first name for test users
        'Test User',  -- Default last name for test users
        v_role,
        true,
        CASE 
            WHEN p_is_platform_user THEN '{"is_platform_user": true}'::jsonb 
            ELSE '{}'::jsonb 
        END
    );

    -- Delete any existing roles for this user
    DELETE FROM public.user_roles WHERE user_id = p_user_id;

    -- Insert new role
    INSERT INTO public.user_roles (
        user_id,
        email,
        role
    )
    VALUES (
        p_user_id,
        p_user_email,
        v_role
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO postgres;
