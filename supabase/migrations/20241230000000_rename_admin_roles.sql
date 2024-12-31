-- Rename admin roles to owner roles
BEGIN;

-- Update profiles table
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"platform_owner"'
)
WHERE raw_user_meta_data->>'role' = 'app_admin';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"community_owner"'
)
WHERE raw_user_meta_data->>'role' = 'community_admin';

-- Update community_members table
UPDATE public.community_members
SET role = 'community_owner'
WHERE role = 'community_admin';

-- Update any role-based settings or configurations
UPDATE public.communities
SET settings = jsonb_set(
  settings,
  '{defaultRole}',
  '"community_owner"'
)
WHERE settings->>'defaultRole' = 'community_admin';

COMMIT;
