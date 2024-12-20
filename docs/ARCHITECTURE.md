# Architecture Overview

## System Overview

Terrarium is structured as a modern web application that serves three main user types:

1. Community Administrators

   - Dashboard management
   - Member oversight
   - Job board customization
   - Analytics tracking
   - Branding controls

2. Community Members

   - Job discovery and application
   - Profile management
   - Event participation
   - Community engagement
   - Professional networking

3. Employers
   - Job posting management
   - Talent pool access
   - Brand presence maintenance

## Data Flow

```
src/
├── data/
│   ├── mockJobs.ts       # Centralized job data
│   └── logoColors.json   # Cached color analysis
├── lib/
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Utility functions
│   └── hooks/           # Custom React hooks
└── components/
    ├── jobs/            # Job-related components
    ├── ui/              # Reusable UI components
    └── member/          # Member-specific components
```

## Component Structure

1. Job Board System

   - Centralized job posting management
   - Customizable filters and categories
   - Application tracking
   - Employer integration
   - Analytics and reporting

2. Community Management System

   - Member authentication and authorization
   - Profile management
   - Event organization
   - Content moderation
   - Engagement tracking

3. Analytics Dashboard

   - Real-time metrics
   - Growth tracking
   - Engagement analytics
   - Job board performance
   - Event participation

4. Color Analysis System

   - Logo color extraction
   - Caching mechanism
   - Contrast checking
   - Fallback handling

5. Image Management
   - Optimization
   - Lazy loading
   - Error handling
   - Caching

## Data Management

1. Mock Data

   - Centralized storage
   - Type safety
   - Comprehensive fields
   - Consistent structure

2. State Management

   - React Query for server state
   - Local state management
   - Error handling
   - Loading states

   ### Authentication State

   ```typescript
   // Jotai atoms for global state
   userAtom: UserProfile | null
   userCommunityAtom: Community | null
   currentCommunityAtom: Community | null

   // State Flow
   1. User logs in -> Session established in Supabase
   2. Session triggers -> Profile fetched
   3. Profile loaded -> Community data fetched if admin
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

   // State Flow
   1. Community loaded from userCommunityAtom
   2. Settings synchronized with currentCommunityAtom
   3. Components access community data through atoms
   4. Updates propagate through Jotai subscriptions
   ```

## Performance Considerations

1. Caching

   - Color analysis results
   - Image optimization
   - Query caching
   - State persistence

2. Loading Optimization
   - Lazy loading
   - Progressive loading
   - Placeholder content
   - Error boundaries

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

## Security Architecture

### Authentication Flow

1. Supabase handles initial authentication
2. Session persistence managed by Supabase client
3. Protected routes validate user session
4. Role-based access control enforces permissions
5. Community access validated against user role

### Data Access Control

1. Row-level security in Supabase
2. Role-based component rendering
3. Protected route wrappers
4. Community-specific data isolation

5. Authentication

   - Role-based access control (RBAC)
   - JWT token management
   - Session handling
   - OAuth integration

6. Data Protection

   - Encrypted storage
   - Secure communication
   - Privacy controls
   - GDPR compliance

7. API Security
   - Rate limiting
   - Request validation
   - Error handling
   - Audit logging
