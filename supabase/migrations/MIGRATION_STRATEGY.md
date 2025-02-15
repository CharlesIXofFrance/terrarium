# Migration Strategy for Terrarium MVP

## Overview
This document outlines our migration strategy for the Terrarium MVP, focusing on simplifying our database schema management and resolving authentication issues.

## Key Components

### 1. Baseline Migration
- File: `20250206121400_baseline_migration.sql`
- Purpose: Provides a consolidated starting point for new environments
- Contains:
  - Core schema definitions
  - Authentication tables
  - RBAC structure
  - Essential functions and policies

### 2. Migration Organization
- Active Directory: `supabase/migrations/`
  - Contains baseline and new migrations
  - Each file follows standardized YAML header format
  - Migrations are atomic and focused
- Archive Directory: `supabase/migrations/archived/`
  - Contains historical migrations
  - Preserved for reference and rollback scenarios
  - Organized by feature/month

### 3. Authentication Structure
Core authentication components:
- `auth.users`: Base Supabase authentication
- `public.profiles`: Extended user information
- `public.user_roles`: Role-based access control
- `public.community_members`: Community membership

### 4. Development Workflow
1. New environments:
   - Start with baseline migration
   - Apply subsequent incremental changes
2. Existing environments:
   - Continue using full migration history
   - Archive older migrations for clarity
3. New features:
   - Create atomic migrations with standardized headers
   - Update documentation
   - Run migration dashboard

## Migration Rules
1. All new migrations must include:
   - Standardized YAML header
   - Clear description
   - Proper rollback commands
   - List of affected tables
   - Dependencies

2. Testing Requirements:
   - Test in clean environment
   - Verify rollback functionality
   - Check RLS policies
   - Validate auth flows

## Documentation
Key files to maintain:
1. `MIGRATIONS_DASHBOARD.md`: Auto-generated overview
2. `SCHEMA_VERSION.md`: Version history
3. `MIGRATION_STRATEGY.md`: This file
4. `README.md`: Setup instructions

## Authentication Focus
Current authentication implementation:
1. User Registration
   - Email/password signup
   - Social auth providers
   - Email verification

2. Role Management
   - Platform roles (owner, admin, member, employer)
   - Community-specific roles
   - RLS policies

3. Session Handling
   - JWT tokens
   - Refresh tokens
   - Session management

## Next Steps
1. [ ] Test baseline migration in clean environment
2. [ ] Archive historical migrations
3. [ ] Update documentation
4. [ ] Verify authentication flows
5. [ ] Add new features via incremental migrations
