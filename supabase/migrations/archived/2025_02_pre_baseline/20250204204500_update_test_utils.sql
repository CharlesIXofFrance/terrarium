-- Update reset_test_db function to handle app_role and profiles
CREATE OR REPLACE FUNCTION public.reset_test_db()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete test data
  DELETE FROM auth.users WHERE email LIKE '%@example.com';
  DELETE FROM public.communities WHERE slug = 'test-community';
  DELETE FROM public.profiles WHERE email LIKE '%@example.com';
  DELETE FROM public.auth_rate_limits WHERE true;
  DELETE FROM public.auth_logs WHERE true;
  
  -- Reset sequences
  ALTER SEQUENCE IF EXISTS public.communities_id_seq RESTART WITH 1;
  ALTER SEQUENCE IF EXISTS public.auth_rate_limits_id_seq RESTART WITH 1;
  ALTER SEQUENCE IF EXISTS public.auth_logs_id_seq RESTART WITH 1;
  
  -- Verify app_role type exists
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'owner', 'employer', 'member');
  END IF;
  
  -- Verify profiles table exists with correct structure
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL DEFAULT '',
      full_name TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      role app_role NOT NULL DEFAULT 'member'::app_role,
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE INDEX profiles_email_idx ON public.profiles(email);
    CREATE INDEX profiles_role_idx ON public.profiles(role);
  END IF;
  
  -- Ensure RLS is enabled
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  
  -- Recreate RLS policies
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);
    
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
    
  -- Grant necessary permissions
  GRANT USAGE ON SCHEMA public TO authenticated;
  GRANT USAGE ON SCHEMA public TO anon;
  GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
  GRANT SELECT ON public.profiles TO anon;
  
  RAISE LOG 'Test database reset complete';
END;
$$;
