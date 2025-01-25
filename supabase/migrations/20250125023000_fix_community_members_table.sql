-- Drop existing policies
DROP POLICY IF EXISTS "community_members_select_policy" ON community_members;
DROP POLICY IF EXISTS "community_members_insert_policy" ON community_members;
DROP POLICY IF EXISTS "community_members_update_policy" ON community_members;
DROP POLICY IF EXISTS "community_members_delete_policy" ON community_members;
DROP POLICY IF EXISTS "Community owner member access" ON community_members;

-- Drop and recreate the community_members table with correct structure
DROP TABLE IF EXISTS community_members CASCADE;
CREATE TABLE community_members (
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'member'::user_role,
    status TEXT NOT NULL DEFAULT 'active',
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (profile_id, community_id)
);

-- Enable RLS
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "Allow users to view their own memberships"
ON community_members FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Allow users to view members in their communities"
ON community_members FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM communities 
    WHERE id = community_members.community_id 
    AND (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM community_members cm 
        WHERE cm.community_id = communities.id 
        AND cm.profile_id = auth.uid()
    ))
));

CREATE POLICY "Allow users to insert their own membership"
ON community_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Allow users to update their own membership"
ON community_members FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Allow users to delete their own membership"
ON community_members FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);
