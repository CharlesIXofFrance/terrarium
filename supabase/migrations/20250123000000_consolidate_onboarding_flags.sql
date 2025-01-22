-- Consolidate onboarding flags

-- First, check if profile_complete exists and migrate data if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'profile_complete'
    ) THEN
        -- Migrate data from profile_complete to onboarding_completed
        UPDATE profiles 
        SET onboarding_completed = TRUE 
        WHERE profile_complete = TRUE 
        AND onboarding_completed = FALSE;
    END IF;
END $$;

-- Add a comment to onboarding_completed to clarify its purpose
COMMENT ON COLUMN profiles.onboarding_completed IS 'Indicates whether a member has completed their onboarding process';

-- Create a function to migrate profile_complete to onboarding_completed
CREATE OR REPLACE FUNCTION maintain_profile_complete()
RETURNS TRIGGER AS $$
BEGIN
    -- Only try to update profile_complete if the column exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'profile_complete'
    ) THEN
        IF NEW.onboarding_completed IS TRUE THEN
            NEW.profile_complete := TRUE;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep profile_complete in sync during transition
DROP TRIGGER IF EXISTS sync_profile_complete ON profiles;
CREATE TRIGGER sync_profile_complete
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION maintain_profile_complete();
