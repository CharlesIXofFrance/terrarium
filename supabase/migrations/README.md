# Terrarium Database Migrations

## Current Schema Version: 2025-01-31

This directory contains all database migrations for the Terrarium platform. The migrations are designed to be AI-friendly and follow Supabase's best practices.

## Migration Structure

### Core Components:

1. Auth Schema (auth.\*)
2. Public Schema (public.\*)
3. Storage Schema (storage.\*)

### Key Features:

- Multi-tenant isolation
- Row Level Security (RLS)
- Rate limiting
- Audit logging

## Migration Types

1. **Consolidated Migrations**

   - `20250131130000_consolidated_auth_schema.sql`: Latest auth schema
   - Contains all auth-related tables, functions, and policies

2. **Feature Migrations**
   - Community-specific features
   - Branding and customization
   - Member profiles

## Best Practices for AI Management

1. **Naming Convention**

   - Timestamp prefix (YYYYMMDDHHMMSS)
   - Descriptive suffix
   - Example: `20250131130000_consolidated_auth_schema.sql`

2. **Structure**

   - Clear section headers
   - Explicit dependencies
   - Error handling
   - Rollback procedures

3. **Documentation**
   - Each migration is self-documenting
   - Dependencies clearly stated
   - Version information included

## Running Migrations

1. **Local Development**

   ```bash
   supabase db reset
   ```

2. **Production**
   ```bash
   supabase db push
   ```

## Rollback Procedures

Each migration includes a rollback function that can be called:

```sql
CALL rollback_auth_schema();
```

## Version History

- 2025-01-31: Consolidated auth schema
- 2024-12-24: Initial schema setup
