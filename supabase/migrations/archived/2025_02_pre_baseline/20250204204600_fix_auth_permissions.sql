-- Grant additional permissions needed for auth schema
DO $$ BEGIN
  -- Grant usage on auth schema
  GRANT USAGE ON SCHEMA auth TO authenticated;
  GRANT USAGE ON SCHEMA auth TO anon;
  
  -- Grant select on auth.users to authenticated users (needed for profile queries)
  GRANT SELECT ON auth.users TO authenticated;
  GRANT SELECT ON auth.users TO anon;
  
  -- Grant execute on auth functions
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon;
  
  -- Grant usage on public schema (in case it was missed)
  GRANT USAGE ON SCHEMA public TO authenticated;
  GRANT USAGE ON SCHEMA public TO anon;
  
  -- Grant access to profiles table
  GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
  GRANT SELECT ON public.profiles TO anon;
  
  -- Grant access to user roles view if it exists
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'user_roles') THEN
    GRANT SELECT ON public.user_roles TO authenticated;
    GRANT SELECT ON public.user_roles TO anon;
  END IF;
  
  -- Grant access to role-related types
  GRANT USAGE ON TYPE public.app_role TO authenticated;
  GRANT USAGE ON TYPE public.app_role TO anon;
END $$;
