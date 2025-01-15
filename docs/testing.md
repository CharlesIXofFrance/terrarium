# Testing Patterns and Examples

This document outlines the testing patterns and best practices used in the Terrarium project.

## Testing Stack

- **Testing Framework**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest's built-in mocking capabilities
- **Coverage**: Istanbul (built into Vitest)

## Test File Organization

- Test files should be placed in `__tests__` directories adjacent to the files they test
- Test files should follow the naming pattern: `ComponentName.test.tsx`
- Each test file should import the component and its dependencies directly

## Common Testing Patterns

### 1. Component Rendering Tests

```typescript
describe('Component', () => {
  it('renders successfully', () => {
    render(<Component />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
```

### 2. Loading States

```typescript
it('shows loading state', async () => {
  render(<Component />);
  expect(screen.getByTestId('spinner')).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
  });
});
```

### 3. Form Handling

```typescript
it('handles form submission', async () => {
  render(<Form />);
  const user = userEvent.setup();

  await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### 4. Error States

```typescript
it('displays error message', async () => {
  server.use(
    rest.post('/api/endpoint', (req, res, ctx) => {
      return res(ctx.status(400), ctx.json({ error: 'Invalid input' }));
    })
  );

  render(<Component />);
  await user.click(screen.getByRole('button'));
  expect(screen.getByText('Invalid input')).toBeInTheDocument();
});
```

### 5. Asynchronous Operations

```typescript
it('loads data asynchronously', async () => {
  render(<DataComponent />);
  expect(screen.getByTestId('spinner')).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## Testing Environments

### Overview

The Terrarium project uses a two-environment setup:

1. Development - for all development and testing
2. Production - for live application

### 1. Production Environment

- **URL**: [Production URL - TBD]
- **Purpose**: Live application serving real users
- **Security**: Strict security policies enforced (see `storage-security-requirements.md`)
- **Access**: Limited to production credentials
- **Not used for testing**

### 2. Development Environment

- **URL**: https://terrarium.supabase.co
- **Purpose**: All development and testing
- **Security**: Standard development security policies
- **Access**: Development credentials

### Environment Variables

Each environment requires specific configuration through environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage Configuration
STORAGE_BUCKET=your_storage_bucket
STORAGE_REGION=your_storage_region

# Feature Flags
ENABLE_ANALYTICS=true_or_false
ENABLE_NOTIFICATIONS=true_or_false
```

### Test Data Management

1. **Development Environment**:

   - Test data is regularly refreshed
   - Developers can create and modify test data
   - Automated cleanup runs daily

2. **Production Environment**:
   - Contains only real user data
   - No test data allowed
   - Regular backups performed

### Environment-Specific Testing

1. **Unit Tests**:

   - Run in CI environment
   - Use mocked data
   - Independent of any environment

2. **Integration Tests**:

   - Run against development environment
   - Use test database
   - Require development credentials

3. **E2E Tests**:
   - Run against development environment
   - Use dedicated test accounts
   - Reset test data after each run

## Best Practices

1. **Use Data-testid Sparingly**: Prefer using accessible queries (getByRole, getByLabelText) over data-testid
2. **Mock at Boundaries**: Mock external dependencies and API calls, not implementation details
3. **Test User Behavior**: Write tests that simulate how users interact with your application
4. **Avoid Implementation Details**: Test what the component does, not how it does it
5. **Keep Tests Focused**: Each test should verify one specific behavior

## Example: CommunityLoginPage Tests

The `CommunityLoginPage.test.tsx` file demonstrates these patterns:

1. Loading state testing
2. Form validation
3. Error handling
4. Successful submission
5. UI customization verification

Key points from the implementation:

```typescript
// Test loading states
it('shows loading spinner while fetching customization', async () => {
  // Implementation in CommunityLoginPage.test.tsx
});

// Test form submission
it('handles successful login and redirects to dashboard', async () => {
  // Implementation in CommunityLoginPage.test.tsx
});

// Test error states
it('shows server error message', async () => {
  // Implementation in CommunityLoginPage.test.tsx
});
```

## Coverage Requirements

- Statements: >80%
- Branches: >80%
- Functions: >80%
- Lines: >80%

Coverage is tracked in CI/CD pipeline and reported to Codecov.
