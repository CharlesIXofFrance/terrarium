# Terrarium Authentication System

> Technical Specification & Implementation Guide

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Authentication Flows](#3-authentication-flows)
4. [Implementation Details](#4-implementation-details)
5. [Testing Strategy](#5-testing-strategy)
6. [Deployment & Configuration](#6-deployment--configuration)
7. [Troubleshooting Guide](#7-troubleshooting-guide)
8. [Migration Plan](#8-migration-plan)

## 1. System Overview

### 1.1 Purpose

The Terrarium authentication system provides secure, role-based access control for community owners and members using Supabase's built-in authentication services. This system handles user registration, login, session management, and role-based access control.

### 1.2 Current Schema Structure

```sql
-- Core Tables
public.profiles (
    id uuid PRIMARY KEY,
    email text UNIQUE,
    role app_role,
    first_name text,
    last_name text,
    onboarding_complete boolean,
    email_verified boolean
)

public.community_members (
    id uuid PRIMARY KEY,
    profile_id uuid,
    community_id uuid,
    role app_role,
    status text,
    onboarding_complete boolean
)
```

### 1.3 Key Components

1. **Authentication Service**: Supabase Auth
2. **Database**: PostgreSQL with RLS
3. **API Layer**: Supabase Client
4. **Frontend**: React/Next.js with TypeScript

## 2. Architecture

### 2.1 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Supabase
    participant Database

    User->>Frontend: Enter Credentials
    Frontend->>Supabase: signInWithPassword()
    Supabase-->>Database: Verify Credentials
    Database-->>Supabase: Return User Data
    Supabase-->>Frontend: Return Session
    Frontend->>User: Redirect to Dashboard
```

### 2.2 Component Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client configuration
│   ├── hooks/
│   │   └── useAuth.ts       # Authentication hook
│   └── utils/
│       └── auth.types.ts    # Type definitions
├── components/
│   └── features/
│       └── auth/
│           ├── PlatformLogin.tsx
│           └── PlatformRegister.tsx
└── pages/
    ├── login.tsx
    ├── register.tsx
    └── auth/
        └── callback.tsx
```

## 3. Authentication Flows

### 3.1 Platform Registration

1. User navigates to `/register`
2. Enters email and password
3. System creates user in Supabase Auth
4. Triggers `handle_auth_user_created()` function
5. Creates profile with default role
6. Redirects to `/login`

### 3.2 Platform Login

1. User navigates to `/login`
2. Enters credentials
3. System verifies with Supabase Auth
4. Creates session
5. Redirects to `/dashboard`

### 3.3 Session Management

```typescript
// Session handling in useAuth hook
useEffect(() => {
  // Initial session check
  supabase.auth.getSession();

  // Subscribe to auth changes
  const { subscription } = supabase.auth.onAuthStateChange();

  return () => subscription.unsubscribe();
}, []);
```

## 4. Implementation Details

### 4.1 Environment Configuration

```bash
# .env.local
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4.2 Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: localStorage,
    },
  }
);
```

### 4.3 Auth Hook Implementation

```typescript
// src/lib/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    isLoading,
    signIn: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email: string, password: string) =>
      supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };
};
```

### 4.4 UI Components

```typescript
// src/components/features/auth/PlatformLogin.tsx
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/router'

export const PlatformLogin = () => {
  const { signIn } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" data-testid="email-input" required />
      <input type="password" name="password" data-testid="password-input" required />
      {error && <div data-testid="error-message">{error}</div>}
      <button type="submit" data-testid="submit-button">Login</button>
    </form>
  )
}
```

## 5. Testing Strategy

### 5.1 Test Environment Setup

```yaml
# docker-compose.test.yml
services:
  auth:
    container_name: terrarium-test-auth
    environment:
      GOTRUE_DB_HOST: terrarium-test-db
      DATABASE_URL: postgres://postgres:postgres@terrarium-test-db:5432/postgres?sslmode=disable
```

### 5.2 Test Helpers

```typescript
// e2e/utils/test-helpers.ts
import { createClient } from '@supabase/supabase-js';

export const adminClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const createTestUser = async (email: string, password: string) => {
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
};

export const clearAuthState = async (page: Page) => {
  await page.evaluate(() => {
    localStorage.removeItem('sb-auth-token');
  });
};

export const cleanupTestEnvironment = async (page: Page) => {
  await clearAuthState(page);
  await deleteTestUsers();
};
```

### 5.3 Test Scenarios

1. Registration Flow
2. Login Flow
3. Session Management
4. Error Handling
5. Role-based Access

## 6. Deployment & Configuration

### 6.1 Production Configuration

```yaml
# kong.yml
services:
  - name: auth-service
    url: http://terrarium-test-auth:9999
    plugins:
      - name: jwt
        config:
          secret_is_base64: false
          key_claim_name: sub
          claims_to_verify:
            - exp
```

### 6.2 Database Migrations

Refer to `supabase/migrations/20250206121400_baseline_migration.sql` for the complete schema setup.

## 7. Troubleshooting Guide

### 7.1 Common Issues

#### JWT Token Issues

- Invalid token format
- Token expiration
- Missing claims

#### Database Connection Issues

- Hostname resolution
- Connection pooling
- RLS policy conflicts

#### Auth Service Issues

- Service role creation
- Email verification
- Session management

### 7.2 Resolution Steps

#### JWT Token Issues

1. Verify token format in Kong configuration
2. Check token expiration settings
3. Validate required claims

#### Database Connection Issues

1. Verify hostname resolution in Docker
2. Check connection pool settings
3. Review RLS policies

#### Auth Service Issues

1. Verify service role permissions
2. Check email provider configuration
3. Review session settings

## 8. Migration Plan

### 8.1 Phase 1: Core Authentication

- [ ] Update Supabase client
- [ ] Implement new auth hook
- [ ] Update UI components

### 8.2 Phase 2: Testing & Validation

- [ ] Update test helpers
- [ ] Implement E2E tests
- [ ] Validate flows

### 8.3 Phase 3: Deployment

- [ ] Update Kong configuration
- [ ] Deploy database migrations
- [ ] Validate production setup

## Contributing

Please follow our [contribution guidelines](CONTRIBUTING.md) when making changes to the authentication system.

## License

This documentation is part of the Terrarium project and is subject to its license terms.
