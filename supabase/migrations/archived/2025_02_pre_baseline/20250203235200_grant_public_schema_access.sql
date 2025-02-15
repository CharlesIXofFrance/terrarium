-- Grant access to the public schema for auth admin and service role
GRANT USAGE ON SCHEMA public TO supabase_auth_admin, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO supabase_auth_admin, service_role;
