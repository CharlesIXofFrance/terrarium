# Terrarium Codebase Restructuring

## Current Status (as of December 26, 2024)

### Authentication System

#### Current Implementation

```
src/
├── lib/
│   ├── stores/
│   │   └── auth.ts         # Centralized auth store with Jotai atoms
│   ├── hooks/
│   │   └── useAuth.ts      # Auth-related hooks
│   └── supabase.ts         # Supabase client configuration
├── backend/
│   ├── services/
│   │   └── auth.service.ts # Authentication business logic
│   └── types/
│       └── auth.types.ts   # Auth-related type definitions
└── api/
    └── routes/
        └── auth.routes.ts  # Auth-related API routes
```

The authentication system has been consolidated with the following improvements:

- Centralized auth store using Jotai for state management
- Local storage integration for user persistence
- Type-safe implementation throughout
- Clear separation between frontend and backend concerns

#### Current Challenges

1. Jotai atom updates in non-React contexts
2. Complex state synchronization between local storage and Jotai
3. Need for better error handling and recovery
4. Profile creation and management needs streamlining

#### Ideal Setup

```
src/
├── lib/
│   ├── stores/
│   │   └── auth/
│   │       ├── index.ts           # Main auth store exports
│   │       ├── atoms.ts           # Jotai atoms definitions
│   │       ├── actions.ts         # Auth actions (login, logout, etc.)
│   │       └── persistence.ts     # Local storage management
│   ├── hooks/
│   │   └── auth/
│   │       ├── index.ts           # Hook exports
│   │       ├── useAuth.ts         # Main auth hook
│   │       ├── useProfile.ts      # Profile management
│   │       └── useSession.ts      # Session management
│   └── supabase/
│       ├── index.ts               # Client exports
│       ├── config.ts              # Configuration
│       └── types.ts               # Supabase specific types
├── backend/
│   ├── services/
│   │   └── auth/
│   │       ├── index.ts           # Service exports
│   │       ├── auth.service.ts    # Core auth logic
│   │       ├── profile.service.ts # Profile management
│   │       └── session.service.ts # Session handling
│   └── types/
│       └── auth/
│           ├── index.ts           # Type exports
│           ├── user.types.ts      # User-related types
│           └── session.types.ts   # Session-related types
└── api/
    └── routes/
        └── auth/
            ├── index.ts           # Route exports
            ├── auth.routes.ts     # Auth endpoints
            └── profile.routes.ts  # Profile endpoints
```

### Recommended Next Steps

1. Authentication Improvements

   - [ ] Implement proper error boundaries for auth failures
   - [ ] Add refresh token handling
   - [ ] Improve session persistence
   - [ ] Add proper loading states
   - [ ] Implement proper logout cleanup

2. Profile Management

   - [ ] Add proper profile update validation
   - [ ] Implement profile completion flow
   - [ ] Add avatar upload handling
   - [ ] Implement profile privacy settings

3. Authorization

   - [ ] Implement proper RBAC
   - [ ] Add permission checking utilities
   - [ ] Implement route guards
   - [ ] Add role-based component rendering

4. Testing

   - [ ] Add comprehensive auth flow tests
   - [ ] Implement proper mocking for Supabase
   - [ ] Add integration tests
   - [ ] Test error scenarios

5. Security
   - [ ] Implement proper token management
   - [ ] Add request rate limiting
   - [ ] Implement proper password policies
   - [ ] Add security headers

### Migration Strategy

1. Phase 1: Core Auth Restructuring (Completed)

   - Consolidate auth store
   - Implement proper type safety
   - Add local storage persistence
   - Clean up redundant files

2. Phase 2: Profile Management (In Progress)

   - Implement profile service
   - Add profile validation
   - Improve error handling
   - Add proper loading states

3. Phase 3: Authorization System

   - Design RBAC system
   - Implement permission checks
   - Add role management
   - Update UI components

4. Phase 4: Security Hardening
   - Audit authentication flow
   - Implement security best practices
   - Add monitoring and logging
   - Perform security testing

### Technical Debt Items

1. Authentication

   - Jotai atom updates in non-React contexts need resolution
   - Error handling needs improvement
   - Session management needs refinement
   - Profile creation flow needs streamlining

2. Testing

   - Need more comprehensive auth tests
   - Better test coverage for error scenarios
   - Integration tests needed
   - Performance testing required

3. Documentation
   - API documentation needs updating
   - Auth flow documentation needed
   - Security practices need documentation
   - Testing guidelines need updating

### Questions to Address

1. Authentication

   - How to handle auth state in SSR?
   - Best approach for refresh token handling?
   - How to manage multiple sessions?
   - Strategy for handling auth timeouts?

2. Profile Management

   - What fields should be required vs optional?
   - How to handle profile privacy?
   - Strategy for profile completion enforcement?
   - Approach for profile data validation?

3. Authorization
   - What roles are needed?
   - How granular should permissions be?
   - How to handle role inheritance?
   - Strategy for permission caching?
