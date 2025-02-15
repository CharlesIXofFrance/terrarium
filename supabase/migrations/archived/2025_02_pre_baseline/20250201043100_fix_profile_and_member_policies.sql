-- Drop existing policies
DROP POLICY IF EXISTS "Profile access policy" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Platform admin access" ON community_members;
DROP POLICY IF EXISTS "Owner access" ON community_members;
DROP POLICY IF EXISTS "Self access" ON community_members;
DROP POLICY IF EXISTS "Community member view access" ON community_members;

-- Create helper function for community access check
CREATE OR REPLACE FUNCTION public.has_community_access(community_id uuid)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.id = auth.uid()
        AND (
            p.role = 'admin'::user_role
            OR EXISTS (
                SELECT 1
                FROM community_members cm
                WHERE cm.profile_id = auth.uid()
                AND cm.community_id = $1
            )
        )
    );
END;
$$;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can edit their own profile"
ON profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'admin'::user_role
    )
);

-- Community members policies
CREATE POLICY "Members can view their communities"
ON community_members
FOR SELECT
TO authenticated
USING (
    profile_id = auth.uid()
    OR community_id IN (
        SELECT cm.community_id
        FROM community_members cm
        WHERE cm.profile_id = auth.uid()
    )
);

CREATE POLICY "Members can manage their own membership"
ON community_members
FOR ALL
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can manage all memberships"
ON community_members
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'admin'::user_role
    )
);

CREATE POLICY "Community owners can manage their community"
ON community_members
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM communities c
        JOIN profiles p ON p.id = auth.uid()
        WHERE c.id = community_members.community_id
        AND c.owner_id = p.id
    )
);
