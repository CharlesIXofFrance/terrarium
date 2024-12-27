-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create enum types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'factor_type') THEN
    CREATE TYPE auth.factor_type AS ENUM ('totp', 'webauthn');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'factor_status') THEN
    CREATE TYPE auth.factor_status AS ENUM ('unverified', 'verified');
  END IF;
END$$;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id uuid,
  email citext,
  phone text,
  encrypted_password text,
  email_confirmed_at timestamptz,
  phone_confirmed_at timestamptz,
  confirmation_token text,
  confirmation_sent_at timestamptz,
  recovery_token text,
  recovery_sent_at timestamptz,
  email_change_token text,
  email_change citext,
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz,
  updated_at timestamptz,
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_phone_key UNIQUE (phone)
);

-- Create identities table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.identities (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_data jsonb,
  provider text,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);

-- Create audit log entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  payload json,
  created_at timestamptz,
  ip_address varchar(64)
);

-- Create instances table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.instances (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  uuid uuid,
  raw_base_config text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Create refresh tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  id bigserial PRIMARY KEY,
  token text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  revoked boolean,
  created_at timestamptz,
  updated_at timestamptz,
  parent text
);

-- Create schema migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.schema_migrations (
  version text PRIMARY KEY,
  statements text[],
  name text
);

-- Create SSO providers table first (since it's referenced by other tables)
CREATE TABLE IF NOT EXISTS auth.sso_providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id text UNIQUE,
  created_at timestamptz,
  updated_at timestamptz
);

-- Now create SSO domains table
CREATE TABLE IF NOT EXISTS auth.sso_domains (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sso_provider_id uuid REFERENCES auth.sso_providers(id) ON DELETE CASCADE,
  domain text UNIQUE,
  created_at timestamptz,
  updated_at timestamptz
);

-- Create SAML providers table
CREATE TABLE IF NOT EXISTS auth.saml_providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sso_provider_id uuid NOT NULL REFERENCES auth.sso_providers(id) ON DELETE CASCADE,
  entity_id text NOT NULL UNIQUE,
  metadata_xml text NOT NULL,
  metadata_url text,
  attribute_mapping jsonb,
  created_at timestamptz,
  updated_at timestamptz
);

-- Create SAML relay states table
CREATE TABLE IF NOT EXISTS auth.saml_relay_states (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sso_provider_id uuid NOT NULL REFERENCES auth.sso_providers(id) ON DELETE CASCADE,
  request_id text NOT NULL,
  for_email text,
  redirect_to text,
  from_ip_address inet,
  created_at timestamptz,
  updated_at timestamptz,
  flow_state jsonb
);

-- Create MFA factors table
CREATE TABLE IF NOT EXISTS auth.mfa_factors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  friendly_name text,
  factor_type auth.factor_type,
  status auth.factor_status,
  created_at timestamptz,
  updated_at timestamptz,
  secret text
);

-- Create MFA challenges table
CREATE TABLE IF NOT EXISTS auth.mfa_challenges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  factor_id uuid REFERENCES auth.mfa_factors(id) ON DELETE CASCADE,
  created_at timestamptz,
  verified_at timestamptz,
  ip_address inet
);

-- Create MFA AMPL challenges table
CREATE TABLE IF NOT EXISTS auth.mfa_amr_claims (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL,
  created_at timestamptz,
  updated_at timestamptz,
  authentication_method text NOT NULL,
  CONSTRAINT amr_id_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method)
);

-- Grant necessary permissions to service_role
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO service_role;

-- Create necessary indexes
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users(instance_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users(email);
CREATE INDEX IF NOT EXISTS users_phone_idx ON auth.users(phone);
CREATE INDEX IF NOT EXISTS identities_user_id_idx ON auth.identities(user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx ON auth.refresh_tokens(token);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON auth.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS sso_domains_sso_provider_id_idx ON auth.sso_domains(sso_provider_id);
CREATE INDEX IF NOT EXISTS saml_providers_sso_provider_id_idx ON auth.saml_providers(sso_provider_id);
CREATE INDEX IF NOT EXISTS mfa_factors_user_id_idx ON auth.mfa_factors(user_id);
CREATE INDEX IF NOT EXISTS mfa_challenges_factor_id_idx ON auth.mfa_challenges(factor_id);

-- Add RLS policies
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data." 
ON auth.users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Service role can manage all user data." 
ON auth.users FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Add storage-related auth policies
CREATE POLICY "Authenticated users can access storage based on role"
ON auth.users FOR SELECT
TO authenticated
USING (
    -- Allow access if user has the required role
    (raw_app_meta_data->>'role' = 'community_admin' OR raw_app_meta_data->>'role' = 'member')
    AND
    -- Ensure user has a valid session
    auth.uid() = id
);

-- Create function to check user role
CREATE OR REPLACE FUNCTION auth.check_user_role(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = user_id
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auth.check_user_role TO authenticated;
