-- Drop existing enum if it exists
DROP TYPE IF EXISTS user_role CASCADE;

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('app_admin', 'community_admin', 'member', 'employer');

-- Create communities table if it doesn't exist
CREATE TABLE IF NOT EXISTS communities (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create community_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(community_id, user_id)
);

-- Create community_admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_admins (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
    admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(community_id, admin_id)
);

-- Temporarily rename the old role column
ALTER TABLE profiles RENAME COLUMN role TO role_old;

-- Add new role column
ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'member';

-- Convert existing roles
UPDATE profiles 
SET role = CASE 
    WHEN role_old = 'admin' THEN 'app_admin'::user_role
    WHEN role_old = 'member' THEN 'member'::user_role
    WHEN role_old = 'employer' THEN 'employer'::user_role
    ELSE 'member'::user_role
END;

-- Drop old column
ALTER TABLE profiles DROP COLUMN role_old;

-- Create index on role column
CREATE INDEX idx_profiles_role ON profiles(role);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "App admins have full access" ON profiles;
DROP POLICY IF EXISTS "Community admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Community admins can update community profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create policies for role-based access
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- App admins can do everything
CREATE POLICY "App admins have full access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'app_admin'
  ));

-- Community admins can read all profiles and update within their community
CREATE POLICY "Community admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'community_admin'
  ));

CREATE POLICY "Community admins can update community profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    role = 'community_admin' AND
    EXISTS (
      SELECT 1 FROM community_admins
      WHERE admin_id = auth.uid()
    )
  );

-- Users can read all profiles
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS auth.has_role(user_role);
DROP FUNCTION IF EXISTS auth.is_app_admin();
DROP FUNCTION IF EXISTS auth.is_community_admin(uuid);

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION auth.has_role(required_role user_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is app admin
CREATE OR REPLACE FUNCTION auth.is_app_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'app_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is community admin for a specific community
CREATE OR REPLACE FUNCTION auth.is_community_admin(community_id uuid)
RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS to communities tables
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_admins ENABLE ROW LEVEL SECURITY;

-- Community policies
CREATE POLICY "App admins have full access to communities"
  ON communities
  FOR ALL
  TO authenticated
  USING (auth.is_app_admin());

CREATE POLICY "Community admins can manage their communities"
  ON communities
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT admin_id FROM community_admins WHERE community_id = id
    )
  );

CREATE POLICY "Users can view communities"
  ON communities
  FOR SELECT
  TO authenticated
  USING (true);

-- Community members policies
CREATE POLICY "App admins have full access to community members"
  ON community_members
  FOR ALL
  TO authenticated
  USING (auth.is_app_admin());

CREATE POLICY "Community admins can manage their community members"
  ON community_members
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT admin_id FROM community_admins WHERE community_id = community_members.community_id
    )
  );

CREATE POLICY "Users can view community members"
  ON community_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Community admins policies
CREATE POLICY "App admins have full access to community admins"
  ON community_admins
  FOR ALL
  TO authenticated
  USING (auth.is_app_admin());

CREATE POLICY "Community admins can view other admins"
  ON community_admins
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT admin_id FROM community_admins WHERE community_id = community_admins.community_id
    )
  );
