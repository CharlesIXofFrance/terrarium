-- Create app_role type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member', 'employer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    default_role public.app_role;
    debug_msg text;
BEGIN
    -- Debug logging
    debug_msg := format('Auth trigger executing for user %s with metadata %s', NEW.id, NEW.raw_user_meta_data::text);
    raise log '%', debug_msg;

    -- Set default role based on registration source and metadata
    default_role := CASE
        WHEN NEW.raw_user_meta_data->>'role' IS NOT NULL 
        THEN (NEW.raw_user_meta_data->>'role')::public.app_role
        ELSE 'member'::public.app_role
    END;

    -- Debug logging
    debug_msg := format('Setting role to %s', default_role);
    raise log '%', debug_msg;

    -- Create profile
    INSERT INTO public.profiles (
        id,
        email,
        role,
        first_name,
        last_name,
        avatar_url,
        username
    )
    VALUES (
        NEW.id,
        NEW.email,
        default_role,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'username'
    );

    -- Update auth.users role
    UPDATE auth.users 
    SET role = default_role::public.app_role::text 
    WHERE id = NEW.id;

    -- Debug logging
    debug_msg := format('Profile created for user %s with role %s', NEW.id, default_role);
    raise log '%', debug_msg;

    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Debug logging
        debug_msg := format('Error in auth trigger: %s', SQLERRM);
        raise log '%', debug_msg;
        RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();
