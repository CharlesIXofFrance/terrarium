-- Move existing member naming data into the branding settings
UPDATE communities
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{branding,memberNaming}',
  jsonb_build_object(
    'singular',
    COALESCE(member_singular_name, 'Member'),
    'plural',
    COALESCE(member_plural_name, 'Members')
  )
)
WHERE member_singular_name IS NOT NULL
   OR member_plural_name IS NOT NULL;

-- Drop the old columns
ALTER TABLE communities
DROP COLUMN IF EXISTS member_singular_name,
DROP COLUMN IF EXISTS member_plural_name;
