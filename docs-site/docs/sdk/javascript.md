---
sidebar_position: 2
---

# JavaScript/TypeScript SDK

Our JavaScript/TypeScript SDK provides a type-safe way to interact with the Terrarium API.

## Installation

```bash
# npm
npm install @terrarium/sdk

# yarn
yarn add @terrarium/sdk

# pnpm
pnpm add @terrarium/sdk
```

## Quick Start

```typescript
import { Terrarium } from '@terrarium/sdk';

// Initialize the client
const terrarium = new Terrarium({
  apiKey: 'your-api-key',
});

// Create a community
const community = await terrarium.communities.create({
  name: 'Tech Hub',
  description: 'A community for tech enthusiasts',
});

// List communities
const { data, meta } = await terrarium.communities.list({
  page: 1,
  limit: 10,
});

// Get a specific community
const community = await terrarium.communities.get('comm_123');

// Update a community
const updated = await terrarium.communities.update('comm_123', {
  name: 'Updated Name',
});

// Delete a community
await terrarium.communities.delete('comm_123');
```

## Type Safety

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { Community, CommunityCreateParams } from '@terrarium/sdk';

// All params are typed
const params: CommunityCreateParams = {
  name: 'My Community',
  description: 'Description',
  settings: {
    privacy: 'public',
    join_mode: 'open',
  },
};

// Response is typed
const community: Community = await terrarium.communities.create(params);
```

## Advanced Usage

### Custom Configuration

```typescript
const terrarium = new Terrarium({
  apiKey: 'your-api-key',
  baseURL: 'https://api.custom-domain.com',
  timeout: 30000,
  retries: 3,
  headers: {
    'Custom-Header': 'value',
  },
  logger: {
    level: 'debug',
    handler: (level, message, meta) => {
      console.log(`[${level}] ${message}`, meta);
    },
  },
});
```

### Middleware

```typescript
// Add request middleware
terrarium.use(async (request, next) => {
  console.log('Before request:', request);
  const response = await next(request);
  console.log('After request:', response);
  return response;
});

// Add response middleware
terrarium.use(async (response, next) => {
  if (response.status === 429) {
    await sleep(1000);
    return next(response.request);
  }
  return response;
});
```

### Batch Operations

```typescript
// Create multiple communities
const communities = await terrarium.communities.createMany([
  { name: 'Community 1' },
  { name: 'Community 2' },
]);

// Update multiple communities
const updated = await terrarium.communities.updateMany([
  { id: 'comm_1', name: 'Updated 1' },
  { id: 'comm_2', name: 'Updated 2' },
]);
```

### Pagination

```typescript
// Manual pagination
const { data, meta } = await terrarium.communities.list({
  page: 1,
  limit: 10,
});

// Automatic pagination
for await (const community of terrarium.communities.iterate()) {
  console.log(community);
}

// Get all items
const allCommunities = await terrarium.communities.all();
```

### Caching

```typescript
// Enable caching
const terrarium = new Terrarium({
  apiKey: 'your-api-key',
  cache: {
    enabled: true,
    ttl: 60000, // 1 minute
    maxSize: 100, // items
  },
});

// Cache specific requests
const community = await terrarium.communities.get('comm_123', {
  cache: true,
  ttl: 30000,
});
```

### Webhooks

```typescript
// Verify webhook signature
const isValid = terrarium.webhooks.verifySignature({
  payload: requestBody,
  signature: request.headers['x-terrarium-signature'],
  timestamp: request.headers['x-terrarium-timestamp'],
});

// Handle webhook events
terrarium.webhooks.on('community.created', (event) => {
  console.log('New community:', event.data);
});
```

### Error Handling

```typescript
import { APIError, NetworkError } from '@terrarium/sdk';

try {
  const community = await terrarium.communities.create({
    name: 'My Community',
  });
} catch (error) {
  if (error instanceof APIError) {
    // API-level error
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Details:', error.details);
  } else if (error instanceof NetworkError) {
    // Network-level error
    console.error('Network Error:', error.message);
    console.error('Request:', error.request);
  } else {
    // Unknown error
    console.error('Unknown error:', error);
  }
}
```

## Browser Support

The SDK supports all modern browsers:

- Chrome ≥ 60
- Firefox ≥ 55
- Safari ≥ 11
- Edge ≥ 79

For older browsers, use a bundler with appropriate polyfills.

## Testing

```typescript
// Create a test client
const testClient = new Terrarium({
  apiKey: 'test-api-key',
  environment: 'test',
});

// Mock responses
testClient.mock('communities.create', {
  status: 201,
  data: {
    id: 'comm_test',
    name: 'Test Community',
  },
});

// Run tests
const community = await testClient.communities.create({
  name: 'Test Community',
});
```

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "es2019",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "types": ["@terrarium/sdk"]
  }
}
```

## Examples

### Authentication Flow

```typescript
// Initialize with refresh token
const terrarium = new Terrarium({
  refreshToken: 'refresh-token',
});

// Handle token refresh
terrarium.on('token.refresh', (token) => {
  // Save new token
  localStorage.setItem('token', token);
});

// Handle token expiry
terrarium.on('token.expired', () => {
  // Redirect to login
  window.location.href = '/login';
});
```

### Real-time Updates

```typescript
// Subscribe to real-time updates
const subscription = terrarium.communities.subscribe('comm_123', {
  onUpdate: (community) => {
    console.log('Community updated:', community);
  },
  onDelete: () => {
    console.log('Community deleted');
  },
});

// Unsubscribe
subscription.unsubscribe();
```

### File Upload

```typescript
// Upload community avatar
const avatar = await terrarium.communities.uploadAvatar('comm_123', {
  file: fileInput.files[0],
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
  },
});
```
