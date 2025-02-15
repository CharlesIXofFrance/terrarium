-- Drop existing policies on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can edit their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Create new, simplified policies for profiles
CREATE POLICY "Anyone can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete their own profile"
ON profiles
FOR DELETE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admin full access"
ON profiles
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM auth.users u
        WHERE u.id = auth.uid()
        AND u.role = 'service_role'::text
    )
);

-- Create a security definer function for checking admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = auth.uid()
        AND role = 'service_role'::text
    );
END;
$$;
