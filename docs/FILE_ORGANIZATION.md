# File Organization

## Component Structure

### UI Components (`/components/ui/`)

- **Atoms**: Basic UI elements

  - Button
  - Input (moved from /components/ui/)
    - Updated imports in RecruitCRMSettings.tsx
  - Label
  - CircularProgress (moved from /components/ui/)
    - Updated imports in CompanyInsights.tsx
  - ProgressBar (moved from /components/ui/)
    - Updated imports in ProfileHeader.tsx
  - Icons and Loading States
    - Icon Usage
      - Using lucide-react for consistent icon set
      - Icons imported directly from lucide-react
      - Common icons:
        - Loader2: Loading spinner
        - Users: Member management
        - TrendingUp: Analytics
        - Eye: Visibility
        - ArrowUpRight/ArrowDownRight: Trends
    - Loading States
      - Consistent loading UI across components
      - Centered loading spinners
      - Proper loading state management
      - Fallback UI components

- **Molecules**: Combined components
  - Card
  - Tabs (moved from /components/ui/)
    - Updated imports in ProfileTabs.tsx
  - Toast system
  - CTA
  - ErrorBoundary
  - Features
  - Hero

### Feature Components (`/components/features/`)

- **Jobs**

  - Benefits
  - CareerConsult
  - CompanyInsights
  - EmployeesTake
  - JobCard
  - JobFilters
  - JobHeader
  - JobList
  - JobPostingForm
  - RelatedJobs
  - RoleDetails
  - SelectedFilters
  - SisterScoreCard
  - WorkingAtCompany

- **Members**

  - MemberLayout
  - Profile components (in profile/ subdirectory)

- **Settings**

  - RecruitCRMSettings

- **Auth**

  - Auth (root component)
  - AuthGuard
  - EmailVerification
  - LoginForm
  - ProtectedRoute
  - RBACRoute
  - RegisterForm

- **Events**

  - Calendar
  - EventList

- **Communities**

  - CommunityCard

- **Customization**

  - PagePreview
  - StyleEditor
  - Preview components

- **Member Hub**

  - CareerAcademy
  - Header
  - LiveFeed
  - MemberHub
  - OpportunitiesSection
  - ProfileSection
  - UpcomingEvents

- **Onboarding**
  - OnboardingFlow

### Layout Components (`/components/layout/`)

- CommunityLayout
- MainLayout
- Navbar
- Sidebar
- Footer

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
