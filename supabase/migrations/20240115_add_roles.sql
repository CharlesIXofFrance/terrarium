-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'member', 'employer');

-- Add role column to profiles table
ALTER TABLE profiles
ADD COLUMN role user_role NOT NULL DEFAULT 'member';

-- Create index on role column
CREATE INDEX idx_profiles_role ON profiles(role);

-- Create policies for role-based access
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

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
