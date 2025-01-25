-- Drop all existing policies
DROP POLICY IF EXISTS "Allow users to view their own memberships" ON community_members;
DROP POLICY IF EXISTS "Allow users to view members in their communities" ON community_members;
DROP POLICY IF EXISTS "Allow users to insert their own membership" ON community_members;
DROP POLICY IF EXISTS "Allow users to update their own membership" ON community_members;
DROP POLICY IF EXISTS "Allow users to delete their own membership" ON community_members;

-- Create super simple policies
CREATE POLICY "Enable read access for authenticated users"
ON community_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON community_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Enable update for users based on profile_id"
ON community_members FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Enable delete for users based on profile_id"
ON community_members FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);
