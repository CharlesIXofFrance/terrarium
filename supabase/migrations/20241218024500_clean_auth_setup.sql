-- First ensure the tables exist and have the right structure
DROP TABLE IF EXISTS "public"."profiles" CASCADE;
CREATE TABLE "public"."profiles" (
    "id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "email" text NOT NULL,
    "full_name" text NOT NULL,
    "avatar_url" text,
    "role" user_role NOT NULL DEFAULT 'community_admin'::user_role,
    "profile_complete" integer NOT NULL DEFAULT 0,
    "settings" jsonb,
    PRIMARY KEY ("id")
);

-- Add explicit index on profile_complete
CREATE INDEX idx_profiles_profile_complete ON public.profiles (profile_complete);

-- Create or replace function to ensure boolean conversion
CREATE OR REPLACE FUNCTION public.to_boolean(v anynonarray) 
RETURNS boolean AS $$
BEGIN
    RETURN CASE 
        WHEN v IS NULL THEN false
        WHEN v::text::boolean IS NULL THEN false
        ELSE v::text::boolean
    END;
EXCEPTION 
    WHEN OTHERS THEN 
        RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

CREATE TABLE IF NOT EXISTS "public"."communities" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "name" text NOT NULL,
    "slug" text NOT NULL UNIQUE,
    "description" text,
    "owner_id" uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    "logo_url" text,
    "banner_url" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "settings" jsonb,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."community_members" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "community_id" uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    "profile_id" uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    "role" text NOT NULL DEFAULT 'member',
    "settings" jsonb,
    PRIMARY KEY ("id"),
    UNIQUE ("community_id", "profile_id")
);

-- Drop all existing policies first
DROP POLICY IF EXISTS "profiles_select_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_insert_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_update_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_delete_policy" ON "public"."profiles";

DROP POLICY IF EXISTS "communities_select_policy" ON "public"."communities";
DROP POLICY IF EXISTS "communities_insert_policy" ON "public"."communities";
DROP POLICY IF EXISTS "communities_update_policy" ON "public"."communities";
DROP POLICY IF EXISTS "communities_delete_policy" ON "public"."communities";

DROP POLICY IF EXISTS "community_members_select_policy" ON "public"."community_members";
DROP POLICY IF EXISTS "community_members_insert_policy" ON "public"."community_members";
DROP POLICY IF EXISTS "community_members_update_policy" ON "public"."community_members";
DROP POLICY IF EXISTS "community_members_delete_policy" ON "public"."community_members";

-- Enable RLS on all tables
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."communities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."community_members" ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Allow public access for initial profile creation
CREATE POLICY "profiles_public_create_policy"
ON "public"."profiles"
FOR INSERT
TO public
WITH CHECK (true);

-- Profiles policies for authenticated users
CREATE POLICY "profiles_select_policy"
ON "public"."profiles"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_update_policy"
ON "public"."profiles"
FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_delete_policy"
ON "public"."profiles"
FOR DELETE
TO authenticated
USING (id = auth.uid());

-- Enable RLS on communities
ALTER TABLE "public"."communities" ENABLE ROW LEVEL SECURITY;

-- Communities policies
CREATE POLICY "communities_select_policy"
ON "public"."communities"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "communities_insert_policy"
ON "public"."communities"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'community_admin'
  )
);

CREATE POLICY "communities_update_policy"
ON "public"."communities"
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "communities_delete_policy"
ON "public"."communities"
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Community members policies
CREATE POLICY "community_members_select_policy"
ON "public"."community_members"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "community_members_insert_policy"
ON "public"."community_members"
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM communities
    WHERE communities.id = community_members.community_id
    AND communities.owner_id = auth.uid()
  )
);

CREATE POLICY "community_members_update_policy"
ON "public"."community_members"
FOR UPDATE
TO authenticated
USING (
  profile_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM communities
    WHERE communities.id = community_members.community_id
    AND communities.owner_id = auth.uid()
  )
);

CREATE POLICY "community_members_delete_policy"
ON "public"."community_members"
FOR DELETE
TO authenticated
USING (
  profile_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM communities
    WHERE communities.id = community_members.community_id
    AND communities.owner_id = auth.uid()
  )
);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at, profile_complete)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'community_admin')::user_role,
    NOW(),
    NOW(),
    public.to_boolean(new.raw_user_meta_data->>'profile_complete')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger to ensure profile_complete is always boolean
CREATE OR REPLACE FUNCTION public.ensure_boolean_profile_complete()
RETURNS trigger AS $$
BEGIN
  NEW.profile_complete = public.to_boolean(NEW.profile_complete);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_profile_complete_boolean
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_boolean_profile_complete();
