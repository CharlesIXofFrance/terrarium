# File Organization Guide

## Directory Structure

```
src/
├── pages/                    # Page components
│   ├── auth/                # Authentication pages
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── member/              # Member-specific pages
│   │   ├── JobBoard.tsx
│   │   └── Events.tsx
│   └── community/           # Community admin pages
│       ├── Dashboard.tsx
│       └── Settings.tsx
│
├── components/
│   ├── features/            # Feature-specific components
│   │   ├── auth/           # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── jobs/          # Job-related components
│   │   │   ├── JobList.tsx
│   │   │   └── JobCard.tsx
│   │   ├── events/        # Event-related components
│   │   │   ├── Calendar.tsx
│   │   │   └── EventList.tsx
│   │   └── members/       # Member-related components
│   │       ├── profile/
│   │       └── settings/
│   │
│   ├── ui/                # Generic UI components
│   │   ├── atoms/        # Basic UI elements
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── molecules/    # Composed UI components
│   │       ├── Card.tsx
│   │       └── Modal.tsx
│   │
│   ├── charts/           # Chart components
│   │   └── LineChart.tsx
│   │
│   └── layout/           # Layout components
│       ├── molecules/    # Layout-specific molecules
│       │   ├── Hero.tsx
│       │   ├── Features.tsx
│       │   ├── CTA.tsx
│       │   ├── Tabs.tsx
│       │   └── ErrorBoundary.tsx
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
│
└── lib/                  # Application logic
    ├── hooks/           # Custom hooks
    │   ├── useAuth.ts
    │   └── useEvents.ts
    ├── stores/          # State management
    │   ├── auth.ts
    │   └── community.ts
    ├── types/           # TypeScript types
    └── mocks/           # Mock data
```

## Import Rules

1. Always use path aliases:

   ```typescript
   // ✅ Good
   import { Button } from '@/components/ui/atoms/Button';
   import { Hero } from '@/components/layout/molecules/Hero';
   import { LineChart } from '@/components/charts/LineChart';
   import { useAuth } from '@/lib/hooks/useAuth';

   // ❌ Bad
   import { Button } from '../../components/ui/Button';
   import { Hero } from '../components/Hero';
   import { LineChart } from '../../components/charts/LineChart';
   import { useAuth } from '../lib/hooks/useAuth';
   ```

2. Component Categories:

   - `features/`: Feature-specific components (e.g., auth, jobs, events)
   - `ui/atoms/`: Basic UI elements (Button, Input, etc.)
   - `ui/molecules/`: Generic composed UI components (Card, Modal, etc.)
   - `charts/`: Data visualization components (LineChart, etc.)
   - `layout/`: Layout components (Navbar, Footer, etc.)
   - `layout/molecules/`: Layout-specific molecules (Hero, Features, CTA, Tabs, etc.)

3. File Naming:
   - Components: PascalCase (e.g., `Button.tsx`, `JobCard.tsx`)
   - Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`, `useJobs.ts`)
   - Types: PascalCase (e.g., `User.ts`, `Job.ts`)

## Common Issues

1. Import Resolution:

   - Always use `@/` path alias instead of relative paths
   - Check component category (ui/features/layout/charts) when importing
   - Verify file exists in the correct directory

2. Component Organization:

   - Feature-specific components go in `features/[feature]/`
   - Generic UI components go in `ui/atoms/` or `ui/molecules/`
   - Chart components go in `charts/`
   - Layout components go in `layout/`
   - Layout-specific UI components go in `layout/molecules/`

3. State Management:

   - Global state: `lib/stores/`
   - Component state: Use React hooks
   - API state: Use React Query

4. Type Safety:
   - Define types in `lib/types/`
   - Use TypeScript interfaces and types
   - Avoid using `any`

## Migration Process

When moving a component:

1. **Create the new directory** if it doesn't exist
2. **Move the component** to its new location
3. **Update imports** in the moved component to use path aliases
4. **Update all references** to the component in other files
5. **Test the component** in all its usage locations
6. **Remove the old component** only after confirming everything works

## Component Structure

### UI Components (`/components/ui/`)

- **Atoms**: Basic UI elements

  - Button
  - Input
  - Label
  - CircularProgress
  - ProgressBar
  - Icons and Loading States

- **Molecules**: Combined components
  - Card
  - Modal
  - Toast system
  - CTA
  - ErrorBoundary
  - Features
  - Hero

### Layout Components (`/components/layout/`)

- CommunityLayout
- MainLayout
- Navbar
- Sidebar
- Footer

## Import Path Configuration

### Path Aliases

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@features/*": ["./src/components/features/*"],
      "@ui/*": ["./src/components/ui/*"],
      "@lib/*": ["./src/lib/*"],
      "@utils/*": ["./src/lib/utils/*"],
      "@stores/*": ["./src/lib/stores/*"],
      "@types/*": ["./src/lib/types/*"]
    }
  }
}
```

## Import Best Practices

1. Use path aliases for imports:

```typescript
// Good
import { JobCard } from '@features/jobs/JobCard';
import { Button } from '@ui/atoms/Button';

// Bad
import { JobCard } from '../../components/features/jobs/JobCard';
import { Button } from '../../../components/ui/atoms/Button';
```

2. Import order:

```typescript
// 1. External packages
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal utilities and stores
import { useJobs } from '@lib/hooks/useJobs';
import { jobsStore } from '@stores/jobs';

// 3. Components
import { JobCard } from '@features/jobs/JobCard';
import { Button } from '@ui/atoms/Button';

// 4. Types
import type { Job } from '@types/jobs';
```

## Important: Path Aliases

All imports MUST use path aliases instead of relative paths. This ensures imports continue to work when files are moved and prevents 404/500 errors.

```typescript
// ✅ CORRECT: Use path aliases
import { JobHeader } from '@/components/features/jobs/JobHeader';
import { useJobs } from '@/lib/hooks/useJobs';
import type { Job } from '@/lib/types';

// ❌ WRONG: Don't use relative paths
import { JobHeader } from '../../components/jobs/JobHeader';
import { useJobs } from '../../../lib/hooks/useJobs';
import type { Job } from '../../lib/types';
```

## Files Requiring Import Updates

The following files need their import paths updated to use the new feature component locations:

1. Job-related imports:

- `src/pages/jobs/JobBoard.tsx`
- `src/pages/jobs/JobDetails.tsx`
- `src/pages/jobs/Jobs.tsx`

2. Member Hub imports:

- `src/pages/member/Feed.tsx`
- `src/pages/member/MemberHub.tsx`
- `src/components/layout/MemberLayout.tsx`

## Migration Steps

1. Update all import paths to use the new feature component locations
2. Use path aliases instead of relative paths
3. Test each updated component to ensure proper rendering
4. Update any dynamic imports to use the new paths
5. Update any lazy-loaded component paths

## Core Functionality

### API (`/lib/api/`)

- Centralized API management
- api.ts: Core API utilities and endpoints
  - Moved from /lib/utils/api.ts
  - Contains communityApi, jobsApi, and employersApi
- index.ts: Exports all API modules
  - Exports from auth, recruitcrm, api, and jobs
  - Provides combined api object for convenience
- Updated imports in:
  - pages/community/Employers.tsx
  - pages/community/Members.tsx
  - lib/utils/jobs.ts

### Hooks (`/lib/hooks/`)

- All hooks properly organized

### Stores (`/lib/stores/`)

- Consolidated from /store and /stores
- Moved auth store
- Moved community store
- Moved jobs store
- jobs.ts: Job state management
  - jobsAtom: Main jobs store
  - filteredJobsAtom: Filtered jobs derived state
  - Updated imports to use domain types
- auth.ts: Authentication state management
  - userAtom: Current user state
  - userCommunityAtom: User's primary community
  - isLoadingAtom: Auth loading state
  - authErrorAtom: Auth error state
  - initAuth: Initialize authentication
  - Updated to handle both owned and member communities
- community.ts: Community state management
  - currentCommunityAtom: Active community
  - communityLoadingAtom: Community loading state
  - communityErrorAtom: Community error state
  - communityStateAtom: Combined community state
  - Updated loading state handling

### Utils (`/lib/utils/`)

- All utilities properly organized
- env.ts for environment variables
  - Located at /lib/utils/env.ts
  - Updated imports in RecruitCRMSettings.tsx and features/settings/RecruitCRMSettings.tsx
- recruitcrm.ts contains RecruitCRMService
  - Located at /lib/utils/recruitcrm.ts
  - Updated imports in useRecruitCRM.ts to use correct path
  - Service remains in utils for now as it contains validation schemas and mock data
- jobs.ts: Job service utilities
  - Updated to use api from /lib/api
  - Uses domain types from /lib/types/domain/jobs
  - Added getRelatedJobs helper function
  - Used by RelatedJobs component
  - Simplified API calls to use direct return
- utils.ts contains common utility functions
  - cn: Tailwind class name utility
  - formatDate: Date formatting utility
  - formatCurrency: Currency formatting utility
  - logError: Error logging utility
- index.ts exports
  - Re-exports all utilities from utils.ts
  - Exports queryClient configuration

### Import Paths

#### Standard Import Structure

1. Core Imports

   - React and hooks from 'react'
   - Navigation from 'react-router-dom'
   - State management from 'jotai'
   - Icons from 'lucide-react'

2. Internal Imports

   - Stores: from '../../lib/stores/[store]'
   - Components: from '../../components/[type]/[Component]'
   - Types: from '../../lib/types/[domain]/[type]'
   - Utils: from '../../lib/utils/[util]'

3. Import Order
   - External packages first
   - Internal modules second
   - Components third
   - Types last

### Components (`/components/`)

- Jobs components
  - JobList.tsx and JobCard.tsx
    - Updated to use domain job types
    - Fixed import paths
  - RelatedJobs.tsx
    - Updated to use getRelatedJobs utility
    - Uses communitySlug from URL params
    - Fixed navigation paths
- Layout components
  - CommunityLayout.tsx
    - Handles community loading state
    - Shows loading spinner during community fetch
    - Redirects to home if no community found
    - Updated to use communityLoadingAtom
  - MemberLayout.tsx
    - Member-specific layout component
    - Uses community state for navigation

### Pages (`/pages/`)

- community/
  - Dashboard.tsx
    - Uses currentCommunityAtom for state
    - Shows loading state while community loads
    - Updated error handling
  - Members.tsx, Jobs.tsx, etc.
    - Updated to use community state consistently

### App.tsx

- Main application component
- Updated session handling
  - Checks for owned communities
  - Falls back to member communities
  - Sets loading states appropriately
  - Improved error handling

## Constants (`/lib/constants/`)

- Moved logoColors from /data

## Mocks (`/lib/mocks/`)

- Moved mockJobs from /data

## Data Organization

#### Mock and Static Data (`/lib/data`)

1. Logo Colors

   - logoColors.json: Raw color data
   - logoColors.ts: TypeScript interface and exports
   - Used for job listing company logos
   - Contains color palettes and contrast ratios

2. Mock Data (`/lib/mocks`)

   - mockJobs.ts: Sample job listings
   - Used for development and testing
   - Follows production data schema

3. Data Structure

   - JSON files for static data
   - TypeScript files for type definitions
   - Index files for clean exports
   - Mocks follow production schemas

4. Migration Status
   - [x] Moved logoColors.json to /lib/data
   - [x] Created logoColors.ts with types
   - [x] Created index.ts for exports
   - [x] Updated imports in components
   - [ ] Remove old /data directory

## Mock Data Management

#### Development Data

1. Mock Jobs

   - Located in `/lib/mocks/mockJobs.ts`
   - Used for development and testing
   - Contains realistic job data
   - Used as initial state in jobs store

2. Usage in Stores

   - Jobs store initialized with mock data
   - Allows immediate data display
   - Can be overridden with real data
   - Maintains consistent UI during development

3. Data Structure
   - Follows production data schema
   - Includes all required fields
   - Contains realistic content
   - Used for UI testing

## Import Updates

#### Data Imports

1. Updated Paths

   - Mock Jobs: from '../lib/data/mockJobs'
   - Logo Colors: from '../lib/data/logoColors'
   - Types: from '../lib/types/jobs'

2. Components Updated

   - [x] WorkingAtCompany.tsx
   - [x] CompanyInsights.tsx
   - [x] useCompanyColors.ts
   - [x] jobs.ts store

3. Remaining Tasks
   - [ ] Remove old /data directory after testing
   - [ ] Update any new components using mock data
   - [ ] Add tests for data imports

## State Management

### Community State Management

1. Store Structure (`/lib/stores/community.ts`)

   - Base atoms for internal state
     - \_currentCommunityAtom
     - \_communityLoadingAtom
     - \_communityErrorAtom
   - Derived read-write atoms with logging
     - currentCommunityAtom
     - communityLoadingAtom
     - communityErrorAtom
   - Combined state atom
     - communityStateAtom

2. Loading Flow

   - Initial load in App.tsx
     - Parallel fetch of profile and community
     - Sets initial community state
   - CommunityLayout handling
     - Manages loading states
     - Fetches community by slug if needed
     - Updates global community state
   - Dashboard consumption
     - Uses combined communityStateAtom
     - Shows loading/error states
     - Redirects if no community found

3. Error Handling
   - Centralized error state
   - Proper error messages
   - Loading state management
   - Fallback UI components

### Auth State Management

1. Store Structure (`/lib/stores/auth.ts`)

   - User state
   - Community membership
   - Loading states
   - Error handling

2. Session Flow
   - Initial session check
   - Auth state changes
   - Profile loading
   - Community association

### Jobs State Management

#### Store Structure

1. Base Atoms

   - \_jobsAtom: Initialized with mock data
   - \_jobsLoadingAtom: Loading state
   - \_jobsErrorAtom: Error state

2. Derived Atoms

   - jobsAtom: Read-write with logging
   - filteredJobsAtom: Filtered view of jobs
   - selectedJobAtom: Currently selected job
   - jobsStateAtom: Combined state

3. State Flow
   - Initial state from mock data
   - Filtering through filteredJobsAtom
   - Selection through selectedJobAtom
   - Loading and error states

### Components

- Layout components

  - CommunityLayout.tsx
    - Handles community loading state
    - Shows loading spinner during community fetch
    - Redirects to home if no community found
    - Updated to use communityLoadingAtom
    - Added fallback to fetch by slug
  - MemberLayout.tsx
    - Member-specific layout component
    - Uses community state for navigation

- Pages
  - community/
    - Dashboard.tsx
      - Uses currentCommunityAtom for state
      - Shows loading state while community loads
      - Updated error handling
    - Members.tsx, Jobs.tsx, etc.
      - Updated to use community state consistently

## Loading State Management

### Community Loading

1. Initial Load

   - Loading state shown only when no community is loaded
   - Skip loading if community already exists
   - Prevent loading loops with mounted check
   - Clear loading state on unmount

2. Loading Conditions

   - Initial page load
   - Community switch
   - Slug change
   - User context change

3. Loading UI
   - Centered loading spinner
   - Consistent across components
   - Only shown on initial load
   - Fallback to redirect on error

## Migration Status

### Completed Moves

- All UI components
- All feature components
- All layout components
- All API files
- All Store files
- All Type files
- All Constants
- All Mocks

### Import Path Updates

- App.tsx
- Auth components
  - LoginForm
  - RegisterForm
  - ProtectedRoute
  - RBACRoute
  - EmailVerification
  - AuthGuard
- Jobs components
  - JobCard
  - JobFilters
  - CompanyInsights
  - JobList.tsx and JobCard.tsx
    - Updated to use domain job types
    - Fixed import paths
- Members components
  - MemberLayout
- Settings components
  - RecruitCRMSettings
- Customization components
  - PagePreview
  - StyleEditor
- Member Hub components
  - MemberHub
  - OpportunitiesSection
- Onboarding components
  - OnboardingFlow
- Layout components
  - CommunityLayout
  - MainLayout
  - Navbar
  - Sidebar
- UI components
  - Tabs (updated imports in ProfileTabs.tsx)
  - Input (updated imports in RecruitCRMSettings.tsx)
  - CircularProgress (updated imports in CompanyInsights.tsx)
  - ProgressBar (updated imports in ProfileHeader.tsx)

### Next Steps

### 1. Directory Consolidation

- [ ] Move `/store` and `/stores` to `/lib/stores`

  - [ ] Update imports in all files
  - [ ] Create index.ts for store exports
  - [ ] Remove empty directories

- [ ] Move `/hooks` to `/lib/hooks`

  - [ ] Update hook imports
  - [ ] Create domain-specific hook folders
  - [ ] Add index.ts for hook exports

- [ ] Move `/data` to `/lib/data`
  - [ ] Update mock data imports
  - [ ] Create index.ts for data exports
  - [ ] Remove old data directory

### 2. Component Organization

- [ ] Standardize UI Components

  - [ ] Move remaining components to `/components/ui`
  - [ ] Create component categories (atoms, molecules, organisms)
  - [ ] Add index.ts files for exports

- [ ] Feature Components
  - [ ] Organize by domain (jobs, community, auth)
  - [ ] Create feature-specific folders
  - [ ] Add README for each feature

### 3. Type Organization

- [ ] Consolidate Types
  - [ ] Move all types to `/lib/types`
  - [ ] Create domain folders (ui, api, domain)
  - [ ] Add proper type exports
  - [ ] Update type imports

### 4. Documentation

- [x] Update documentation with data organization
- [x] Update documentation with import updates
- [ ] Add component organization guide
- [ ] Document type structure
- [ ] Create migration checklist

### Current Progress

- [x] Initial file structure setup
- [x] Basic component organization
- [x] Store refactoring
- [x] Mock data integration
- [ ] Directory consolidation
- [ ] Component standardization
- [ ] Type organization
- [ ] Documentation updates

### Safety Measures

- All moves done using copy operations
- Original files remain as backup
- Directory structure preserves component relationships
- Import paths updated
