# File Organization Guide

## Directory Structure

```
src/
├── backend/               # Backend-specific modules
│   ├── services/          # Business logic services
│   │   ├── auth/         # Authentication services
│   │   │   ├── index.ts
│   │   │   └── auth.service.ts
│   │   └── user/         # User management services
│   │       ├── index.ts
│   │       └── user.service.ts
│   └── types/            # Backend type definitions
│       ├── auth/         # Auth-related types
│       │   ├── index.ts
│       │   └── auth.types.ts
│       └── user/         # User-related types
│           ├── index.ts
│           └── user.types.ts
├── lib/                  # Shared utilities and hooks
│   ├── stores/           # State management
│   │   ├── auth.ts      # Authentication store
│   │   └── community.ts # Community store
│   ├── hooks/           # React hooks
│   │   ├── useAuth.ts
│   │   └── useProfile.ts
│   └── supabase.ts      # Supabase client configuration
├── api/                  # API routes and controllers
│   └── routes/          # Route definitions
│       ├── auth.routes.ts
│       └── user.routes.ts
└── components/          # React components
    ├── features/        # Feature-specific components
    │   └── auth/       # Authentication components
    │       ├── LoginForm.tsx
    │       └── RegisterForm.tsx
    └── ui/             # Shared UI components
        ├── atoms/      # Basic UI elements
        └── molecules/  # Composite components
```

## Module Organization

### Authentication System

The authentication system is organized across several directories for clear separation of concerns:

1. **Backend Layer** (`src/backend/`)
   - `services/auth/auth.service.ts`: Core authentication logic
   - `types/auth/auth.types.ts`: Type definitions for auth entities

2. **State Management** (`src/lib/stores/`)
   - `auth.ts`: Jotai-based auth store
   - Handles user state and persistence
   - Manages loading and error states

3. **API Layer** (`src/api/routes/`)
   - `auth.routes.ts`: Authentication endpoints
   - Handles request/response for auth operations

4. **React Integration** (`src/lib/hooks/`)
   - `useAuth.ts`: Authentication hook
   - Provides auth state and methods to components

5. **UI Components** (`src/components/features/auth/`)
   - Authentication-specific components
   - Forms and user interfaces

## File Naming Conventions

1. **TypeScript Files:**
   - Services: `*.service.ts`
   - Types: `*.types.ts`
   - Routes: `*.routes.ts`
   - Components: `*.tsx`
   - Tests: `*.test.ts(x)`

2. **Component Organization:**
   - Feature-specific components go in `features/[feature]/`
   - Generic UI components go in `ui/atoms/` or `ui/molecules/`
   - Each feature folder should have its own index.ts

## Import Guidelines

1. **Absolute Imports:**
   ```typescript
   import { User } from '@backend/types/auth.types';
   import { useAuth } from '@lib/hooks/useAuth';
   ```

2. **Relative Imports:**
   ```typescript
   import { LoginForm } from './components/LoginForm';
   import { authService } from '../services/auth.service';
   ```

## Best Practices

1. **Type Safety:**
   - Use TypeScript for all new files
   - Define interfaces in appropriate type files
   - Avoid using `any` type

2. **State Management:**
   - Use Jotai for global state
   - Keep atoms in dedicated store files
   - Implement proper persistence when needed

3. **Component Structure:**
   - Use functional components
   - Implement proper prop typing
   - Keep components focused and small

4. **Testing:**
   - Place tests next to implementation files
   - Use proper naming for test files
   - Implement comprehensive test coverage

## Documentation

1. **Code Comments:**
   - Add JSDoc comments for functions
   - Document complex logic
   - Include usage examples

2. **README Files:**
   - Add README.md in feature directories
   - Document component usage
   - Include setup instructions

3. **Type Documentation:**
   - Document interfaces and types
   - Include example usage
   - Document validation rules

## Version Control

1. **Branch Naming:**
   - Feature: `feature/auth-system`
   - Fix: `fix/auth-error`
   - Refactor: `refactor/auth-store`

2. **Commit Messages:**
   - Start with type: feat, fix, refactor
   - Include scope: (auth), (profile)
   - Add clear description

## Security Considerations

1. **Authentication:**
   - Implement proper token handling
   - Use secure session management
   - Follow security best practices

2. **Data Protection:**
   - Validate all inputs
   - Sanitize outputs
   - Handle sensitive data carefully

## Performance Guidelines

1. **Code Splitting:**
   - Use lazy loading for routes
   - Split vendor bundles
   - Implement proper chunking

2. **State Management:**
   - Minimize global state
   - Use proper memoization
   - Implement efficient updates
