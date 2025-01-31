-- Create RLS policy for community_members insert if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'community_members' 
        AND policyname = 'Users can create their own memberships'
    ) THEN
        CREATE POLICY "Users can create their own memberships"
        ON community_members FOR INSERT
        WITH CHECK (auth.uid() = profile_id);
    END IF;
END $$;
