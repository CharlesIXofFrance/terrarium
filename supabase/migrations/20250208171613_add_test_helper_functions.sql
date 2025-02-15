--! Previous: 20250207150333_consolidated_community_policies_v6
--! Hash: 71e94a2c-2f10-4085-8ace-a4c07b4bec0e

--! Message: Add test helper functions for e2e testing

-- Create truncate_all_test_tables function for e2e tests
CREATE OR REPLACE FUNCTION public.truncate_all_test_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Truncate all tables in the correct order to handle foreign key constraints
    TRUNCATE TABLE auth.users CASCADE;
    
    -- Grant necessary permissions
    GRANT EXECUTE ON FUNCTION public.truncate_all_test_tables() TO service_role;
    GRANT EXECUTE ON FUNCTION public.truncate_all_test_tables() TO postgres;
END;
$$;
