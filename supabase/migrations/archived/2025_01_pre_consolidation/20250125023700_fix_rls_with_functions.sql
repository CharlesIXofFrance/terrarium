-- Create helper function to check community membership
CREATE OR REPLACE FUNCTION is_community_member(_user_id uuid, _community_id uuid) 
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM community_members cm
    WHERE cm.profile_id = _user_id 
    AND cm.community_id = _community_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON community_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON community_members;
DROP POLICY IF EXISTS "Enable update for users based on profile_id" ON community_members;
DROP POLICY IF EXISTS "Enable delete for users based on profile_id" ON community_members;

-- Create proper policies using the helper function
CREATE POLICY "Users can view their own and their community's memberships"
ON community_members FOR SELECT
TO authenticated
USING (
  auth.uid() = profile_id 
  OR 
  is_community_member(auth.uid(), community_id)
);

CREATE POLICY "Users can insert their own membership"
ON community_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own membership"
ON community_members FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own membership"
ON community_members FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);
