-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON community_members;
DROP POLICY IF EXISTS "Users can view other members in their communities" ON community_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON community_members;

-- Create simplified policies
CREATE POLICY "community_members_select_policy"
ON community_members FOR SELECT
USING (
  -- Users can view their own memberships
  auth.uid() = profile_id
  OR 
  -- Users can view memberships in communities they belong to
  community_id IN (
    SELECT community_id 
    FROM community_members 
    WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "community_members_insert_policy"
ON community_members FOR INSERT
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "community_members_update_policy"
ON community_members FOR UPDATE
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "community_members_delete_policy"
ON community_members FOR DELETE
USING (auth.uid() = profile_id);
