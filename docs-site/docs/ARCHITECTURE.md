# Architecture Overview

## System Overview

Terrarium is structured as a modern web application that serves four main user types:

1. Platform Owners

   - Full platform administration
   - Community oversight
   - User management
   - Platform-wide settings
   - System analytics

2. Community Owners

   - Community management
   - Member oversight
   - Job board customization
   - Community analytics
   - Branding controls

3. Members

   - Job discovery and application
   - Profile management
   - Event participation
   - Community engagement
   - Professional networking

4. Employers
   - Job posting management
   - Talent pool access
   - Brand presence maintenance

## Project Structure

```
terrarium/
├── src/
│   ├── api/                # API client configurations and endpoints
│   │   └── routes/        # API route definitions
│   ├── components/
│   │   ├── platform/      # Platform owner dashboard components
│   │   ├── charts/        # Data visualization components
│   │   ├── features/      # Feature-specific components
│   │   │   ├── platform/  # Platform owner features
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── communities/ # Community management
│   │   │   ├── customization/ # UI customization
│   │   │   ├── events/    # Event management
│   │   │   ├── feed/      # Activity feed
│   │   │   ├── jobs/      # Job board components
│   │   │   ├── member-hub/ # Member hub components
│   │   │   ├── members/   # Member management
│   │   │   ├── onboarding/ # User onboarding
│   │   │   ├── profile/   # User profile
│   │   │   └── settings/  # App settings
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Reusable UI components
│   │       ├── atoms/    # Basic UI elements
│   │       └── molecules/ # Composite components
│   ├── lib/              # Core library code
│   │   ├── api/          # API utilities
│   │   ├── atoms/        # Atomic state primitives
│   │   ├── hooks/        # Custom React hooks
│   │   ├── stores/       # State management
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   ├── pages/            # Page components
│   │   ├── platform/     # Platform owner pages
│   │   ├── auth/         # Authentication pages
│   │   ├── community/    # Community pages
│   │   └── member/       # Member pages
│   ├── services/         # Service layer
│   └── styles/           # Global styles
└── public/              # Static assets
```

## Component Architecture

### Feature Components

- Organized by domain (platform, auth, communities, jobs)
- Clear separation of concerns
- Reusable patterns

### Layout System

- MainLayout for application shell
- CommunityLayout for community-specific views
- Consistent navigation patterns

### UI Component Library

- Atomic design principles
- Reusable UI components
- Consistent styling

## Design Lock and Component Modification

### Design-Locked Components

The following components and directories are design-locked and should not be modified without explicit approval:

1. UI Components (`src/components/ui/`)

   - All base UI components
   - Design system elements
   - Common patterns

2. Layout Components (`src/components/layout/`)

   - Page layouts
   - Navigation structures
   - Common containers

3. Theme Configuration (`src/theme/`)
   - Color schemes
   - Typography
   - Spacing
   - Animation configs

### Modifiable Components

Components that can be modified for new features:

1. Feature Components (`src/components/features/`)

   - Can add new functionality
   - Can modify business logic
   - Must preserve existing UI

2. Pages (`src/pages/`)
   - Can create new pages
   - Can modify page logic
   - Must use existing UI components

### Component Modification Rules

When modifying existing components:

1. **Preserve Design**

   - Keep all Tailwind classes
   - Maintain component structure
   - Keep animations and transitions

2. **Add Functionality**

   - Add new props for behavior
   - Implement new event handlers
   - Add state management

3. **Documentation**
   - Add AI Context comments
   - Document design constraints
   - Note UI preservation requirements

## State Management

### Authentication State

```typescript
// Jotai atoms for global state
userAtom: UserProfile | null
userCommunityAtom: Community | null
currentCommunityAtom: Community | null

// State Flow
1. User logs in -> Session established in Supabase
2. Session triggers -> Profile fetched
3. Profile loaded -> Community data fetched if community owner
4. Community loaded -> State synchronized across app
```

### Community Management

```typescript
// Core Community Type
interface Community {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// Extended Community Settings
interface CommunitySettings {
  branding?: Record<string, any>;
  jobBoard?: {
    requireApproval: boolean;
    categories: string[];
  };
  members?: any[];
  employers?: any[];
}
```

## Security Architecture

### Authentication Flow

1. Supabase handles initial authentication
2. Session persistence managed by Supabase client
3. Protected routes validate user session
4. Role-based access control enforces permissions
5. Community access validated against user role

### Role-Based Access Control (RBAC)

1. User Roles

   - `platform_owner`: Full platform access and administration
   - `community_owner`: Community-specific management and oversight
   - `member`: Basic community participation and job applications
   - `employer`: Job posting and candidate management

2. Permission Structure

   ```typescript
   type Permission = {
     action: 'create' | 'read' | 'update' | 'delete' | 'manage';
     resource:
       | 'jobs'
       | 'profiles'
       | 'community'
       | 'settings'
       | 'members'
       | 'communities'
       | 'platform';
   };
   ```

3. Access Control Implementation

   - Row-level security in Supabase
   - Role-based component rendering
   - Protected route wrappers
   - Community-specific data isolation

4. Role Assignment
   - Roles created dynamically upon user registration
   - Platform owners manage role assignments
   - Community owners manage community-level permissions
   - Default role is 'community_owner'

## Performance Optimization

1. Code Splitting

   - Route-based splitting
   - Component lazy loading
   - Dynamic imports

2. State Management

   - React Query for server state
   - Jotai for client state
   - Optimistic updates

3. Asset Optimization
   - Image optimization
   - Lazy loading
   - CDN delivery

## Error Handling

1. Component Level

   - Error boundaries
   - Fallback UI
   - Loading states
   - User feedback

2. Data Level
   - Type validation
   - API error handling
   - Default values
   - Error logging

## Testing Strategy

1. Unit Tests

   - Component testing
   - Hook testing
   - Utility function testing

2. Integration Tests

   - User flows
   - API integration
   - State management

3. End-to-End Tests
   - Critical paths
   - User journeys
   - Authentication flows
