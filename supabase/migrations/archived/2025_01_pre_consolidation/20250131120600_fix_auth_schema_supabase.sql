-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS auth.mfa_challenges CASCADE;
DROP TABLE IF EXISTS auth.mfa_factors CASCADE;
DROP TABLE IF EXISTS auth.refresh_tokens CASCADE;
DROP TABLE IF EXISTS auth.audit_log_entries CASCADE;
DROP TABLE IF EXISTS auth.instances CASCADE;
DROP TABLE IF EXISTS auth.sessions CASCADE;
DROP TABLE IF EXISTS auth.identities CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS auth.users CASCADE;

-- Create required schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create auth tables if they don't exist
CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    aud varchar(255),
    role varchar(255),
    email varchar(255),
    encrypted_password varchar(255),
    email_confirmed_at timestamptz,
    invited_at timestamptz,
    confirmation_token varchar(255),
    confirmation_sent_at timestamptz,
    recovery_token varchar(255),
    recovery_sent_at timestamptz,
    email_change_token varchar(255),
    email_change varchar(255),
    email_change_sent_at timestamptz,
    last_sign_in_at timestamptz,
    raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
    raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
    is_super_admin bool,
    created_at timestamptz,
    updated_at timestamptz,
    phone text,
    phone_confirmed_at timestamptz,
    phone_change text,
    phone_change_token varchar(255),
    phone_change_sent_at timestamptz,
    confirmed_at timestamptz,
    email_change_confirm_status smallint,
    banned_until timestamptz,
    reauthentication_token varchar(255),
    reauthentication_sent_at timestamptz,
    is_sso_user boolean DEFAULT false,
    deleted_at timestamptz,
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_phone_key UNIQUE (phone)
);

-- Create identities table for OAuth and passwordless logins
CREATE TABLE auth.identities (
    id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    email text GENERATED ALWAYS AS (lower(identity_data->>'email')) STORED,
    CONSTRAINT identities_pkey PRIMARY KEY (provider, id),
    CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create refresh tokens table
CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigserial PRIMARY KEY,
    token varchar(255),
    user_id varchar(255),
    revoked boolean,
    created_at timestamptz,
    updated_at timestamptz,
    parent varchar(255),
    session_id uuid,
    CONSTRAINT refresh_tokens_token_unique UNIQUE (token)
);

-- Create sessions table for managing user sessions
CREATE TABLE auth.sessions (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz,
    updated_at timestamptz,
    factor_id uuid,
    aal aal_level,
    not_after timestamptz,
    refreshed_at timestamptz,
    user_agent text,
    ip text,
    tag text
);

-- Create audit log for security tracking
CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL PRIMARY KEY,
    payload json,
    ip_address varchar(64) DEFAULT '',
    created_at timestamptz
);

-- Create instances table
CREATE TABLE auth.instances (
    id uuid NOT NULL PRIMARY KEY,
    uuid uuid,
    raw_base_config text,
    created_at timestamptz,
    updated_at timestamptz
);

-- Create MFA factors table
CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    friendly_name text,
    factor_type auth_factor_type,
    status auth_factor_status,
    created_at timestamptz,
    updated_at timestamptz,
    secret text
);

-- Create MFA challenges table
CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL PRIMARY KEY,
    factor_id uuid REFERENCES auth.mfa_factors(id) ON DELETE CASCADE,
    created_at timestamptz,
    verified_at timestamptz,
    ip_address inet
);

-- Create public profile table that references auth.users
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    username text UNIQUE,
    first_name text,
    last_name text,
    role user_role DEFAULT 'member'::user_role,
    profile_complete boolean DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    onboarding_step integer DEFAULT 1,
    community_metadata jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Create indexes for better performance
CREATE INDEX users_instance_id_email_idx ON auth.users (instance_id, email);
CREATE INDEX users_instance_id_idx ON auth.users (instance_id);
CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens (instance_id);
CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens (instance_id, user_id);
CREATE INDEX refresh_tokens_token_idx ON auth.refresh_tokens (token);
CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries (instance_id);
CREATE INDEX identities_email_idx ON auth.identities (email);
CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors (user_id);
CREATE INDEX refresh_tokens_session_id_idx ON auth.refresh_tokens (session_id);
CREATE INDEX sessions_user_id_idx ON auth.sessions (user_id);
CREATE INDEX sessions_not_after_idx ON auth.sessions (not_after);

-- Create helper functions with proper security
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check service_role first
  IF auth.role() = 'service_role' THEN
    RETURN true;
  END IF;

  -- Check if user is authenticated
  IF auth.role() != 'authenticated' THEN
    RETURN false;
  END IF;

  -- Check admin role
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'::user_role
  );
END $$;

CREATE OR REPLACE FUNCTION public.is_community_owner(community_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check service_role first
  IF auth.role() = 'service_role' THEN
    RETURN true;
  END IF;

  -- Check if user is authenticated
  IF auth.role() != 'authenticated' THEN
    RETURN false;
  END IF;

  -- Check platform admin
  IF public.is_platform_admin() THEN
    RETURN true;
  END IF;

  -- Check community owner role
  RETURN EXISTS (
    SELECT 1
    FROM community_members cm
    WHERE cm.profile_id = auth.uid()
      AND cm.community_id = community_id
      AND cm.role = 'owner'::user_role
  );
END $$;

-- Create trigger to handle user creation
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  community_data RECORD;
  now_timestamp timestamp with time zone;
  user_metadata jsonb;
  default_role user_role;
  username text;
BEGIN
  -- Get current timestamp and metadata
  now_timestamp := timezone('utc'::text, now());
  user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  
  -- Set default role based on metadata and auth type
  default_role := COALESCE(
    (user_metadata->>'role')::user_role,
    CASE 
      WHEN NEW.encrypted_password IS NOT NULL THEN 
        CASE 
          WHEN user_metadata->>'is_platform_admin' = 'true' THEN 'admin'::user_role
          ELSE 'owner'::user_role
        END
      WHEN user_metadata->>'is_employer' = 'true' THEN 'employer'::user_role
      ELSE 'member'::user_role
    END
  );
  
  -- Generate safe username
  username := COALESCE(
    user_metadata->>'username',
    LOWER(REGEXP_REPLACE(
      SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::text, 1, 8),
      '[^a-zA-Z0-9_]', 
      '_', 
      'g'
    ))
  );
  
  -- Create profile
  BEGIN
    INSERT INTO profiles (
      id,
      email,
      username,
      first_name,
      last_name,
      role,
      profile_complete,
      created_at,
      updated_at,
      onboarding_step,
      community_metadata,
      metadata
    ) VALUES (
      NEW.id,
      NEW.email,
      username,
      COALESCE(user_metadata->>'firstName', 'Unknown'),
      COALESCE(user_metadata->>'lastName', 'User'),
      default_role,
      false,
      now_timestamp,
      now_timestamp,
      1,
      jsonb_build_object(
        'community_id', user_metadata->>'community_id',
        'community_slug', user_metadata->>'community_slug'
      ),
      '{}'::jsonb
    );
    RAISE LOG 'Created profile for user %', NEW.id;
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE LOG 'Profile already exists for user %, updating instead', NEW.id;
      UPDATE profiles 
      SET 
        email = NEW.email,
        username = username,
        updated_at = now_timestamp,
        community_metadata = jsonb_build_object(
          'community_id', user_metadata->>'community_id',
          'community_slug', user_metadata->>'community_slug'
        )
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
      RETURN NEW;
  END;

  -- Handle community membership if community data exists
  IF user_metadata->>'community_slug' IS NOT NULL THEN
    SELECT * INTO community_data
    FROM communities
    WHERE slug = user_metadata->>'community_slug';

    IF community_data.id IS NOT NULL THEN
      BEGIN
        INSERT INTO community_members (
          profile_id,
          community_id,
          role,
          status,
          onboarding_completed,
          created_at,
          updated_at
        ) VALUES (
          NEW.id,
          community_data.id,
          default_role,
          'active',
          false,
          now_timestamp,
          now_timestamp
        );
        RAISE LOG 'Created community membership for user % in community %', 
          NEW.id, community_data.id;
      EXCEPTION 
        WHEN unique_violation THEN
          RAISE LOG 'Membership already exists for user % in community %, updating instead',
            NEW.id, community_data.id;
          UPDATE community_members
          SET 
            role = default_role,
            updated_at = now_timestamp
          WHERE profile_id = NEW.id 
          AND community_id = community_data.id;
        WHEN OTHERS THEN
          RAISE LOG 'Error creating community membership for user %: %', NEW.id, SQLERRM;
      END;
    ELSE
      RAISE LOG 'Community not found for slug: %', user_metadata->>'community_slug';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Profiles are viewable by users who created them." ON profiles;
CREATE POLICY "Profiles are viewable by users who created them."
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR public.is_platform_admin() 
  OR EXISTS (
    SELECT 1 
    FROM community_members cm
    WHERE cm.profile_id = profiles.id
      AND cm.community_id IN (
        SELECT community_id 
        FROM community_members 
        WHERE profile_id = auth.uid()
      )
  )
);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile."
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
