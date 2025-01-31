-- Fix auth schema and policies
BEGIN;

-- Create enums first
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('owner', 'admin', 'member', 'employer');

DROP TYPE IF EXISTS auth.user_role CASCADE;
CREATE TYPE auth.user_role AS ENUM ('app_admin', 'community_admin', 'member', 'employer');

-- Ensure tables exist
CREATE TABLE IF NOT EXISTS public.communities (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    banner_url text,
    custom_domain text,
    favicon_url text,
    logo_url text
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role public.user_role NOT NULL,
    onboarding_step text NOT NULL DEFAULT 'profile',
    profile_complete boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_members (
    profile_id uuid NOT NULL REFERENCES profiles(id),
    community_id uuid NOT NULL REFERENCES communities(id),
    role public.user_role NOT NULL DEFAULT 'member',
    status text NOT NULL DEFAULT 'active',
    onboarding_completed boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (profile_id, community_id)
);

CREATE TABLE IF NOT EXISTS public.community_admins (
    admin_id uuid NOT NULL REFERENCES profiles(id),
    community_id uuid NOT NULL REFERENCES communities(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (admin_id, community_id)
);

-- Create helper functions
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_community_owner(community_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM communities
    WHERE id = community_id
      AND owner_id = auth.uid()
  );
END;
$$;

-- Drop and recreate auth user_role enum
DROP TYPE IF EXISTS auth.user_role CASCADE;
CREATE TYPE auth.user_role AS ENUM ('app_admin', 'community_admin', 'member', 'employer');

-- Recreate auth helper functions
CREATE OR REPLACE FUNCTION auth.is_app_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'app_admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION auth.is_community_admin(community_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles p
    JOIN community_admins ca ON ca.admin_id = p.id
    WHERE p.id = auth.uid()
      AND p.role = 'community_admin'
      AND ca.community_id = $1
  );
END;
$$;

-- Grant permissions to service_role
GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO service_role;

-- Recreate RLS policies
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

COMMIT;