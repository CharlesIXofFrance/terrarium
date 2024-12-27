-- Create communities table
DROP TABLE IF EXISTS public.communities CASCADE;
CREATE TABLE public.communities (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    name text NOT NULL,
    description text,
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    logo_url text,
    slug text NOT NULL,
    member_plural_name text NOT NULL DEFAULT 'Members',
    member_singular_name text NOT NULL DEFAULT 'Member',
    settings jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT unique_slug UNIQUE (slug)
);

-- Enable RLS on communities
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Create policies for communities table
DROP POLICY IF EXISTS "Communities read access for all users" ON public.communities;
DROP POLICY IF EXISTS "Communities insert for authenticated users" ON public.communities;
DROP POLICY IF EXISTS "Communities update for community owners" ON public.communities;
DROP POLICY IF EXISTS "Communities delete for community owners" ON public.communities;

CREATE POLICY "Communities read access for all users"
    ON public.communities FOR SELECT
    USING (true);

CREATE POLICY "Communities insert for authenticated users"
    ON public.communities FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Communities update for community owners"
    ON public.communities FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Communities delete for community owners"
    ON public.communities FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;

-- Create enum types
DO $$
BEGIN
    -- Create user roles in public schema
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        CREATE TYPE public.user_role AS ENUM ('app_admin', 'community_admin', 'member', 'employer');
    END IF;
    
    -- Create user roles in auth schema
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')) THEN
        CREATE TYPE auth.user_role AS ENUM ('app_admin', 'community_admin', 'member', 'employer');
    END IF;

    -- Create auth factor types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'factor_type') THEN
        CREATE TYPE auth.factor_type AS ENUM ('totp', 'webauthn');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'factor_status') THEN
        CREATE TYPE auth.factor_status AS ENUM ('unverified', 'verified');
    END IF;
END$$;

-- Create necessary roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOINHERIT CREATEROLE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator NOINHERIT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOINHERIT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOINHERIT;
    END IF;
END$$;

-- Create auth tables
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

CREATE TABLE IF NOT EXISTS auth.identities (
    id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    email text GENERATED ALWAYS AS (lower(identity_data->>'email')) STORED,
    CONSTRAINT identities_pkey PRIMARY KEY (provider, id),
    CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS auth.mfa_challenges (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    factor_id uuid REFERENCES auth.mfa_factors(id) ON DELETE CASCADE,
    created_at timestamptz,
    verified_at timestamptz,
    ip_address inet
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name text,
    email text,
    role text DEFAULT 'member'::text,
    profile_complete boolean DEFAULT false
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'member'
    );
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create application tables
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    UNIQUE(community_id, profile_id)
);

-- Create triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON public.communities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage setup
DO $$
BEGIN
    -- Create bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name)
    VALUES ('community-assets', 'community-assets')
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Community owner member access" ON storage.objects;
DROP POLICY IF EXISTS "Community members can view assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow temporary uploads" ON storage.objects;
DROP POLICY IF EXISTS "Community owners can manage files" ON storage.objects;
DROP POLICY IF EXISTS "Community members can view files" ON storage.objects;

-- Enable RLS on storage tables
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create bucket access policy
CREATE POLICY "Public bucket access"
    ON storage.buckets FOR SELECT
    TO authenticated
    USING (true);

-- Create a function to check community ownership
CREATE OR REPLACE FUNCTION public.check_community_ownership(file_path TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    community_slug TEXT;
    is_owner BOOLEAN;
BEGIN
    community_slug := split_part(file_path, '/', 1);
    SELECT EXISTS (
        SELECT 1 FROM public.communities
        WHERE slug = community_slug
        AND owner_id = user_id
    ) INTO is_owner;
    RETURN is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check community membership
CREATE OR REPLACE FUNCTION public.check_community_membership(file_path TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    community_slug TEXT;
    is_member BOOLEAN;
BEGIN
    community_slug := split_part(file_path, '/', 1);
    SELECT EXISTS (
        SELECT 1 FROM public.community_members cm
        JOIN public.communities c ON c.id = cm.community_id
        WHERE c.slug = community_slug
        AND cm.profile_id = user_id
    ) INTO is_member;
    RETURN is_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow community owners to manage their files
CREATE POLICY "Community owners can manage files"
    ON storage.objects
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'community-assets'
        AND public.check_community_ownership(name, auth.uid())
    )
    WITH CHECK (
        bucket_id = 'community-assets'
        AND public.check_community_ownership(name, auth.uid())
    );

-- Allow community members to view files
CREATE POLICY "Community members can view files"
    ON storage.objects
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'community-assets'
        AND (
            public.check_community_ownership(name, auth.uid())
            OR public.check_community_membership(name, auth.uid())
        )
    );

-- Create function to set claims
CREATE OR REPLACE FUNCTION public.set_claim(
  uid uuid,
  claim text,
  value jsonb
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = uid) THEN
    RETURN 'User not found';
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data =
    raw_app_meta_data ||
    json_build_object(claim, value)::jsonb
  WHERE id = uid;

  RETURN 'OK';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.set_claim TO authenticated;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.communities TO authenticated;
GRANT ALL ON public.community_members TO authenticated;

GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA storage TO authenticated;

-- Grant permissions
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO service_role;

GRANT ALL ON SCHEMA storage TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO service_role;

GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.objects TO authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;

GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Create auth policies
CREATE POLICY "Users can view their own auth data"
    ON auth.users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Service role can manage all auth data"
    ON auth.users FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create profile policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
    ON public.profiles FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create community member policies
CREATE POLICY "Member read access"
    ON public.community_members
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "Member write access"
    ON public.community_members
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Member update access"
    ON public.community_members
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Member delete access"
    ON public.community_members
    AS PERMISSIVE
    FOR DELETE
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "Community owner member access"
    ON public.community_members
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.communities
            WHERE id = community_id
            AND owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.communities
            WHERE id = community_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Service role member access"
    ON public.community_members
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
