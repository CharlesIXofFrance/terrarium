---
sidebar_position: 1
---

# SDK Overview

Terrarium provides official SDKs for popular programming languages to help you integrate with our platform quickly and easily.

## Available SDKs

| Language              | Package Manager | Status      |
| --------------------- | --------------- | ----------- |
| JavaScript/TypeScript | npm             | Stable      |
| Python                | pip             | Stable      |
| Ruby                  | gem             | Beta        |
| Go                    | go              | Beta        |
| Java                  | maven           | Coming Soon |
| PHP                   | composer        | Coming Soon |

## Common Features

All our SDKs share these core features:

- **Type Safety**: Full type definitions for better development experience
- **Authentication**: Built-in token management and refresh
- **Rate Limiting**: Automatic retry with exponential backoff
- **Error Handling**: Consistent error types across languages
- **Logging**: Configurable logging levels
- **Middleware**: Extensible request/response pipeline
- **Caching**: Optional response caching
- **Batch Operations**: Efficient bulk operations
- **Pagination**: Automatic page handling
- **Webhooks**: Webhook signature verification

## Getting Started

Choose your preferred language to get started:

- [JavaScript/TypeScript SDK](/sdk/javascript)
- [Python SDK](/sdk/python)
- [Ruby SDK](/sdk/ruby)
- [Go SDK](/sdk/go)

## Best Practices

### Configuration

Always initialize the SDK with proper configuration:

```javascript
const terrarium = new Terrarium({
  apiKey: 'your-api-key',
  environment: 'production',
  timeout: 30000,
  retries: 3,
});
```

### Error Handling

Implement proper error handling:

```javascript
try {
  const community = await terrarium.communities.create({
    name: 'My Community',
  });
} catch (error) {
  if (error instanceof Terrarium.APIError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Rate Limiting

Configure rate limiting settings:

```javascript
const terrarium = new Terrarium({
  apiKey: 'your-api-key',
  rateLimit: {
    maxRetries: 3,
    initialRetryDelay: 1000,
    maxRetryDelay: 5000,
  },
});
```

### Logging

Enable detailed logging during development:

```javascript
const terrarium = new Terrarium({
  apiKey: 'your-api-key',
  logLevel: 'debug', // 'debug' | 'info' | 'warn' | 'error'
  logger: (level, message, meta) => {
    console.log(`[${level}] ${message}`, meta);
  },
});
```

## Migration Guide

### Upgrading from v1 to v2

Key changes in v2:

1. New authentication flow
2. Improved error handling
3. Enhanced type safety
4. New features and endpoints

Example migration:

```javascript
// v1
const client = new TerrariumClient(apiKey);
await client.getCommunity(id);

// v2
const terrarium = new Terrarium({
  apiKey: 'your-api-key',
});
await terrarium.communities.get(id);
```

## Support

Get help with SDK integration:

1. [GitHub Issues](https://github.com/terrarium/sdks/issues)
2. [Discord Community](https://discord.gg/terrarium)
3. [Stack Overflow](https://stackoverflow.com/questions/tagged/terrarium)
4. [Email Support](mailto:support@terrarium.dev)
