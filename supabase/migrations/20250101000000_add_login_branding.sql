-- Add login branding settings to the existing jsonb settings column
COMMENT ON COLUMN public.communities.settings IS 'Community settings including branding, login customization, and member naming';

-- Create a function to validate the settings structure
CREATE OR REPLACE FUNCTION validate_community_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure settings is a JSONB object
  IF NOT jsonb_typeof(NEW.settings) = 'object' THEN
    RAISE EXCEPTION 'settings must be a JSON object';
  END IF;

  -- Ensure branding exists and is an object
  IF NOT (NEW.settings ? 'branding' AND jsonb_typeof(NEW.settings->'branding') = 'object') THEN
    RAISE EXCEPTION 'settings must contain a branding object';
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
