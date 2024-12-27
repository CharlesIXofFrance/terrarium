-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create enum for user roles in both schemas
DO $$
BEGIN
    -- Create in public schema
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        CREATE TYPE public.user_role AS ENUM ('app_admin', 'community_admin', 'member', 'employer');
    END IF;
    
    -- Create in auth schema
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')) THEN
        CREATE TYPE auth.user_role AS ENUM ('app_admin', 'community_admin', 'member', 'employer');
    END IF;
END$$;

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

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

-- Create necessary roles
DO $$
BEGIN
    -- Create service_role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOINHERIT CREATEROLE;
    END IF;

    -- Create authenticator role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator NOINHERIT;
    END IF;

    -- Create anon role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOINHERIT;
    END IF;

    -- Create authenticated role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOINHERIT;
    END IF;
END$$;

-- Grant schema permissions
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;

-- Grant service_role full access to auth schema
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON FUNCTIONS TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO service_role;

-- Grant service_role full access to public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Grant service_role full access to storage schema
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO service_role;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role public.user_role NOT NULL DEFAULT 'member'::public.user_role,
    profile_complete INTEGER NOT NULL DEFAULT 0,
    settings JSONB
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at);

-- Add unique constraint for email
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Add RLS to profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}'::jsonb,
    member_singular_name TEXT DEFAULT 'member',
    member_plural_name TEXT DEFAULT 'members',
    favicon_url TEXT
);

-- Create community_members table
CREATE TABLE IF NOT EXISTS public.community_members (
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    role TEXT NOT NULL DEFAULT 'member',
    PRIMARY KEY (community_id, profile_id)
);

-- Create storage bucket for community assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'community-assets',
    'community-assets',
    false,
    5242880, -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];

-- Grant storage access to service role
GRANT ALL ON SCHEMA storage TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO service_role;

-- Grant storage access to authenticated users
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- Enable Row Level Security on storage tables
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow owner to manage community assets bucket" ON storage.buckets;
DROP POLICY IF EXISTS "Allow members to view community assets bucket" ON storage.buckets;
DROP POLICY IF EXISTS "Allow owner to manage community assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow members to view community assets" ON storage.objects;
DROP POLICY IF EXISTS "Deny all by default for buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Deny all by default for objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role for buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Allow service role for objects" ON storage.objects;

-- Create bucket policies
CREATE POLICY "Allow service role for buckets"
ON storage.buckets
FOR ALL
TO service_role
USING (true);

CREATE POLICY "Allow owner to manage community assets bucket"
ON storage.buckets
FOR ALL
USING (
  name = 'community-assets' AND 
  EXISTS (
    SELECT 1 FROM public.communities c
    JOIN public.community_members cm ON c.id = cm.community_id
    WHERE cm.profile_id = auth.uid()
    AND (cm.role = 'community_admin' OR c.owner_id = cm.profile_id)
  )
);

CREATE POLICY "Allow members to view community assets bucket"
ON storage.buckets
FOR SELECT
USING (
  name = 'community-assets' AND 
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('community_admin', 'member')
);

CREATE POLICY "Deny all by default for buckets"
ON storage.buckets
FOR ALL
USING (false);

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow owner to manage community assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow members to view community assets" ON storage.objects;

-- Create updated object policies
CREATE POLICY "Allow owner to manage community assets"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'community-assets' AND
  EXISTS (
    SELECT 1 FROM public.communities c
    JOIN public.community_members cm ON c.id = cm.community_id
    WHERE c.slug = split_part(name, '/', 1)
    AND cm.profile_id = auth.uid()
    AND (cm.role = 'community_admin' OR c.owner_id = cm.profile_id)
  )
);

CREATE POLICY "Allow members to view community assets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'community-assets' AND
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('community_admin', 'member') AND
  EXISTS (
    SELECT 1 FROM public.communities c
    JOIN public.community_members cm ON c.id = cm.community_id
    WHERE c.slug = split_part(name, '/', 1)
    AND cm.profile_id = auth.uid()
    AND c.id IS NOT NULL
  )
);

CREATE POLICY "Allow service role for objects"
ON storage.objects
FOR ALL
TO service_role
USING (true);

CREATE POLICY "Deny all by default for objects"
ON storage.objects
FOR ALL
USING (false);

-- Enable Row Level Security on public tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Create bypass RLS policy for service_role
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.communities FORCE ROW LEVEL SECURITY;
ALTER TABLE public.community_members FORCE ROW LEVEL SECURITY;

CREATE POLICY "Service role bypass RLS" ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass RLS" ON public.communities
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass RLS" ON public.community_members
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Add RLS policies for profiles
CREATE POLICY "Users can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Grant permissions to authenticated users
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO authenticated;

-- Create policies for communities
CREATE POLICY "Communities are viewable by everyone"
    ON public.communities FOR SELECT
    USING (true);

CREATE POLICY "Community owners can update their communities"
    ON public.communities FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Community owners can delete their communities"
    ON public.communities FOR DELETE
    USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create communities"
    ON public.communities FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for community members
CREATE POLICY "Community members are viewable by everyone"
    ON public.community_members FOR SELECT
    USING (true);

CREATE POLICY "Community owners can manage members"
    ON public.community_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.communities
            WHERE communities.id = community_members.community_id
            AND communities.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can join communities"
    ON public.community_members FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_profile_complete ON public.profiles (profile_complete);
CREATE INDEX IF NOT EXISTS idx_communities_slug ON public.communities (slug);
CREATE INDEX IF NOT EXISTS idx_community_members_profile ON public.community_members (profile_id);

-- Create trigger for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_role text;
BEGIN
    -- Set default role based on user metadata
    default_role := COALESCE(NEW.raw_user_meta_data->>'role', 'member');

    -- Create profile
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        CASE 
            WHEN default_role = 'community_admin' THEN 'community_admin'::public.user_role
            ELSE 'member'::public.user_role
        END
    );

    -- Update user metadata with role
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', default_role)
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;

-- Grant execute to service_role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create set_claim function in public schema
CREATE OR REPLACE FUNCTION public.set_claim(
  uid uuid,
  claim text,
  value text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = uid
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data =
    raw_app_meta_data ||
    json_build_object(claim, value)::jsonb
  WHERE id = uid;
END;
$$;

-- Grant execute permission on set_claim function to service_role
GRANT EXECUTE ON FUNCTION public.set_claim TO service_role;
