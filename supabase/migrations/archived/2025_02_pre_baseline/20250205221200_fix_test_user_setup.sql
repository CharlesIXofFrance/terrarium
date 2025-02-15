/*
---
id: "20250205221200"
title: "Fix test user setup function to handle roles correctly"
description: >
  Updates the setup_test_user function to properly handle user roles and platform access.
  Changes include:
  - Proper role casting and validation
  - Consistent profile creation with first/last name
  - Platform user metadata handling
  - Synchronization with user_roles table
  - Proper security definer settings
affected_tables:
  - "auth.users"
  - "public.profiles"
  - "public.user_roles"
dependencies:
  - "20250205221100_fix_ambiguous_column.sql"
rollback: |
  DROP FUNCTION IF EXISTS public.setup_test_user(uuid, text, text, boolean);
---
*/

-- Drop existing function
DROP FUNCTION IF EXISTS public.setup_test_user;

-- Recreate the function with proper role handling
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
    v_role public.user_role;
BEGIN
    -- Cast the role string to enum
    v_role := p_user_role::public.user_role;

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

    -- Insert new profile
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
        v_role,
        'Test',
        CASE WHEN v_role = 'owner' THEN 'Owner' ELSE 'Member' END,
        true,
        CASE WHEN p_is_platform_user THEN '{"is_platform_user": true}'::jsonb ELSE '{}'::jsonb END
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
