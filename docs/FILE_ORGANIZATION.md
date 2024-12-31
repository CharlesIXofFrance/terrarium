# Terrarium Project File Organization

## Project Structure Overview

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
│   │   │   │   ├── JobList.tsx
│   │   │   │   ├── JobFilters.tsx
│   │   │   │   └── SelectedFilters.tsx
│   │   │   ├── member-hub/ # Member hub components
│   │   │   ├── members/   # Member management
│   │   │   ├── onboarding/ # User onboarding
│   │   │   ├── profile/   # User profile
│   │   │   └── settings/  # App settings
│   │   ├── layout/       # Layout components
│   │   │   ├── MainLayout.tsx
│   │   │   └── CommunityLayout.tsx
│   │   ├── onboarding/   # Onboarding flows
│   │   ├── routing/           # Routing components
│   │   │   ├── SubdomainRouter.tsx    # Main subdomain-based router
│   │   │   ├── CommunityRoutes.tsx    # Community-specific routes
│   │   │   └── PlatformRoutes.tsx     # Platform admin routes
│   │   └── ui/           # Reusable UI components
│   │       ├── atoms/    # Basic UI elements
│   │       └── molecules/ # Composite components
│   ├── lib/              # Core library code
│   │   ├── api/          # API utilities
│   │   ├── atoms/        # Atomic state primitives
│   │   ├── constants/    # Application constants
│   │   ├── data/         # Data utilities
│   │   ├── hooks/        # Custom React hooks
│   │   │   ├── useJobs.ts
│   │   │   ├── useScrollSync.ts
│   │   │   └── useScrollEnd.ts
│   │   ├── mocks/        # Test mocks
│   │   ├── stores/       # State management
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utility functions
│   │   │   └── subdomain.ts   # Subdomain handling utilities
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── platform/     # Platform owner pages
│   │   ├── auth/         # Authentication pages
│   │   ├── community/    # Community pages
│   │   ├── member/       # Member pages
│   │   ├── Communities.tsx
│   │   ├── JobBoard.tsx
│   │   └── LandingPage.tsx
│   ├── services/         # Service layer
│   ├── stores/           # Global state
│   ├── styles/           # Global styles
│   └── utils/            # Utility functions
├── docs/                 # Documentation
└── public/              # Static assets
```

## Routing Architecture

The application uses a subdomain-based routing structure for multi-tenant separation:

- **Main Domain** (`terrarium.dev`):
  - Landing page
  - Main authentication
  - Marketing pages

- **Platform Subdomain** (`platform.terrarium.dev`):
  - Platform admin dashboard
  - Community management
  - User management

- **Community Subdomains** (`[community-slug].terrarium.dev`):
  - Community dashboard
  - Member area
  - Community settings

### Local Development

For local development, subdomains are simulated using URL parameters:
- Main app: `http://localhost:3000`
- Platform: `http://localhost:3000?subdomain=platform`
- Community: `http://localhost:3000?subdomain=community-slug`

## Component Organization

### Features

Feature-specific components are organized by domain:

#### Platform
- Platform owner dashboard components
- Community oversight tools
- User management interfaces

#### Authentication
- Login/Register forms
- Authentication flows
- Password reset

#### Communities
- Community creation
- Community settings
- Member management

#### Jobs
- `JobList.tsx`: Job card grid with infinite scroll
- `JobFilters.tsx`: Filter sidebar
- `SelectedFilters.tsx`: Active filter display

#### Member Hub
- `Header.tsx`: Navigation header
- `MemberFooter.tsx`: Footer component
- Profile management
- Activity feeds

### Layout
- `MainLayout.tsx`: Application shell
- `CommunityLayout.tsx`: Community-specific layout

### UI Components
- **Atoms**: Buttons, inputs, icons
- **Molecules**: Forms, cards, modals

## Core Libraries

### Hooks
- Authentication hooks
- Data fetching hooks
- UI utility hooks
- Scroll management hooks

### State Management
- Jotai atoms for global state
- Community state
- User state
- UI state

### Services
- API services
- Authentication services
- Data services
- File upload services

## Pages

### Platform
- Dashboard
- User management
- Settings

### Auth
- Login
- Register
- Password reset

### Community
- Community home
- Member management
- Events
- Jobs

### Member
- Profile
- Settings
- Activity

## Best Practices

1. **Component Organization**
   - Feature-first architecture
   - Clear separation of concerns
   - Reusable UI components

2. **State Management**
   - Jotai for global state
   - React Query for server state
   - Local state when appropriate

3. **Type Safety**
   - Comprehensive type definitions
   - Strict type checking
   - Interface-first development

4. **Code Style**
   - Consistent file naming
   - Clear component structure
   - Proper documentation

## Future Considerations

1. **Scalability**
   - Code splitting strategies
   - Performance optimization
   - Caching strategies

2. **Maintainability**
   - Testing strategy
   - Documentation updates
   - Code review process

3. **Feature Expansion**
   - New feature integration
   - State management scaling
   - Component reusability
