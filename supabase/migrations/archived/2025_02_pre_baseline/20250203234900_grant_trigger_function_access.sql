-- Grant access to the trigger function
GRANT EXECUTE ON FUNCTION public.handle_auth_user_created() TO service_role, postgres, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.handle_auth_user_created() TO supabase_auth_admin;
