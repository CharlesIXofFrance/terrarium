-- Drop existing user_role enum and recreate with correct values
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'employer');

-- Drop and recreate profiles table with correct role type
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role user_role NOT NULL,
  profile_complete boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  onboarding_step integer NOT NULL DEFAULT 1,
  community_metadata jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Drop and recreate community_members table with correct role type
DROP TABLE IF EXISTS community_members CASCADE;
CREATE TABLE community_members (
  profile_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES communities ON DELETE CASCADE,
  role user_role NOT NULL,
  status text NOT NULL DEFAULT 'active',
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (profile_id, community_id)
);

-- Enable RLS on community_members
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for community_members
CREATE POLICY "Users can view their own memberships"
  ON community_members FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can view other members in their communities"
  ON community_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own membership"
  ON community_members FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Grant permissions
GRANT USAGE ON TYPE public.user_role TO anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON public.profiles TO anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON public.community_members TO anon, authenticated, service_role, supabase_auth_admin;