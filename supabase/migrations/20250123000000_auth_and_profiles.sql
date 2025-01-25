-- Drop existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_auth_user_created();
DROP TABLE IF EXISTS temp_profiles;
DROP TABLE IF EXISTS temporary_profiles;

-- Drop and recreate user_role enum
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'employer');

-- Recreate profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    first_name text,
    last_name text,
    role user_role NOT NULL,
    profile_complete boolean DEFAULT false,
    onboarding_step integer DEFAULT 1,
    community_metadata jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

-- Recreate community_members table
DROP TABLE IF EXISTS public.community_members CASCADE;
CREATE TABLE public.community_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    status text DEFAULT 'active'::text,
    onboarding_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (profile_id, community_id)
);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON TYPE public.user_role TO anon, authenticated, service_role, supabase_auth_admin;
GRANT SELECT ON TABLE public.communities TO anon, authenticated;

-- Create trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  community_data RECORD;
  now_timestamp timestamp with time zone;
  user_metadata jsonb;
  user_role_val text;
BEGIN
  -- Log all state changes for debugging
  RAISE LOG 'Auth trigger fired for user %: OLD(last_sign_in_at=%, confirmed_at=%), NEW(last_sign_in_at=%, confirmed_at=%)',
    NEW.id,
    OLD.last_sign_in_at,
    OLD.confirmed_at,
    NEW.last_sign_in_at,
    NEW.confirmed_at;

  -- Only run when email is verified (either last_sign_in_at or confirmed_at changes from null)
  IF (OLD.confirmed_at IS NOT NULL) OR (NEW.confirmed_at IS NULL) THEN
    RAISE LOG 'Skipping trigger for user % - already processed', NEW.id;
    RETURN NEW;
  END IF;

  -- Get current timestamp
  now_timestamp := timezone('utc'::text, now());

  -- Get user metadata from auth.users
  user_metadata := NEW.raw_user_meta_data;

  -- Log metadata for debugging
  RAISE LOG 'Processing user creation with metadata: %', user_metadata;

  -- Validate metadata
  IF user_metadata IS NULL OR user_metadata = '{}'::jsonb THEN
    RAISE LOG 'No metadata found for user %, skipping profile creation', NEW.id;
    RETURN NEW;
  END IF;

  -- Get and validate role
  user_role_val := user_metadata->>'role';
  IF user_role_val IS NULL THEN
    RAISE LOG 'No role specified in metadata for user %', NEW.id;
    RETURN NEW;
  END IF;

  -- Get and validate community
  IF user_metadata->>'communityId' IS NOT NULL THEN
    SELECT *
    INTO community_data
    FROM communities
    WHERE id = (user_metadata->>'communityId')::uuid;

    IF community_data IS NULL THEN
      RAISE LOG 'Community not found for user %: %', NEW.id, user_metadata->>'communityId';
      RETURN NEW;
    END IF;
  END IF;

  -- Create profile from metadata
  BEGIN
    INSERT INTO profiles (
      id,
      email,
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
      COALESCE(user_metadata->>'firstName', 'Unknown'),
      COALESCE(user_metadata->>'lastName', 'User'),
      user_role_val::user_role,
      false,
      now_timestamp,
      now_timestamp,
      1,
      '{}',
      '{}'
    );
    RAISE LOG 'Created profile for user %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
  END;

  -- Create community membership if community exists
  IF community_data IS NOT NULL THEN
    BEGIN
      INSERT INTO community_members (
        profile_id,
        community_id,
        role,
        status,
        onboarding_completed,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        community_data.id,
        user_role_val::user_role,
        'active',
        false,
        now_timestamp,
        now_timestamp
      );
      RAISE LOG 'Created community membership for user % in community %', NEW.id, community_data.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error creating community membership for user %: %', NEW.id, SQLERRM;
      RETURN NEW;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_auth_user_created();

COMMENT ON TABLE profiles IS 'User profiles for the application.';
