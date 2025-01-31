-- Add login branding settings to the existing jsonb settings column
COMMENT ON COLUMN public.communities.settings IS 'Community settings including branding, login customization, and member naming';

-- Create a function to validate the settings structure
CREATE OR REPLACE FUNCTION validate_community_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize settings if null
  IF NEW.settings IS NULL THEN
    NEW.settings = '{}'::jsonb;
  END IF;

  -- Ensure settings is a JSONB object
  IF NOT jsonb_typeof(NEW.settings) = 'object' THEN
    NEW.settings = '{}'::jsonb;
  END IF;

  -- Initialize branding if it doesn't exist
  IF NOT (NEW.settings ? 'branding') THEN
    NEW.settings = jsonb_set(
      NEW.settings,
      '{branding}',
      '{
        "primaryColor": "#4F46E5",
        "secondaryColor": "#818CF8"
      }'::jsonb
    );
  END IF;

  -- Ensure branding is an object
  IF NOT jsonb_typeof(NEW.settings->'branding') = 'object' THEN
    NEW.settings = jsonb_set(
      NEW.settings,
      '{branding}',
      '{
        "primaryColor": "#4F46E5",
        "secondaryColor": "#818CF8"
      }'::jsonb
    );
  END IF;

  -- Initialize login object if it doesn't exist
  IF NOT (NEW.settings->'branding' ? 'login') THEN
    NEW.settings = jsonb_set(
      NEW.settings,
      '{branding,login}',
      '{
        "title": "",
        "subtitle": "",
        "welcomeMessage": "",
        "buttonText": "Sign In",
        "backgroundColor": "#FFFFFF",
        "textColor": "#000000"
      }'::jsonb
    );
  END IF;

  -- Initialize member naming if it doesn't exist
  IF NOT (NEW.settings->'branding' ? 'memberNaming') THEN
    NEW.settings = jsonb_set(
      NEW.settings,
      '{branding,memberNaming}',
      '{
        "singular": "Member",
        "plural": "Members"
      }'::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS validate_community_settings_trigger ON communities;
CREATE TRIGGER validate_community_settings_trigger
  BEFORE INSERT OR UPDATE ON communities
  FOR EACH ROW
  EXECUTE FUNCTION validate_community_settings();
