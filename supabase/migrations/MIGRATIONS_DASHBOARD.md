# Database Migration Dashboard

## Summary

Total Migrations: 1
Total Affected Tables: 4
Total Affected Functions: 1

## Migrations

### 20250206121400_baseline_migration

**Title:** Baseline Migration for MVP

**Description:**
Consolidated baseline migration that represents the current stable state of the database. This migration includes all stable schema definitions for authentication, RBAC, and core tables. It is generated from the current state of the database and should be used as a starting point for new deployments. Do not modify this migration after it's been applied.


**Affected Tables:**
- auth.users
- public.profiles
- public.user_roles
- public.community_members
- public.app_role

**Detected Table Changes:**
- public.community_members
- public.user_roles
- auth.users
- public.profiles

**Detected Function Changes:**
- public.setup_test_user

**Rollback:**
```sql
-- Baseline migration rollback is not supported. Restore from backup if necessary.
```

