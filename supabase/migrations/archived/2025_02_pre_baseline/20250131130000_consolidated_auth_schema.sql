/*
---
affected_tables: []
dependencies: []
description: 'Complete auth schema setup for Terrarium multi-tenant platform

  Migrated from legacy format.'
id: 20250131130000_consolidated_auth_schema
rollback: '-- To be added

  DROP FUNCTION IF EXISTS function_name CASCADE;'
title: Complete auth schema setup for Terrarium multi-tenant platform

---
*/

-- CONSOLIDATED AUTH SCHEMA MIGRATION

-- Migration follows Terrarium standards:
-- 1. Order: Extensions → Schemas → Types → Tables → Functions → Policies
-- 2. Conventions: UUIDs, timestamptz, JSONB metadata
-- 3. Security: RLS, security definer functions, audit logging

-- Wrap everything in a transaction
BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create required schemas if they don't exist
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS public;

-- Clean up public schema (preserving auth schema)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Create public types with proper error handling
DO $$ BEGIN
    -- Create public types if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = 'public'::regnamespace) THEN
        CREATE TYPE public.user_role AS ENUM ('owner', 'admin', 'member', 'employer');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Note: Auth types are managed by Supabase and should not be created here

-- Types are already created above

-- Core auth tables are managed by Supabase
-- We'll enhance them with indexes and any missing columns

-- Note: Auth tables and indexes are managed by Supabase
-- We only need to add any missing columns or additional indexes not provided by default

-- Add any missing columns to auth tables
DO $$ BEGIN
    -- Add any missing columns to auth.users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_schema = 'auth' AND table_name = 'users'
                  AND column_name = 'is_sso_user') THEN
        ALTER TABLE auth.users ADD COLUMN is_sso_user boolean DEFAULT false;
    END IF;

    -- Add any missing columns to auth.sessions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_schema = 'auth' AND table_name = 'sessions'
                  AND column_name = 'not_after') THEN
        ALTER TABLE auth.sessions ADD COLUMN not_after timestamptz;
    END IF;
END $$;
-- Create application tables

-- User profiles
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
            id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email text,
            username text UNIQUE,
            first_name text,
            last_name text,
            avatar_url text,
            role public.user_role NOT NULL DEFAULT 'member',
            profile_complete boolean DEFAULT false,
            onboarding_step integer DEFAULT 1,
            community_metadata jsonb DEFAULT '{}'::jsonb,
            metadata jsonb DEFAULT '{}'::jsonb,
            created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
            updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
        );

        -- Add indexes for performance
        CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
        CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
    END IF;
END $$;

-- Communities
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'communities') THEN
        CREATE TABLE public.communities (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            name text NOT NULL,
            slug text UNIQUE NOT NULL,
            description text,
            logo_url text,
            owner_id uuid NOT NULL REFERENCES auth.users(id),
            settings jsonb DEFAULT '{}'::jsonb,
            metadata jsonb DEFAULT '{}'::jsonb,
            branding jsonb DEFAULT '{}'::jsonb,
            onboarding_completed boolean DEFAULT false,
            created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
            updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
        );

        -- Add indexes for performance
        CREATE INDEX IF NOT EXISTS communities_slug_idx ON public.communities(slug);
        CREATE INDEX IF NOT EXISTS communities_owner_id_idx ON public.communities(owner_id);
    END IF;
END $$;

-- Community members
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'community_members') THEN
        CREATE TABLE public.community_members (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
            profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            role public.user_role NOT NULL DEFAULT 'member',
            status text DEFAULT 'active',
            onboarding_completed boolean DEFAULT false,
            metadata jsonb DEFAULT '{}'::jsonb,
            created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
            updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
            UNIQUE(community_id, profile_id)
        );

        -- Add indexes for performance
        CREATE INDEX IF NOT EXISTS community_members_profile_id_idx ON public.community_members(profile_id);
        CREATE INDEX IF NOT EXISTS community_members_community_role_idx ON public.community_members(community_id, role);
    END IF;
END $$;
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
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
CREATE OR REPLACE FUNCTION public.is_owner(community_id uuid)
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

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END
$$;

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
    request_headers jsonb;
BEGIN
    -- Get current timestamp and metadata
    now_timestamp := timezone('utc'::text, now());
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

    -- Get request headers safely
    BEGIN
        request_headers := current_setting('request.headers', true)::jsonb;
    EXCEPTION WHEN OTHERS THEN
        request_headers := '{}'::jsonb;
    END;

    -- Set default role based on registration source and metadata
    default_role := CASE
        -- Platform registration creates admin by default
        WHEN request_headers->>'origin' LIKE '%platform.%' THEN 'admin'::user_role
        -- Explicit role in metadata
        WHEN user_metadata->>'role' IS NOT NULL THEN (user_metadata->>'role')::user_role
        -- Employer registration
        WHEN user_metadata->>'is_employer' = 'true' THEN 'employer'::user_role
        -- Default to member
        ELSE 'member'::user_role
    END;

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
            username,
            first_name,
            last_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            username,
            COALESCE(user_metadata->>'firstName', 'Unknown'),
            COALESCE(user_metadata->>'lastName', 'User'),
            default_role,
            now_timestamp,
            now_timestamp
        );
        RAISE LOG 'Created profile for user %', NEW.id;
    EXCEPTION
        WHEN unique_violation THEN
            RAISE LOG 'Profile already exists for user %, updating instead', NEW.id;
            UPDATE profiles
            SET
                username = username,
                updated_at = now_timestamp
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

        IF FOUND THEN
            BEGIN
                INSERT INTO community_members (
                    profile_id,
                    community_id,
                    role,
                    created_at,
                    updated_at
                ) VALUES (
                    NEW.id,
                    community_data.id,
                    default_role,
                    now_timestamp,
                    now_timestamp
                );
                RAISE LOG 'Added user % to community %', NEW.id, community_data.id;
            EXCEPTION
                WHEN unique_violation THEN
                    RAISE LOG 'User % already member of community %', NEW.id, community_data.id;
                WHEN OTHERS THEN
                    RAISE LOG 'Error adding user % to community %: %', NEW.id, community_data.id, SQLERRM;
            END;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Create updated_at triggers for all tables
DO $$ BEGIN
    -- Profiles
    DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
    CREATE TRIGGER handle_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();

    -- Communities
    DROP TRIGGER IF EXISTS handle_communities_updated_at ON public.communities;
    CREATE TRIGGER handle_communities_updated_at
        BEFORE UPDATE ON public.communities
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();

    -- Community members
    DROP TRIGGER IF EXISTS handle_community_members_updated_at ON public.community_members;
    CREATE TRIGGER handle_community_members_updated_at
        BEFORE UPDATE ON public.community_members
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
END $$;

-- Create auth user trigger with improved error handling
DO $$ BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_auth_user_created();
END $$;

-- RLS Policies

-- Profiles
CREATE POLICY "Profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Communities
CREATE POLICY "Communities are viewable by everyone."
    ON public.communities FOR SELECT
    USING (true);

CREATE POLICY "Community owners can update their communities."
    ON public.communities FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Platform admins can update any community."
    ON public.communities FOR UPDATE
    USING (is_platform_admin());

-- Community members
CREATE POLICY "Community members are viewable by community members."
    ON public.community_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.community_members
            WHERE community_id = community_members.community_id
            AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Community owners can manage members."
    ON public.community_members FOR ALL
    USING (is_owner(community_id));

CREATE POLICY "Platform admins can manage all members."
    ON public.community_members FOR ALL
    USING (is_platform_admin());




-- Note: Auth table indexes are managed by Supabase

-- Add indexes for application tables

-- Add indexes for profiles
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'profiles' AND indexname = 'profiles_username_idx') THEN
        CREATE INDEX profiles_username_idx ON public.profiles USING btree (username);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'profiles' AND indexname = 'profiles_role_idx') THEN
        CREATE INDEX profiles_role_idx ON public.profiles USING btree (role);
    END IF;
END $$;

-- Add indexes for communities
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'communities' AND indexname = 'communities_slug_idx') THEN
        CREATE INDEX communities_slug_idx ON public.communities USING btree (slug);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'communities' AND indexname = 'communities_owner_id_idx') THEN
        CREATE INDEX communities_owner_id_idx ON public.communities USING btree (owner_id);
    END IF;
END $$;

-- Add indexes for community_members
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'community_members' AND indexname = 'community_members_profile_id_idx') THEN
        CREATE INDEX community_members_profile_id_idx ON public.community_members USING btree (profile_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'community_members' AND indexname = 'community_members_community_role_idx') THEN
        CREATE INDEX community_members_community_role_idx ON public.community_members USING btree (community_id, role);
    END IF;
END $$;

-- Add rate limiting table if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'rate_limits') THEN
        CREATE TABLE auth.rate_limits (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            entity_id uuid NOT NULL,
            entity_type text NOT NULL,
            action text NOT NULL,
            count integer DEFAULT 1,
            window_start timestamptz DEFAULT timezone('utc'::text, now()),
            created_at timestamptz DEFAULT timezone('utc'::text, now()),
            ip_address inet,
            metadata jsonb DEFAULT '{}'::jsonb,
            UNIQUE (entity_id, entity_type, window_start)
        );

        -- Enable RLS
        ALTER TABLE auth.rate_limits ENABLE ROW LEVEL SECURITY;

        -- Allow all authenticated users to read rate limits
        CREATE POLICY "Authenticated users can read rate limits"
            ON auth.rate_limits FOR SELECT
            USING (auth.role() = 'authenticated');

        -- Allow all authenticated users to insert rate limits
        CREATE POLICY "Authenticated users can insert rate limits"
            ON auth.rate_limits FOR INSERT
            WITH CHECK (auth.role() = 'authenticated');

        -- Allow all authenticated users to update rate limits
        CREATE POLICY "Authenticated users can update rate limits"
            ON auth.rate_limits FOR UPDATE
            USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Add indexes for rate_limits
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'auth' AND tablename = 'rate_limits' AND indexname = 'rate_limits_entity_action_idx') THEN
        CREATE INDEX rate_limits_entity_action_idx ON auth.rate_limits (entity_id, action, window_start);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'auth' AND tablename = 'rate_limits' AND indexname = 'rate_limits_ip_action_idx') THEN
        CREATE INDEX rate_limits_ip_action_idx ON auth.rate_limits (ip_address, action, window_start);
    END IF;
END $$;

-- Create cleanup function for rate limits
CREATE OR REPLACE FUNCTION auth.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
BEGIN
    DELETE FROM rate_limits
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
CREATE OR REPLACE FUNCTION public.is_owner(community_id uuid)
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

    -- Set default role based on registration source and metadata
    default_role := CASE
        -- Platform registration creates community owners
        WHEN current_setting('request.headers', true)::jsonb->>'origin' LIKE '%platform.%' THEN 'owner'::user_role
        -- Explicit role in metadata (used for creating platform admins)
        WHEN user_metadata->>'role' = 'admin' THEN 'admin'::user_role
        -- Employer registration
        WHEN user_metadata->>'is_employer' = 'true' THEN 'employer'::user_role
        -- Default to member for community registrations
        ELSE 'member'::user_role
    END;

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

-- Create auth user trigger with improved error handling
DO $$ BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_auth_user_created();
END $$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Create unified RLS policies
-- Profiles
DROP POLICY IF EXISTS "Profile access policy" ON profiles;
CREATE POLICY "Profile access policy"
ON profiles
TO authenticated
USING (
    -- View: Own profile, platform admin, or same community member
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
)
WITH CHECK (
    -- Update: Only own profile or platform admin
    auth.uid() = id
    OR public.is_platform_admin()
);

-- Communities
DROP POLICY IF EXISTS "Community access policy" ON communities;
CREATE POLICY "Community access policy"
ON communities
TO authenticated
USING (
    -- View: Platform admin, owner, or member
    public.is_platform_admin()
    OR owner_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM community_members
        WHERE community_id = communities.id
        AND profile_id = auth.uid()
    )
)
WITH CHECK (
    -- Update: Only owner or platform admin
    public.is_platform_admin()
    OR owner_id = auth.uid()
);

-- Community members
DROP POLICY IF EXISTS "Community member access policy" ON community_members;
CREATE POLICY "Community member access policy"
ON community_members
TO authenticated
USING (
    -- View: Platform admin, member, or community owner
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
        AND (c.owner_id = auth.uid() OR public.is_owner(c.id))
    )
);

-- Grant Supabase standard permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Create rollback function for application schema
CREATE OR REPLACE PROCEDURE rollback_auth_schema()
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Drop application tables
    DROP TABLE IF EXISTS public.community_members CASCADE;
    DROP TABLE IF EXISTS public.communities CASCADE;
    DROP TABLE IF EXISTS public.profiles CASCADE;

    -- Drop application functions
    DROP FUNCTION IF EXISTS public.is_platform_admin CASCADE;
    DROP FUNCTION IF EXISTS public.is_owner CASCADE;
    DROP FUNCTION IF EXISTS public.handle_auth_user_created CASCADE;
    DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;

    -- Drop application types
    DROP TYPE IF EXISTS public.user_role CASCADE;

    RAISE NOTICE 'Application schema rollback complete';
END;
$$;

COMMIT;

-- Verify the migration with improved checks
DO $$
DECLARE
    table_count integer;
    policy_count integer;
    function_count integer;
BEGIN
    -- Check if essential tables exist
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
        'profiles', 'communities', 'community_members'
    );

    ASSERT table_count = 3,
        'Missing essential application tables. Expected 3, found ' || table_count;

    -- Check if essential functions exist with security definer
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
    AND proname IN (
        'is_platform_admin', 'is_owner',
        'handle_auth_user_created', 'handle_updated_at'
    )
    AND prosecdef = true;

    ASSERT function_count = 4,
        'Missing security definer functions. Expected 4, found ' || function_count;

    -- Check if RLS is enabled on required tables
    ASSERT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'profiles'
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    ), 'RLS not enabled on profiles table';

    ASSERT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'communities'
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    ), 'RLS not enabled on communities table';

    ASSERT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'community_members'
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    ), 'RLS not enabled on community_members table';

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

    -- Check if essential indexes exist
    ASSERT EXISTS(
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND indexname = 'profiles_username_idx'
    ), 'Missing username index on profiles';

    ASSERT EXISTS(
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'communities'
        AND indexname = 'communities_slug_idx'
    ), 'Missing slug index on communities';

    RAISE NOTICE 'Migration verification complete';
    RAISE NOTICE 'Application tables verified: %', table_count;
    RAISE NOTICE 'Security definer functions verified: %', function_count;
    RAISE NOTICE 'Unified policies verified: %', policy_count;
EXCEPTION
    WHEN others THEN
        RAISE EXCEPTION 'Migration verification failed: %', SQLERRM;
END $$;
