/*
---
id: "20250205224100"
title: "Update schema documentation"
description: >
  Updates schema documentation for types, tables, and functions to improve code
  clarity and maintainability. Adds detailed comments explaining the purpose and
  usage of key database objects.
affected_tables:
  - "public.profiles"
dependencies:
  - "20250205224000_fix_test_user_setup.sql"
rollback: |
  -- Remove comments from database objects
  COMMENT ON TYPE public.app_role IS NULL;
  COMMENT ON TABLE public.profiles IS NULL;
  COMMENT ON FUNCTION public.setup_test_user IS NULL;
---
*/

COMMENT ON TYPE public.app_role IS 'Enum type for user roles in the application: owner, admin, member, employer';
COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control and metadata';
COMMENT ON FUNCTION public.setup_test_user IS 'Creates or updates a test user with specified role and platform access';

-- Add comments on columns
COMMENT ON COLUMN public.profiles.id IS 'Primary key, references auth.users';
COMMENT ON COLUMN public.profiles.email IS 'User email, must be unique';
COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.role IS 'User role from app_role enum';
COMMENT ON COLUMN public.profiles.onboarding_complete IS 'Flag indicating if user has completed onboarding';
COMMENT ON COLUMN public.profiles.metadata IS 'JSON metadata for extensibility';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp of profile creation';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp of last profile update';
