-- Add custom_domain column to communities table
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_communities_custom_domain
    ON communities(custom_domain);

-- Add comment explaining the column's purpose
COMMENT ON COLUMN communities.custom_domain IS 'Optional custom domain for the community. Must be unique across all communities.';

-- Function to validate custom domain format
CREATE OR REPLACE FUNCTION validate_custom_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow null values
  IF NEW.custom_domain IS NULL THEN
    RETURN NEW;
  END IF;

  -- Basic domain format validation
  IF NOT NEW.custom_domain ~ '^[a-zA-Z0-9][a-zA-Z0-9-\.]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid custom domain format. Must be a valid domain name (e.g., community.example.com)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for custom domain validation
DROP TRIGGER IF EXISTS validate_custom_domain_trigger ON communities;
CREATE TRIGGER validate_custom_domain_trigger
  BEFORE INSERT OR UPDATE OF custom_domain ON communities
  FOR EACH ROW
  EXECUTE FUNCTION validate_custom_domain();
