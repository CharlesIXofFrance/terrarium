# Pre-Baseline Migration Archive Manifest

This directory contains migrations that were consolidated into the baseline migration
`20250206121400_baseline_migration.sql`. These migrations are preserved for historical
reference and rollback scenarios if needed.

## Archived Migrations
The following migrations were archived on 2025-02-06:

### Authentication and Role Management
- 20250131125800_auth_schema_fixes.sql
- 20250131130000_consolidated_auth_schema.sql
- 20250131191200_drop_redundant_policies.sql
- 20250131191300_drop_profile_update_policy.sql
- 20250131191400_fix_policy_name.sql
- 20250131201600_add_rate_limiting.sql
- 20250131204300_fix_auth_trigger.sql
- 20250131204500_debug_auth_trigger.sql
- 20250131210100_fix_community_members_policies.sql

### Profile and Member Management
- 20250201043100_fix_profile_and_member_policies.sql
- 20250201044300_fix_profiles_policies.sql
- 20250201045000_fix_auth_trigger_role.sql
- 20250201115500_implement_rbac.sql
- 20250201115600_fix_profiles_schema.sql
- 20250202143500_fix_profile_insert_policy.sql

### Testing and Utilities
- 20250203172600_add_test_function.sql
- 20250203173700_update_profile_schema.sql
- 20250203233400_create_test_utils.sql
- 20250203233500_expose_test_utils.sql

### Access Grants and Permissions
- 20250203234500_grant_service_role.sql
- 20250203234600_create_auth_logs.sql
- 20250203234700_grant_auth_access.sql
(... and related grant migrations)

## Notes
- These migrations have been consolidated into the baseline migration
- The baseline includes all stable schema definitions and core functionality
- New features and fixes should be implemented as new migrations on top of the baseline
- If you need to reference specific historical changes, consult these archived files

## Rollback Procedure
If you need to rollback to a pre-baseline state:
1. Drop the baseline schema
2. Restore these migrations from the archive
3. Apply them in chronological order

## Warning
Do not modify these archived migrations. They are preserved for historical reference
and potential rollback scenarios only.
