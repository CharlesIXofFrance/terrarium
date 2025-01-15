# Terrarium Environments

## Overview

This document outlines the environments used in the Terrarium project and their purposes. We follow a simple two-environment setup:

1. Development - for all development and testing
2. Production - for live application

## Environments

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
- **Used for**:
  - Feature development
  - Integration testing
  - Manual testing
  - Automated tests
  - API testing

## Testing Strategy

### Testing Environment

All tests run against the **Development Environment** because:

1. Maintains a single source of truth
2. Simplifies environment management
3. Makes debugging easier
4. Reduces infrastructure costs
5. Prevents environment synchronization issues

### Test Files

- `tests/storage-security.test.ts`: Tests for storage security features
- `tests/config.ts`: Configuration for development environment

## Configuration

### Development Environment Configuration

```typescript
// tests/config.ts
const supabase = createClient(
  process.env.SUPABASE_URL!, // Points to development environment
  process.env.SUPABASE_KEY!
);

const adminClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

## Security Implementation

### Development Environment

- Basic security policies for testing
- Allows for easier development and testing
- Documented in `storage-security.test.ts`

### Production Environment

- Strict security policies required
- Detailed requirements in `docs/storage-security-requirements.md`
- Must be implemented before production deployment

## Environment Variables

Required variables in `.env`:

```bash
SUPABASE_URL=https://terrarium.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Common Issues and Solutions

### Testing Best Practices

1. Always clean up test data after tests
2. Use service role key for admin operations in tests
3. Keep development security policies simple
4. Save strict security implementation for production

### Troubleshooting

- If tests fail with auth errors: Check if using correct environment URL
- If tests fail with permission errors: Ensure using correct service role key
- If tests leave data behind: Check cleanup in afterAll blocks

## Migration to Production

When ready for production:

1. Review `storage-security-requirements.md`
2. Create production environment
3. Implement strict security policies
4. Test in staging (if needed)
5. Deploy to production

## Questions?

For questions about:

- Environment setup: Review `tests/config.ts`
- Security requirements: See `docs/storage-security-requirements.md`
- Test implementation: Check `tests/storage-security.test.ts`
