---
id: code-standards
title: Code Standards
sidebar_label: Code Standards
---

# Code Standards

This document outlines the coding standards and best practices for the Terrarium project.

## TypeScript Guidelines

### Types and Interfaces

```typescript
// ✅ Good: Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// ❌ Bad: Avoid type aliases for objects
type User = {
  id: string;
  email: string;
  role: UserRole;
};
```

### Enums and Constants

```typescript
// ✅ Good: Use enums for fixed values
enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

// ✅ Good: Use const for configuration
const API_CONFIG = {
  baseUrl: '/api',
  timeout: 5000,
} as const;
```

### Error Handling

```typescript
// ✅ Good: Use custom error classes
class AuthenticationError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// ✅ Good: Proper error handling
try {
  await authenticateUser(credentials);
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle auth error
  } else {
    // Handle other errors
  }
}
```

## React Guidelines

### Component Structure

```typescript
// ✅ Good: Functional components with TypeScript
interface ProfileCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onEdit }) => {
  return (
    <div>
      <h2>{user.name}</h2>
      {onEdit && (
        <button onClick={() => onEdit(user)}>
          Edit
        </button>
      )}
    </div>
  );
};
```

### Hooks Usage

```typescript
// ✅ Good: Custom hooks for reusable logic
const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
};

// ✅ Good: Proper state management
const [isOpen, setIsOpen] = useState(false);
const toggleOpen = useCallback(() => {
  setIsOpen((prev) => !prev);
}, []);
```

### Component Organization

```typescript
// ✅ Good: Organize related components together
// components/features/jobs/
// ├── JobList/
// │   ├── index.tsx
// │   ├── JobCard.tsx
// │   ├── JobFilters.tsx
// │   └── hooks/
// │       └── useJobSearch.ts
```

## Testing Guidelines

### Unit Tests

```typescript
// ✅ Good: Descriptive test cases
describe('AuthService', () => {
  describe('login', () => {
    it('should authenticate valid credentials', async () => {
      const result = await authService.login(validCredentials);
      expect(result.user).toBeDefined();
    });

    it('should throw on invalid credentials', async () => {
      await expect(authService.login(invalidCredentials)).rejects.toThrow(
        AuthenticationError
      );
    });
  });
});
```

### Component Tests

```typescript
// ✅ Good: Test component behavior
describe('ProfileCard', () => {
  it('renders user information', () => {
    render(<ProfileCard user={mockUser} />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<ProfileCard user={mockUser} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

## State Management

### Server State

```typescript
// ✅ Good: Use React Query for server state
const useJobs = (filters: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Client State

```typescript
// ✅ Good: Use Jotai for global state
const userAtom = atom<User | null>(null);
const userSettingsAtom = atom((get) => {
  const user = get(userAtom);
  return user?.settings ?? defaultSettings;
});
```

## Documentation

### Code Comments

```typescript
// ✅ Good: Document complex logic
/**
 * Calculates the optimal job match score based on user preferences
 * and job requirements.
 *
 * @param preferences - User's job preferences
 * @param requirements - Job requirements
 * @returns A score between 0 and 1
 */
function calculateJobMatchScore(
  preferences: JobPreferences,
  requirements: JobRequirements
): number {
  // Implementation
}
```

### Type Documentation

```typescript
// ✅ Good: Document interfaces and types
/**
 * Represents a job posting in the system
 */
interface JobPosting {
  /** Unique identifier for the job */
  id: string;
  /** Job title */
  title: string;
  /** Detailed job description */
  description: string;
  /** Required skills for the position */
  requirements: string[];
  /** Salary range in USD */
  salaryRange: {
    min: number;
    max: number;
  };
}
```

## Git Commit Messages

```bash
# ✅ Good: Clear and descriptive commit messages
git commit -m "feat(jobs): add salary range filter to job search"
git commit -m "fix(auth): handle token expiration gracefully"
git commit -m "docs: update API authentication guide"
```

## Code Review Checklist

1. **Type Safety**

   - No `any` types
   - Proper interface definitions
   - Correct type assertions

2. **Component Structure**

   - Clear prop interfaces
   - Proper error handling
   - Performance considerations

3. **Testing**

   - Unit tests for logic
   - Component tests
   - Edge cases covered

4. **Documentation**

   - Code comments
   - Type documentation
   - Updated README/docs

5. **State Management**
   - Proper state location
   - Optimized queries
   - Error handling
