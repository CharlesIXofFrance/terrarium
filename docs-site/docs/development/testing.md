---
id: testing
title: Testing Guide
sidebar_label: Testing
---

# Testing Guide

This guide covers testing practices and patterns used in the Terrarium project.

## Testing Stack

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: Istanbul
- **E2E Testing**: Playwright

## Test Types

### Unit Tests

Unit tests focus on testing individual functions and components in isolation.

```typescript
// services/auth.test.ts
describe('AuthService', () => {
  describe('validatePassword', () => {
    it('should pass for valid passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
    });

    it('should fail for weak passwords', () => {
      expect(validatePassword('weak')).toBe(false);
    });
  });
});
```

### Integration Tests

Integration tests verify that different parts of the application work together correctly.

```typescript
// features/jobs/JobSearch.test.tsx
describe('JobSearch', () => {
  it('should filter jobs based on search input', async () => {
    render(<JobSearch />);

    // Enter search term
    fireEvent.change(
      screen.getByPlaceholderText('Search jobs...'),
      { target: { value: 'React Developer' } }
    );

    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

End-to-end tests verify complete user flows using Playwright.

```typescript
// e2e/job-application.spec.ts
test('user can apply for a job', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to jobs
  await page.click('text=Jobs');

  // Apply for a job
  await page.click('text=Senior React Developer');
  await page.click('text=Apply Now');

  // Fill application
  await page.fill('[name="coverLetter"]', 'My application...');
  await page.click('text=Submit Application');

  // Verify success
  await expect(page.locator('.success-message')).toContainText(
    'Application submitted'
  );
});
```

## Testing Best Practices

### Component Testing

1. **Test Behavior, Not Implementation**

```typescript
// ✅ Good: Test what the user sees
test('shows error message on invalid input', async () => {
  render(<LoginForm />);

  fireEvent.click(screen.getByText('Submit'));

  expect(await screen.findByText('Email is required'))
    .toBeInTheDocument();
});

// ❌ Bad: Testing implementation details
test('sets error state on invalid input', () => {
  const { result } = renderHook(() => useState(''));
  expect(result.current[0]).toBe('');
});
```

2. **Use Testing Library Queries Properly**

```typescript
// ✅ Good: Use semantic queries
const submitButton = screen.getByRole('button', { name: /submit/i });

// ❌ Bad: Avoid testid when possible
const submitButton = screen.getByTestId('submit-button');
```

### API Mocking

Use MSW to mock API responses:

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/jobs', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          title: 'Senior React Developer',
          company: 'TechCorp',
        },
      ])
    );
  }),
];
```

### Test Organization

```typescript
describe('JobBoard', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  // Happy path tests
  describe('when jobs are available', () => {
    it('displays job listings');
    it('allows filtering jobs');
  });

  // Error cases
  describe('when API fails', () => {
    it('shows error message');
    it('allows retry');
  });

  // Edge cases
  describe('edge cases', () => {
    it('handles empty search results');
    it('handles network timeout');
  });
});
```

## Test Coverage

We aim for high test coverage while focusing on critical paths:

- Business logic: 90%+ coverage
- UI components: 80%+ coverage
- Utility functions: 70%+ coverage

Run coverage reports:

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
npm run coverage:report
```

## Continuous Integration

Tests are run automatically on:

- Pull requests
- Merges to main branch
- Release branches

### CI Pipeline

1. **Lint & Type Check**

   ```bash
   npm run lint
   npm run type-check
   ```

2. **Unit & Integration Tests**

   ```bash
   npm run test
   ```

3. **E2E Tests**

   ```bash
   npm run test:e2e
   ```

4. **Coverage Report**
   ```bash
   npm run test:coverage
   ```

## Debugging Tests

### Common Issues

1. **Async Operations**

```typescript
// ✅ Good: Wait for async operations
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// ❌ Bad: No waiting
expect(screen.getByText('Success')).toBeInTheDocument();
```

2. **Event Timing**

```typescript
// ✅ Good: Use fake timers
jest.useFakeTimers();
fireEvent.click(button);
jest.runAllTimers();

// ❌ Bad: Real timers
setTimeout(() => {
  expect(something).toBe(true);
}, 1000);
```

### Test Environment

- Tests run in Node.js environment
- DOM API provided by JSDOM
- Time functions can be mocked
- Network requests are intercepted by MSW

## Writing Testable Code

1. **Dependency Injection**

```typescript
// ✅ Good: Injectable dependencies
class UserService {
  constructor(private api: ApiClient) {}
}

// ❌ Bad: Hard-coded dependencies
class UserService {
  private api = new ApiClient();
}
```

2. **Pure Functions**

```typescript
// ✅ Good: Pure function
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ❌ Bad: Side effects
const calculateTotal = (items: Item[]): number => {
  global.lastCalculation = Date.now();
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

3. **Testable Components**

```typescript
// ✅ Good: Props for configuration
interface ButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

// ❌ Bad: Internal state management
const Button = () => {
  const [isLoading, setIsLoading] = useState(false);
};
```
