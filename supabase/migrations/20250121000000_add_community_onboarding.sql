-- Function to ensure the onboarding_completed column exists
DO $$
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'communities'
        AND column_name = 'onboarding_completed'
    ) THEN
        -- Add onboarding_completed column if it doesn't exist
        ALTER TABLE communities 
        ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

        -- Add comment to the column
        COMMENT ON COLUMN communities.onboarding_completed IS 'Indicates whether the community setup/onboarding process has been completed';
    END IF;
END $$;

-- Migrate existing communities to mark them as completed if they have settings
UPDATE communities 
SET onboarding_completed = TRUE 
WHERE settings IS NOT NULL AND settings != '{}'::jsonb;

-- Grant necessary permissions
GRANT SELECT, UPDATE (onboarding_completed) ON communities TO authenticated;
GRANT SELECT ON communities TO anon;
