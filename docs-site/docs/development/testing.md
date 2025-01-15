---
id: testing
title: Testing Guide
sidebar_label: Testing
---

# Testing Guide

This guide provides an overview of testing practices in the Terrarium project.

## Testing Stack

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: Istanbul
- **E2E Testing**: Playwright

## Test Types

### Unit Tests

Unit tests verify individual components and functions in isolation. We use React Testing Library to ensure tests focus on user behavior rather than implementation details.

### Integration Tests

Integration tests verify that multiple components or systems work together correctly. These tests often involve testing complete features like authentication or community management.

### E2E Tests

End-to-end tests use Playwright to simulate real user interactions across multiple pages. These tests verify critical user flows like signup, login, and community creation.

## Testing Philosophy

We follow these key principles:

1. Test behavior, not implementation
2. Write tests that resemble how users interact with the app
3. Focus on critical user flows and edge cases
4. Maintain high test coverage for core features

## Coverage Requirements

We maintain high test coverage to ensure code quality:

- Business logic: 90%+ coverage
- UI components: 80%+ coverage
- Utility functions: 70%+ coverage

Coverage reports are automatically generated during CI/CD runs.

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
