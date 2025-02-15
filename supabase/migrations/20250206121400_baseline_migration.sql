/*
---
id: "20250206121400"
title: "Baseline Migration for MVP"
description: >
  Consolidated baseline migration that represents the current stable state of the database.
  This migration includes all stable schema definitions for authentication, RBAC, and core tables.
  It establishes:
  - Core schema definitions for authentication and profiles
  - Role-based access control (RBAC)
  - Row Level Security (RLS) policies
  - Rate limiting configurations
  - Test utilities and helper functions
affected_tables:
  - "auth.users"
  - "public.profiles"
  - "public.user_roles"
  - "public.community_members"
  - "public.app_role"
dependencies: []
rollback: |
  DROP SCHEMA IF EXISTS public CASCADE;
  DROP TYPE IF EXISTS public.app_role CASCADE;
  -- Note: auth schema modifications should be handled with care
---
*/

-- Only drop schema in development/test environments
DO $$
BEGIN
    IF current_database() LIKE '%test%' OR current_database() LIKE '%dev%' THEN
        DROP SCHEMA IF EXISTS public CASCADE;
        CREATE SCHEMA public;
    END IF;
END $$;

-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS public;

-- Grant necessary permissions
GRANT ALL ON SCHEMA public TO postgres, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;

-- Ensure required extensions
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EXCEPTION
    WHEN insufficient_privilege THEN
        NULL; -- Extensions already exist or managed by Supabase
END $$;

-- Create enum type for user roles if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM (
            'owner',
            'admin',
            'member',
            'employer'
        );
    END IF;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE NOT NULL,
    first_name text,
    last_name text,
    role public.app_role NOT NULL DEFAULT 'member'::public.app_role,
    onboarding_complete boolean NOT NULL DEFAULT false,
    email_verified boolean NOT NULL DEFAULT false,
    last_sign_in_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_roles table (used for audit and backup of role information)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    settings jsonb DEFAULT jsonb_build_object(
        'auth', jsonb_build_object(
            'allowed_domains', '[]'::jsonb,
            'redirect_urls', '[]'::jsonb,
            'require_email_verification', true,
            'callback_url', null,
            'login_options', jsonb_build_object(
                'email', true,
                'magic_link', true,
                'oauth', jsonb_build_object(
                    'google', false,
                    'github', false
                )
            )
        ),
        'features', jsonb_build_object(
            'jobs', true,
            'events', true,
            'discussions', true
        )
    ),
    metadata jsonb DEFAULT '{}'::jsonb,
    branding jsonb DEFAULT '{}'::jsonb,
    onboarding_completed boolean DEFAULT false,
    onboarding_step smallint DEFAULT 1,
    deleted boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(name),
    UNIQUE(slug),
    CONSTRAINT onboarding_step_check CHECK (onboarding_step BETWEEN 1 AND 3)
);

-- Create community_members table
CREATE TABLE IF NOT EXISTS public.community_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'member'::public.app_role,
    status text NOT NULL DEFAULT 'pending',
    onboarding_complete boolean NOT NULL DEFAULT false,
    last_active_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    deleted boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(profile_id, community_id),
    CONSTRAINT status_check CHECK (status IN ('pending', 'active', 'inactive', 'blocked'))
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles USING btree (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role);
CREATE INDEX IF NOT EXISTS idx_communities_slug ON public.communities USING btree (slug);
CREATE INDEX IF NOT EXISTS idx_communities_owner ON public.communities USING btree (owner_id);
CREATE INDEX IF NOT EXISTS idx_communities_deleted ON public.communities USING btree (deleted) WHERE deleted = true;
CREATE INDEX IF NOT EXISTS idx_community_members_status ON public.community_members USING btree (status);
CREATE INDEX IF NOT EXISTS idx_community_members_profile_community ON public.community_members USING btree (profile_id, community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON public.community_members USING btree (community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_deleted ON public.community_members USING btree (deleted) WHERE deleted = true;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Profile RLS Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
    ON public.profiles FOR ALL
    USING (auth.role() = 'service_role');

-- User Roles RLS Policies
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all roles"
    ON public.user_roles FOR ALL
    USING (auth.role() = 'service_role');

-- Note: Communities and community_members policies are managed in a separate migration

-- Function to safely handle role casting with validation
CREATE OR REPLACE FUNCTION public.safe_cast_role(role_text text)
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validate role exists in enum
    IF role_text IS NULL OR NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = 'public.app_role'::regtype 
        AND enumlabel = role_text
    ) THEN
        RETURN 'member'::public.app_role; -- Default to member for invalid roles
    END IF;
    
    RETURN role_text::public.app_role;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'member'::public.app_role; -- Default to member on any error
END;
$$;

-- Auth trigger for user creation
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_role public.app_role;
    v_raw_user_meta_data jsonb;
BEGIN
    -- Get role from metadata with safe casting
    v_raw_user_meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    v_role := public.safe_cast_role(v_raw_user_meta_data->>'role');

    -- Create profile
    INSERT INTO public.profiles (
        id,
        email,
        role,
        first_name,
        last_name,
        metadata,
        email_verified
    )
    VALUES (
        NEW.id,
        NEW.email,
        v_role,
        COALESCE(v_raw_user_meta_data->>'first_name', ''),
        COALESCE(v_raw_user_meta_data->>'last_name', ''),
        v_raw_user_meta_data,
        NEW.email_confirmed_at IS NOT NULL
    )
    ON CONFLICT (id) DO NOTHING;

    -- Create user role entry for audit
    INSERT INTO public.user_roles (user_id, email, role)
    VALUES (NEW.id, NEW.email, v_role)
    ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role,
        updated_at = now();

    RETURN NEW;
END;
$$;

-- Drop any existing triggers to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create single trigger for auth user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_created();

-- Function to sync email verification status
CREATE OR REPLACE FUNCTION public.sync_email_verification()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.profiles
    SET email_verified = (NEW.email_confirmed_at IS NOT NULL),
        updated_at = now()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

-- Drop any existing triggers to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;

-- Create trigger for email verification
CREATE TRIGGER on_auth_user_email_verified
    AFTER UPDATE OF email_confirmed_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_email_verification();

-- Setup test user function with proper error handling
CREATE OR REPLACE FUNCTION public.setup_test_user(
    p_user_id uuid,
    p_user_email text,
    p_user_role text,
    p_is_platform_user boolean DEFAULT false
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_role public.app_role;
BEGIN
    -- Safely cast role with validation
    v_role := public.safe_cast_role(p_user_role);
    
    -- Update auth.users role
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_build_object(
        'role', p_user_role,
        'is_platform_user', p_is_platform_user
    )
    WHERE id = p_user_id;

    -- Upsert profile
    INSERT INTO public.profiles (
        id,
        email,
        role,
        first_name,
        last_name,
        onboarding_complete,
        metadata
    )
    VALUES (
        p_user_id,
        p_user_email,
        v_role,
        'Test',
        CASE WHEN v_role = 'owner' THEN 'Owner' ELSE 'Member' END,
        true,
        CASE WHEN p_is_platform_user 
            THEN '{"is_platform_user": true}'::jsonb 
            ELSE '{}'::jsonb 
        END
    )
    ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        metadata = EXCLUDED.metadata,
        updated_at = now();

    -- Upsert user role
    INSERT INTO public.user_roles (user_id, email, role)
    VALUES (p_user_id, p_user_email, v_role)
    ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role,
        email = EXCLUDED.email,
        updated_at = now();
END;
$$;

-- Revoke public execute permissions and grant only to necessary roles
REVOKE EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO authenticated, service_role, postgres;

-- Helper function for platform admin checks
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_role public.app_role;
BEGIN
    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN v_role = 'owner'::public.app_role;
END;
$$;
