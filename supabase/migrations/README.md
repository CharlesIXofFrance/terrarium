# Terrarium Database Migrations

## Current Schema Version: 2025-02-05

This directory contains all database migrations for the Terrarium platform. The migrations are designed to be LLM-friendly and follow Supabase's best practices.

## Migration Structure

### Required YAML Header

Each migration must include a YAML header in the following format:

```sql
/*
---
id: "YYYYMMDDHHMMSS"
title: "Clear, concise title"
description: >
  Detailed explanation of what this migration does and why.
  Include any important context or considerations.
affected_tables:
  - "schema.table_name"
dependencies:
  - "YYYYMMDDHHMMSS_previous_migration.sql"
rollback: |
  SQL commands to revert this migration
---
*/
```

### Core Components

1. Auth Schema (auth.*)
2. Public Schema (public.*)
3. Storage Schema (storage.*)

### Key Features

- Multi-tenant isolation
- Enhanced Row Level Security (RLS)
- Role-based access control (RBAC)
- Rate limiting
- Audit logging
- Profile auto-creation
- Optimized indexes

## Migration Types

1. **Consolidated Migrations**
   - Base schemas and core functionality
   - Role and security setup
   - Must include complete YAML headers

2. **Feature Migrations**
   - Community-specific features
   - Branding and customization
   - Member profiles

## Documentation

1. **Migration Dashboard**
   - Run `./scripts/migration_dashboard.py` after changes
   - Review generated `MIGRATIONS_DASHBOARD.md`
   - Commit dashboard with migration

2. **Schema Documentation**
   - Update `SCHEMA_VERSION.md`
   - Document breaking changes
   - Include migration dependencies

## Best Practices for LLM Collaboration

1. **File Structure**
   - YAML header with complete metadata
   - Clear section comments
   - Validation queries
   - Proper ordering: Extensions → Schemas → Types → Tables → Functions → Policies

2. **Documentation**
   - Keep descriptions detailed and explicit
   - Document "why" not just "what"
   - Include example data when relevant
   - Specify all dependencies

3. **Review Process**
   - Verify YAML header completeness
   - Check dependency ordering
   - Validate rollback commands
   - Ensure security implications are documented

## Tools

1. **Migration Dashboard Generator**
   ```bash
   ./scripts/migration_dashboard.py
   ```
   Generates a comprehensive overview of all migrations in `MIGRATIONS_DASHBOARD.md`

2. **Migration Template**
   Use the YAML header template above for all new migrations

## Security Considerations

1. **RLS Policies**
   - Include with table creation
   - Document security implications
   - Test thoroughly

2. **Grants and Permissions**
   - Explicit GRANT statements
   - Document role requirements
   - Follow least privilege principle
