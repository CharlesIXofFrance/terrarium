# API Documentation

This directory contains comprehensive documentation for all APIs in the Terrarium project.

## Structure

1. [Authentication](./auth.md)
2. [Community Management](./community.md)
3. [Job Board](./jobs.md)
4. [User Management](./users.md)
5. [Analytics](./analytics.md)

## API Standards

### Response Format

```typescript
interface APIResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}
```

### Error Codes

- `AUTH_001`: Authentication required
- `AUTH_002`: Invalid credentials
- `RATE_001`: Rate limit exceeded
- `VAL_001`: Validation error

### Versioning

APIs are versioned in the URL: `/api/v1/resource`
