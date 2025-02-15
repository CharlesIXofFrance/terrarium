-- Drop existing policies
DROP POLICY IF EXISTS "Community member access policy" ON community_members;
DROP POLICY IF EXISTS "Community members are viewable by community members." ON community_members;
DROP POLICY IF EXISTS "Community owners can manage members" ON community_members;
DROP POLICY IF EXISTS "Platform admins can manage all members" ON community_members;

-- Create new, simplified policies
CREATE POLICY "Platform admin access"
ON community_members
FOR ALL
TO authenticated
USING (is_platform_admin());

CREATE POLICY "Owner access"
ON community_members
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.id = auth.uid()
  AND p.role = 'owner'::user_role
  AND EXISTS (
    SELECT 1 FROM communities c
    WHERE c.id = community_members.community_id
    AND c.owner_id = p.id
  )
));

CREATE POLICY "Self access"
ON community_members
FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Community member view access"
ON community_members
FOR SELECT
TO authenticated
USING (
  community_id IN (
    SELECT community_id 
    FROM community_members 
    WHERE profile_id = auth.uid()
  )
);
