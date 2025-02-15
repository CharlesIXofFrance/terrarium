/*
---
id: "20250204001300"
title: "Fix user roles query performance"
description: >
  Adds an email column to the user_roles table for more efficient querying and joins.
  Creates an index on the email column and sets up a trigger to automatically keep
  the email in sync with auth.users. This improves query performance by reducing
  the need for joins with auth.users table.
affected_tables:
  - "public.user_roles"
dependencies:
  - "20250204001200_fix_community_member_verification.sql"
rollback: |
  DROP TRIGGER IF EXISTS sync_user_role_email_trigger ON user_roles;
  DROP FUNCTION IF EXISTS sync_user_role_email();
  DROP INDEX IF EXISTS user_roles_email_idx;
  ALTER TABLE user_roles DROP COLUMN IF EXISTS email;
---
*/

-- Add email column to user_roles for efficient querying
ALTER TABLE user_roles
ADD COLUMN email TEXT NOT NULL DEFAULT '';

-- Create index for email lookups
CREATE INDEX user_roles_email_idx ON user_roles (email);

-- Update existing rows with email from auth.users
UPDATE user_roles ur
SET email = u.email
FROM auth.users u
WHERE ur.user_id = u.id;

-- Add trigger to keep email in sync with auth.users
CREATE OR REPLACE FUNCTION sync_user_role_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email = (SELECT email FROM auth.users WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_user_role_email_trigger
BEFORE INSERT OR UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION sync_user_role_email();
