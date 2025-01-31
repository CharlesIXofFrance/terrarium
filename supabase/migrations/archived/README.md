# Archived Migrations

This directory contains historical migrations that have been consolidated into the main schema. These are kept for reference and audit purposes.

## Structure

```
archived/
├── 2024/                 # Migrations from 2024
├── 2025_01_pre_consolidation/  # Pre-consolidation migrations from January 2025
└── README.md             # This file
```

## Migration Groups

### 2024 Migrations

Initial setup and core functionality:

- Basic auth schema
- Community features
- Profile management

### 2025_01_pre_consolidation

Migrations that were consolidated into `20250131130000_consolidated_auth_schema.sql`:

- Auth improvements
- Rate limiting
- RLS policies
- Security enhancements

## Important Notes

1. These migrations are no longer active and should not be run
2. They are kept for:
   - Historical reference
   - Audit purposes
   - Understanding the evolution of the schema
3. All functionality has been consolidated into the main migrations

## Consolidation Process

1. All migrations were analyzed for dependencies
2. Features were tested for compatibility
3. Security measures were verified
4. Performance optimizations were maintained

## Reference Only

**WARNING**: Do not attempt to run these migrations directly. Use the consolidated schema in the main migrations directory.
