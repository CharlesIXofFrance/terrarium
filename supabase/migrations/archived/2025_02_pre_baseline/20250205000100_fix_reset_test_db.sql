-- Fix reset_test_db function to handle DELETE statements properly
CREATE OR REPLACE FUNCTION public.reset_test_db()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Delete test data from all tables with proper WHERE clauses
    DELETE FROM public.community_members WHERE true;
    DELETE FROM public.communities WHERE true;
    DELETE FROM public.profiles WHERE true;
    DELETE FROM auth.users WHERE email IN ('owner@example.com', 'member@example.com');
    
    -- Reset sequences if needed
    ALTER SEQUENCE IF EXISTS public.community_members_id_seq RESTART;
    ALTER SEQUENCE IF EXISTS public.communities_id_seq RESTART;
    
    -- Clear any test-specific settings or state
    DELETE FROM auth.users WHERE email LIKE '%@example.com';
    DELETE FROM auth.identities WHERE email LIKE '%@example.com';
    
    -- Grant necessary permissions
    GRANT EXECUTE ON FUNCTION public.reset_test_db() TO service_role;
    GRANT EXECUTE ON FUNCTION public.reset_test_db() TO postgres;
END;
$$;
