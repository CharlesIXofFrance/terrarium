-- CONSOLIDATED AUTH SCHEMA MIGRATION
-- Description: Complete auth schema setup for Terrarium multi-tenant platform
-- Version: 2025-01-31
-- Author: Terrarium Team

-- Enable PL/pgSQL if not enabled
CREATE OR REPLACE PROCEDURE verify_extensions()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create extensions if they don't exist
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "citext";
END;
$$;

-- Wrap everything in a transaction
BEGIN;

-- Verify extensions first
CALL verify_extensions();

-- Create required schemas if they don't exist
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS public;

-- Drop existing tables to ensure clean state
DO $$ 
BEGIN
    -- Auth schema tables
    DROP TABLE IF EXISTS auth.mfa_challenges CASCADE;
    DROP TABLE IF EXISTS auth.mfa_factors CASCADE;
    DROP TABLE IF EXISTS auth.refresh_tokens CASCADE;
    DROP TABLE IF EXISTS auth.audit_log_entries CASCADE;
    DROP TABLE IF EXISTS auth.instances CASCADE;
    DROP TABLE IF EXISTS auth.sessions CASCADE;
    DROP TABLE IF EXISTS auth.identities CASCADE;
    DROP TABLE IF EXISTS public.profiles CASCADE;
    DROP TABLE IF EXISTS auth.users CASCADE;
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Error dropping tables: %', SQLERRM;
END $$;

-- Create enum types
DO $$ 
BEGIN
    -- User roles enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM (
            'admin',
            'owner',
            'member',
            'employer'
        );
    END IF;

    -- Auth factor types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_factor_type') THEN
        CREATE TYPE auth.auth_factor_type AS ENUM (
            'totp',
            'webauthn'
        );
    END IF;

    -- Auth factor status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_factor_status') THEN
        CREATE TYPE auth.auth_factor_status AS ENUM (
            'unverified',
            'verified'
        );
    END IF;

    -- Auth level
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'aal_level') THEN
        CREATE TYPE auth.aal_level AS ENUM (
            'aal1',
            'aal2'
        );
    END IF;
EXCEPTION 
    WHEN others THEN
        RAISE NOTICE 'Error creating enum types: %', SQLERRM;
END $$;

-- Create auth.users table (core auth)
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

-- Create auth.identities table (OAuth)
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

-- Create auth.sessions table
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

-- Create auth.refresh_tokens table
CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigserial PRIMARY KEY,
    token varchar(255),
    user_id varchar(255),
    revoked boolean,
    created_at timestamptz,
    updated_at timestamptz,
    parent varchar(255),
    session_id uuid REFERENCES auth.sessions(id) ON DELETE CASCADE,
    CONSTRAINT refresh_tokens_token_unique UNIQUE (token)
);

-- Create auth.audit_log_entries table
CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL PRIMARY KEY,
    payload json,
    ip_address varchar(64) DEFAULT '',
    created_at timestamptz
);

-- Create auth.mfa_factors table
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

-- Create auth.mfa_challenges table
CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL PRIMARY KEY,
    factor_id uuid REFERENCES auth.mfa_factors(id) ON DELETE CASCADE,
    created_at timestamptz,
    verified_at timestamptz,
    ip_address inet
);

-- Create public.profiles table
-- Create communities table first
CREATE TABLE public.communities (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    branding jsonb DEFAULT '{}'::jsonb,
    onboarding_completed boolean DEFAULT false,
    CONSTRAINT slug_length CHECK (char_length(slug) >= 3)
);

-- Create profiles table
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

-- Create community_members table
CREATE TABLE public.community_members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
    role user_role DEFAULT 'member'::user_role,
    status text DEFAULT 'active',
    onboarding_completed boolean DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(profile_id, community_id)
);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS auth.rate_limits (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id uuid NOT NULL,
    entity_type text NOT NULL,
    action text NOT NULL,
    count integer DEFAULT 1,
    window_start timestamptz DEFAULT timezone('utc'::text, now()),
    created_at timestamptz DEFAULT timezone('utc'::text, now()),
    ip_address inet,
    metadata jsonb DEFAULT '{}'::jsonb
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
CREATE INDEX rate_limits_entity_action_idx ON auth.rate_limits (entity_id, action, window_start);
CREATE INDEX rate_limits_ip_action_idx ON auth.rate_limits (ip_address, action, window_start);

-- Create cleanup function for rate limits
CREATE OR REPLACE FUNCTION auth.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM auth.rate_limits
    WHERE window_start < (timezone('utc'::text, now()) - interval '1 day');
END;
$$;

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

-- Create community owner check function
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

-- Create auth user trigger function
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

-- Create auth user trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

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

-- Community policies
DROP POLICY IF EXISTS "Communities are viewable by members" ON communities;
CREATE POLICY "Communities are viewable by members"
ON communities FOR SELECT
TO authenticated
USING (
    public.is_platform_admin()
    OR owner_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM community_members
        WHERE community_id = communities.id
        AND profile_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Community owners can update their communities" ON communities;
CREATE POLICY "Community owners can update their communities"
ON communities FOR UPDATE
TO authenticated
USING (public.is_platform_admin() OR owner_id = auth.uid())
WITH CHECK (public.is_platform_admin() OR owner_id = auth.uid());

-- Community members policies
DROP POLICY IF EXISTS "Members can view their memberships" ON community_members;
CREATE POLICY "Members can view their memberships"
ON community_members FOR SELECT
TO authenticated
USING (
    public.is_platform_admin()
    OR profile_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = community_members.community_id
        AND cm.profile_id = auth.uid()
        AND cm.role IN ('owner'::user_role, 'admin'::user_role)
    )
);

DROP POLICY IF EXISTS "Allow member insert with community context" ON community_members;
CREATE POLICY "Allow member insert with community context"
ON community_members FOR INSERT
TO authenticated
WITH CHECK (
    public.is_platform_admin()
    OR EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = community_id
        AND (c.owner_id = auth.uid() OR public.is_community_owner(c.id))
    )
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Create rollback function
CREATE OR REPLACE PROCEDURE rollback_auth_schema()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Drop tables in reverse order
    DROP TABLE IF EXISTS auth.mfa_challenges CASCADE;
    DROP TABLE IF EXISTS auth.mfa_factors CASCADE;
    DROP TABLE IF EXISTS auth.refresh_tokens CASCADE;
    DROP TABLE IF EXISTS auth.audit_log_entries CASCADE;
    DROP TABLE IF EXISTS auth.instances CASCADE;
    DROP TABLE IF EXISTS auth.sessions CASCADE;
    DROP TABLE IF EXISTS auth.identities CASCADE;
    DROP TABLE IF EXISTS public.profiles CASCADE;
    DROP TABLE IF EXISTS auth.users CASCADE;

    -- Drop functions
    DROP FUNCTION IF EXISTS public.is_platform_admin CASCADE;
    DROP FUNCTION IF EXISTS public.is_community_owner CASCADE;
    DROP FUNCTION IF EXISTS public.handle_auth_user_created CASCADE;

    -- Drop types
    DROP TYPE IF EXISTS public.user_role CASCADE;
    DROP TYPE IF EXISTS auth.auth_factor_type CASCADE;
    DROP TYPE IF EXISTS auth.auth_factor_status CASCADE;
    DROP TYPE IF EXISTS auth.aal_level CASCADE;

    RAISE NOTICE 'Auth schema rollback complete';
END;
$$;

COMMIT;

-- Verify the migration
DO $$ 
DECLARE
    table_count integer;
    policy_count integer;
    function_count integer;
BEGIN
    -- Check if essential tables exist
    SELECT COUNT(*) INTO table_count
    FROM pg_tables 
    WHERE schemaname IN ('auth', 'public')
    AND tablename IN (
        'users', 'profiles', 'communities', 'community_members',
        'identities', 'sessions', 'refresh_tokens', 'mfa_factors'
    );
    
    ASSERT table_count = 8, 
        'Missing essential tables. Expected 8, found ' || table_count;

    -- Check if essential functions exist
    SELECT COUNT(*) INTO function_count
    FROM pg_proc 
    WHERE proname IN (
        'is_platform_admin', 'is_community_owner',
        'handle_auth_user_created', 'cleanup_rate_limits'
    );

    ASSERT function_count = 4,
        'Missing essential functions. Expected 4, found ' || function_count;

    -- Check if RLS is enabled
    ASSERT (SELECT rls_enabled FROM pg_tables WHERE tablename = 'profiles'),
        'RLS not enabled on profiles table';
    ASSERT (SELECT rls_enabled FROM pg_tables WHERE tablename = 'communities'),
        'RLS not enabled on communities table';
    ASSERT (SELECT rls_enabled FROM pg_tables WHERE tablename = 'community_members'),
        'RLS not enabled on community_members table';

    -- Check if policies exist
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'communities', 'community_members');

    ASSERT policy_count >= 6,
        'Missing RLS policies. Expected at least 6, found ' || policy_count;

    -- Check if essential types exist
    ASSERT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'user_role'),
        'user_role type not created';
    ASSERT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'auth_factor_type'),
        'auth_factor_type not created';
    ASSERT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'auth_factor_status'),
        'auth_factor_status not created';

    -- Check if essential indexes exist
    ASSERT EXISTS(
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' 
        AND indexname = 'users_instance_id_email_idx'
    ), 'Missing essential index on auth.users';

    RAISE NOTICE 'Migration verification complete';
    RAISE NOTICE 'Tables verified: %', table_count;
    RAISE NOTICE 'Functions verified: %', function_count;
    RAISE NOTICE 'Policies verified: %', policy_count;
EXCEPTION
    WHEN others THEN
        RAISE EXCEPTION 'Migration verification failed: %', SQLERRM;
END $$;
