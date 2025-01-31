# Terrarium Schema Version

## Current Version: 2025-01-31-001

### Version Components

- Year: 2025
- Month: 01
- Day: 31
- Sequence: 001

## Schema Health

- Status: ✅ Active
- Last Verified: 2025-01-31 13:19
- Current Migration: `20250131130000_consolidated_auth_schema.sql`

## Core Components

### 1. Authentication (auth.\*)

- Version: 2025.01.31
- Status: Active
- Features:
  - Multi-factor authentication
  - Rate limiting
  - Session management
  - Audit logging

### 2. Public Schema (public.\*)

- Version: 2025.01.31
- Status: Active
- Features:
  - Profile management
  - Community membership
  - Role-based access

### 3. Storage Schema (storage.\*)

- Version: 2025.01.31
- Status: Active
- Features:
  - File management
  - Access control

## Dependencies

- PostgreSQL: 15.x
- Extensions:
  - uuid-ossp
  - pgcrypto
  - citext

## Breaking Changes

None since consolidation (2025-01-31)

## Recent Changes

### 2025-01-31 13:19

- Fixed enum type casting in seed.sql
- Removed duplicate community inserts
- Added proper JSONB casting for metadata fields
- Verified complete migration flow

## Migration Status

- Local Development: ✅ Verified
- Staging: 🔄 Pending Push
- Production: 🔄 Pending Push

## Verification Steps

1. Run health check:
   ```bash
   supabase db reset
   ```
2. Verify tables:
   ```sql
   SELECT schemaname, tablename
   FROM pg_tables
   WHERE schemaname IN ('auth', 'public', 'storage');
   ```
3. Check policies:
   ```sql
   SELECT * FROM pg_policies;
   ```

## Rollback Procedure

1. Use provided rollback function:
   ```sql
   CALL rollback_auth_schema();
   ```
2. Verify rollback:
   ```sql
   SELECT COUNT(*) FROM auth.users;
   ```

## AI Management Notes

1. All schema changes must be documented here
2. Version numbers must be incremented
3. Breaking changes must be highlighted
4. Dependencies must be explicitly stated
