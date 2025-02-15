-- Grant access to extensions schema
GRANT USAGE ON SCHEMA extensions TO supabase_auth_admin, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO supabase_auth_admin, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA extensions TO supabase_auth_admin, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA extensions TO supabase_auth_admin, service_role;
