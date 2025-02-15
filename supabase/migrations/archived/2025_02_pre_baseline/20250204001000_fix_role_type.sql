-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_created();

-- Recreate the function with correct role type
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    now_timestamp timestamp with time zone;
    user_metadata jsonb;
    default_role app_role;
    username text;
BEGIN
    -- Get current timestamp and metadata
    now_timestamp := timezone('utc'::text, now());
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

    -- Set default role based on registration source and metadata
    default_role := CASE
        -- Use explicit role from metadata if present
        WHEN user_metadata->>'role' IS NOT NULL 
        THEN (user_metadata->>'role')::app_role
        -- Default to member
        ELSE 'member'::app_role
    END;

    -- Create profile
    INSERT INTO profiles (
        id,
        email,
        role,
        first_name,
        last_name,
        metadata,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        default_role,
        COALESCE(user_metadata->>'full_name', 'Unknown'),
        '',
        user_metadata,
        now_timestamp,
        now_timestamp
    );

    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();
