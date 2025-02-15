-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_created();

-- Update app_role type to include all possible values
DO $$ BEGIN
    -- Drop the type if it exists
    DROP TYPE IF EXISTS public.app_role CASCADE;
    
    -- Recreate with standardized values
    CREATE TYPE public.app_role AS ENUM (
        'owner',    -- Community owner
        'admin',    -- Platform or community admin
        'member',   -- Regular community member
        'employer'  -- Job posting access
    );
END $$;

-- Add role column to profiles if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role app_role NOT NULL DEFAULT 'member';
    END IF;
END $$;

-- Recreate function with standardized role handling
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    default_role app_role;
    user_id uuid;
    user_metadata jsonb;
BEGIN
    -- Get the user ID and metadata
    user_id := NEW.id::uuid;
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    
    -- Standardized role mapping with case-insensitive handling and proper defaults
    -- Convert platform_admin to admin and ensure proper enum values
    -- Reference: Supabase docs on auth hooks and database triggers
    default_role := CASE
        WHEN LOWER(COALESCE(user_metadata->>'role', 'member')) = 'platform_admin' THEN 'admin'::app_role
        WHEN LOWER(COALESCE(user_metadata->>'role', 'member')) = 'admin' THEN 'admin'::app_role
        WHEN LOWER(COALESCE(user_metadata->>'role', 'member')) = 'owner' THEN 'owner'::app_role
        WHEN LOWER(COALESCE(user_metadata->>'role', 'member')) = 'employer' THEN 'employer'::app_role
        ELSE 'member'::app_role
    END;

    -- Create user profile first
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        metadata,
        created_at,
        updated_at,
        role
    ) VALUES (
        user_id,
        NEW.email,
        COALESCE(user_metadata->>'first_name', 'Unknown'),
        COALESCE(user_metadata->>'last_name', ''),
        user_metadata,
        NOW(),
        NOW(),
        default_role
    );

    -- Update auth.users role
    UPDATE auth.users 
    SET role = default_role::text
    WHERE id = user_id;

    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();
