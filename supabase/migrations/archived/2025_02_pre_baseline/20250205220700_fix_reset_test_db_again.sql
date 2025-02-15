-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.reset_test_db();

-- Create the function with proper permissions
CREATE OR REPLACE FUNCTION public.reset_test_db()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete test data from all tables
    TRUNCATE public.community_members CASCADE;
    TRUNCATE public.communities CASCADE;
    TRUNCATE public.user_roles CASCADE;
    TRUNCATE public.profiles CASCADE;
    
    -- Delete test users from auth schema
    DELETE FROM auth.users WHERE email LIKE '%@example.com';
    DELETE FROM auth.identities WHERE email LIKE '%@example.com';
END;
$$;

-- Reset ownership and grant execute permissions
ALTER FUNCTION public.reset_test_db() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.reset_test_db() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_test_db() TO postgres;
GRANT EXECUTE ON FUNCTION public.reset_test_db() TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_test_db() TO authenticated;
