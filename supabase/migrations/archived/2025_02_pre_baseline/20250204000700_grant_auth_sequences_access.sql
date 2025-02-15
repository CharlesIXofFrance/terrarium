-- Grant access to auth sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin, service_role;
