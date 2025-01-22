-- Create a function to migrate user metadata onboarding status to profiles
CREATE OR REPLACE FUNCTION migrate_onboarding_status()
RETURNS void AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Migrate onboarding status from user metadata to profiles
    FOR user_record IN 
        SELECT 
            au.id,
            au.raw_user_meta_data->>'onboarding_completed' as meta_onboarding,
            p.onboarding_completed as profile_onboarding
        FROM auth.users au
        LEFT JOIN profiles p ON p.id = au.id
        WHERE au.raw_user_meta_data->>'onboarding_completed' IS NOT NULL
    LOOP
        -- Update profile onboarding status if metadata shows completed
        IF user_record.meta_onboarding::boolean = true AND 
           (user_record.profile_onboarding IS NULL OR user_record.profile_onboarding = false) THEN
            UPDATE profiles 
            SET onboarding_completed = true
            WHERE id = user_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_onboarding_status();

-- Drop the migration function as it's no longer needed
DROP FUNCTION migrate_onboarding_status();

-- Add a trigger to maintain backward compatibility
CREATE OR REPLACE FUNCTION sync_user_metadata_onboarding()
RETURNS TRIGGER AS $$
BEGIN
    -- Only sync if onboarding_completed has changed
    IF OLD.onboarding_completed IS DISTINCT FROM NEW.onboarding_completed THEN
        -- Update user metadata
        UPDATE auth.users
        SET raw_user_meta_data = 
            CASE 
                WHEN raw_user_meta_data IS NULL THEN 
                    jsonb_build_object('onboarding_completed', NEW.onboarding_completed)
                ELSE
                    raw_user_meta_data || 
                    jsonb_build_object('onboarding_completed', NEW.onboarding_completed)
            END
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep user metadata in sync
DROP TRIGGER IF EXISTS sync_onboarding_to_metadata ON profiles;
CREATE TRIGGER sync_onboarding_to_metadata
    AFTER UPDATE OF onboarding_completed ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_metadata_onboarding();

-- Add comments to clarify usage
COMMENT ON COLUMN profiles.onboarding_completed IS 'Indicates whether a member has completed their profile onboarding';
COMMENT ON COLUMN communities.onboarding_completed IS 'Indicates whether a community has completed their setup/onboarding process';
