# Role Renaming Process: Admin to Owner

This document outlines the process of renaming roles in the Terrarium platform from "Admin" to "Owner" to better reflect responsibilities and reduce confusion.

## Overview

### Current Role Structure
- App Admin: Platform-wide administrator
- Community Admin: Community-level administrator
- Member: Regular community member
- Employer: Job posting access

### New Role Structure
- Platform Owner: Platform-wide administrator (formerly App Admin)
- Community Owner: Community-level administrator (formerly Community Admin)
- Member: Regular community member (unchanged)
- Employer: Job posting access (unchanged)

## Implementation Plan

### 1. Type System Updates

#### Update Role Enums (`src/backend/types/rbac.types.ts`)
```typescript
// Before
type Role = 'app_admin' | 'community_admin' | 'member' | 'employer';

// After
type Role = 'platform_owner' | 'community_owner' | 'member' | 'employer';
```

#### Update Database Types (`src/lib/utils/database.types.ts`)
```typescript
// Update role types in database schema
interface UserRole {
  role: 'platform_owner' | 'community_owner' | 'member' | 'employer';
}
```

### 2. Component Updates

#### Directory Renames
- `/src/pages/admin` → `/src/pages/platform`
- `/src/components/admin` → `/src/components/platform`

#### Component Updates
1. RBAC Test Component (`src/pages/RBACTest.tsx`)
   - Update role switcher UI
   - Update role-based content display

2. Community Layout (`src/components/layout/CommunityLayout.tsx`)
   - Update role checks
   - Update UI text

3. Onboarding Flow (`src/components/features/onboarding/OnboardingFlow.tsx`)
   - Update role selection
   - Update role-specific flows

### 3. Authentication & Authorization

#### Update Auth Service (`src/backend/services/auth.service.ts`)
- Update role assignments
- Update role validation

#### Update RBAC Service (`src/backend/services/rbac.service.ts`)
- Update permission mappings
- Update role checks

#### Update Auth Hooks (`src/lib/hooks/useAuth.ts`)
- Update role-based redirects
- Update role checks

### 4. Database Migration

```sql
-- Example migration (adjust based on actual database schema)
UPDATE users
SET role = 
  CASE 
    WHEN role = 'app_admin' THEN 'platform_owner'
    WHEN role = 'community_admin' THEN 'community_owner'
    ELSE role
  END;
```

### 5. UI Text Updates

Update all UI text references:
- "Admin Dashboard" → "Platform Dashboard"
- "Community Admin" → "Community Owner"
- "App Admin" → "Platform Owner"

## Progress Update (2024-12-30)

### ✅ Completed Changes

1. **Type System Updates**
   - Updated role enums in `src/backend/types/rbac.types.ts`
     - `app_admin` → `platform_owner`
     - `community_admin` → `community_owner`
   - Updated database types in `src/lib/utils/database.types.ts`
     - Updated profile roles
     - Updated community member roles

2. **Component Updates**
   - Updated RBAC test component (`src/pages/RBACTest.tsx`)
     - New role names in UI
     - Updated permission checks
     - Improved UI layout
   - Updated Community Layout (`src/components/layout/CommunityLayout.tsx`)
     - New role verification logic
     - Updated UI text
     - Added `isOwner` helper
   - Updated Onboarding Flow (`src/components/features/onboarding/OnboardingFlow.tsx`)
     - Updated role checks
     - Updated test user roles
   - Updated Auth Hook (`src/lib/hooks/useAuth.ts`)
     - Updated role checks for community owners
     - Updated redirect logic

3. **Directory Structure**
   - Renamed `/src/pages/admin` → `/src/pages/platform`
   - Renamed `/src/components/admin` → `/src/components/platform`

4. **Service Updates**
   - Updated Auth Service (`src/backend/services/auth.service.ts`)
     - Updated default role in registration to `community_owner`
   - RBAC Service (`src/backend/services/rbac.service.ts`)
     - Verified role permissions are correctly updated
     - No changes needed as it uses types from `rbac.types.ts`

5. **Database Migration**
   - Created migration script (`supabase/migrations/20241230_rename_admin_roles.sql`)
     - Updates roles in auth.users table
     - Updates roles in community_members table
     - Updates community settings
   - Created test script (`supabase/migrations/20241230_rename_admin_roles_test.sql`)
     - Verifies old roles are removed
     - Verifies new roles are present
     - Tests all affected tables

6. **Settings Components**
   - Updated Platform Settings (`src/pages/platform/Settings.tsx`)
     - Renamed component from `AdminSettings` to `PlatformSettings`
     - Updated UI text to use "Platform" terminology
   - Reviewed other settings components
     - `JobBoardSettings.tsx`
     - `BrandingSettings.tsx`
     - `RecruitCRMSettings.tsx`
     - No changes needed as they don't contain role-specific terminology

7. **Navigation Components**
   - Updated Navbar (`src/components/layout/Navbar.tsx`)
     - Updated dashboard link based on user role
     - Changed admin path to platform path
   - Updated Sidebar (`src/components/layout/Sidebar.tsx`)
     - Added role-based navigation
     - Created separate navigation for platform owners
     - Created separate navigation for community owners

8. **Test Implementation**
   - Created Navigation Tests (`src/components/layout/__tests__/Navigation.test.tsx`)
     - Tests for Navbar component
     - Tests for Sidebar component
     - Tests role-based navigation
   - Created RBAC Tests (`src/backend/services/__tests__/rbac.service.test.ts`)
     - Tests platform owner permissions
     - Tests community owner permissions
     - Tests member permissions

9. **Documentation**
   - Created API Reference (`docs/API_REFERENCE.md`)
     - Updated role definitions
     - Updated permission descriptions
     - Added role-specific endpoints
     - Added test accounts
   - Created User Guide (`docs/USER_GUIDE.md`)
     - Added role descriptions
     - Added responsibility lists
     - Added common tasks
     - Added best practices

### 🔄 In Progress

1. **Migration Deployment**
   - Run migration on staging
   - Verify migration results
   - Deploy to production

### ⏳ Pending Changes

None! All planned changes have been implemented.

## Next Steps

1. **Migration Deployment**
   ```sql
   -- Step 1: Run test script
   \i supabase/migrations/20241230_rename_admin_roles_test.sql

   -- Step 2: Run migration
   \i supabase/migrations/20241230_rename_admin_roles.sql

   -- Step 3: Verify results
   SELECT DISTINCT role FROM auth.users;
   SELECT DISTINCT role FROM public.community_members;
   ```

2. **Final Verification**
   - Run test suite
   - Check navigation
   - Verify permissions
   - Review documentation

## Timeline Update

1. **Completed (5 hours)**
   - Type system updates
   - Basic component updates
   - Directory restructuring
   - Service updates
   - Migration scripts
   - Settings components
   - Navigation components
   - Test implementation
   - Documentation updates

2. **Remaining (0.5 hours)**
   - Migration deployment
   - Final verification

## Current Focus

Moving forward with:
1. Migration deployment
2. Final verification

Would you like me to proceed with the migration deployment next?

## Testing Plan

### 1. Unit Tests
- Update role-based test cases
- Verify permission checks
- Test role transitions

### 2. Integration Tests
- Test authentication flows
- Test authorization checks
- Test role-specific features

### 3. UI Testing
- Verify correct role labels
- Test role-specific UI elements
- Verify navigation based on roles

## Rollout Strategy

### Phase 1: Development
1. Create feature branch
2. Implement type system changes
3. Update components and services
4. Update tests

### Phase 2: Testing
1. Deploy to staging environment
2. Perform full test suite
3. Manual testing of role-specific features

### Phase 3: Migration
1. Create database backup
2. Run database migration
3. Deploy code changes
4. Verify role mappings

### Phase 4: Monitoring
1. Monitor error rates
2. Watch for authorization issues
3. Collect user feedback

## Rollback Plan

### If Issues Are Detected
1. Revert database changes
2. Roll back code deployment
3. Restore from backup if necessary

## Timeline

1. Development: 2-3 hours
   - Type system updates
   - Component updates
   - Service updates

2. Testing: 1-2 hours
   - Unit test updates
   - Integration testing
   - UI verification

3. Database Migration: 1 hour
   - Backup
   - Migration
   - Verification

Total Estimated Time: 4-6 hours
