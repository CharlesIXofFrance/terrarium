-- Drop existing function
DROP FUNCTION IF EXISTS public.setup_test_user(uuid, text, text, boolean);

-- Create function to properly set up test users with roles
CREATE OR REPLACE FUNCTION public.setup_test_user(
    user_id uuid,
    user_email text,
    user_role text,
    is_platform_user boolean DEFAULT false
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
        to_jsonb(user_role)
    )
    WHERE id = user_id;

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
        user_id,
        user_email,
        user_role::app_role,
        'Test',
        CASE WHEN user_role = 'owner' THEN 'Owner' ELSE 'Member' END,
        true,
        CASE WHEN is_platform_user THEN '{"is_platform_user": true}'::jsonb ELSE '{}'::jsonb END
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
        user_id,
        user_email,
        user_role::app_role
    )
    ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO postgres;
