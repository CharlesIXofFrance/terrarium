-- Add role column to community_members if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'community_members' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE community_members
    ADD COLUMN role text NOT NULL DEFAULT 'member';
  END IF;
END $$;
