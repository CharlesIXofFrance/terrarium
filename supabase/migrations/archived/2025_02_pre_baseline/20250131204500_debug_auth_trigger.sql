-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_created();

-- Create a logging function
CREATE OR REPLACE FUNCTION public.log_debug(message text)
RETURNS void AS $$
BEGIN
    RAISE NOTICE 'DEBUG: %', message;
END;
$$ LANGUAGE plpgsql;

-- Recreate the function with extensive debugging
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
    debug_info jsonb;
BEGIN
    -- Log the start of the function
    PERFORM log_debug('Starting handle_auth_user_created');
    PERFORM log_debug('NEW.id: ' || NEW.id::text);
    PERFORM log_debug('NEW.email: ' || NEW.email);

    -- Get current timestamp and metadata
    now_timestamp := timezone('utc'::text, now());
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    
    -- Log metadata
    PERFORM log_debug('user_metadata: ' || user_metadata::text);
    
    -- Debug request headers
    BEGIN
        debug_info := jsonb_build_object(
            'request_headers', current_setting('request.headers', true),
            'role', current_setting('role', true),
            'user', current_setting('user', true)
        );
        PERFORM log_debug('Debug Info: ' || debug_info::text);
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_debug('Error getting debug info: ' || SQLERRM);
    END;

    -- Set default role based on metadata
    BEGIN
        default_role := CASE
            WHEN user_metadata->>'role' IS NOT NULL 
            THEN (user_metadata->>'role')::user_role
            ELSE 'member'::user_role
        END;
        PERFORM log_debug('Selected role: ' || default_role::text);
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_debug('Error setting role: ' || SQLERRM);
        RAISE;
    END;

    -- Generate username
    BEGIN
        username := COALESCE(
            user_metadata->>'username',
            LOWER(REGEXP_REPLACE(
                SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::text, 1, 8),
                '[^a-zA-Z0-9_]',
                '_',
                'g'
            ))
        );
        PERFORM log_debug('Generated username: ' || username);
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_debug('Error generating username: ' || SQLERRM);
        RAISE;
    END;

    -- Create profile
    BEGIN
        PERFORM log_debug('Attempting to create profile');
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
        PERFORM log_debug('Profile created successfully');
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_debug('Error creating profile: ' || SQLERRM);
        RAISE;
    END;

    PERFORM log_debug('handle_auth_user_created completed successfully');
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    PERFORM log_debug('Fatal error in handle_auth_user_created: ' || SQLERRM);
    RAISE;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();
