-- Move member naming into branding settings
CREATE OR REPLACE FUNCTION migrate_member_naming()
RETURNS void AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM communities LOOP
    -- Create memberNaming object in branding settings if it doesn't exist
    IF r.settings IS NULL OR NOT (r.settings->'branding' ? 'memberNaming') THEN
      UPDATE communities
      SET settings = jsonb_set(
        COALESCE(settings, '{}'::jsonb),
        '{branding,memberNaming}',
        jsonb_build_object(
          'singular', COALESCE(r.member_singular_name, 'Member'),
          'plural', COALESCE(r.member_plural_name, 'Members')
        )
      )
      WHERE id = r.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_member_naming();

-- Drop the old columns after migration
ALTER TABLE communities 
  DROP COLUMN IF EXISTS member_singular_name,
  DROP COLUMN IF EXISTS member_plural_name;
