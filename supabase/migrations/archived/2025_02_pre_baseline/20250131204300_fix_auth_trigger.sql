-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_created();

-- Recreate the function with better role handling
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    now_timestamp timestamp with time zone;
    user_metadata jsonb;
    default_role user_role;
    username text;
BEGIN
    -- Get current timestamp and metadata
    now_timestamp := timezone('utc'::text, now());
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

    -- Set default role based on registration source and metadata
    default_role := CASE
        -- Use explicit role from metadata if present
        WHEN user_metadata->>'role' IS NOT NULL 
        THEN (user_metadata->>'role')::user_role
        -- Default to member
        ELSE 'member'::user_role
    END;

    -- Generate safe username
    username := COALESCE(
        user_metadata->>'username',
        LOWER(REGEXP_REPLACE(
            SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::text, 1, 8),
            '[^a-zA-Z0-9_]',
            '_',
            'g'
        ))
    );

    -- Create profile
    INSERT INTO profiles (
        id,
        email,
        username,
        first_name,
        last_name,
        role,
        profile_complete,
        created_at,
        updated_at,
        onboarding_step,
        community_metadata,
        metadata
    ) VALUES (
        NEW.id,
        NEW.email,
        username,
        COALESCE(user_metadata->>'full_name', 'Unknown'),
        '',
        default_role,
        false,
        now_timestamp,
        now_timestamp,
        1,
        '{}'::jsonb,
        user_metadata
    );

    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();
