---
sidebar_position: 2
---

import CodeSamples from '@site/src/components/CodeSamples';

# Managing Tokens

Learn how to effectively manage your API tokens in Terrarium.

## Token Lifecycle

### 1. Token Generation

Tokens are generated when:

- User logs in
- Token is refreshed
- API key is created

### 2. Token Validation

Every API request goes through:

- Signature verification
- Expiration check
- Permission validation

### 3. Token Expiration

- Access tokens expire after 1 hour
- Refresh tokens expire after 30 days
- API keys can have custom expiration

## Token Types

### Access Tokens

Short-lived tokens used for API authentication.

**Structure:**

```json
{
  "sub": "user_123",
  "exp": 1643673600,
  "permissions": ["read", "write"],
  "type": "access"
}
```

### Refresh Tokens

Long-lived tokens used to obtain new access tokens.

**Structure:**

```json
{
  "sub": "user_123",
  "exp": 1646265600,
  "family": "fam_123",
  "type": "refresh"
}
```

### API Keys

Permanent tokens for server-to-server communication.

**Structure:**

```json
{
  "key_id": "key_123",
  "exp": null,
  "permissions": ["read"],
  "type": "api_key"
}
```

## Token Management

### Creating API Keys

<CodeSamples
endpoint="/auth/api-keys"
method="post"
headers={{
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
  }}
params={{
    "name": "Server Integration",
    "permissions": ["read"],
    "expires_in": "30d"
  }}
/>

### Listing API Keys

<CodeSamples
endpoint="/auth/api-keys"
method="get"
headers={{
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
  }}
/>

### Revoking Tokens

<CodeSamples
endpoint="/auth/api-keys/{key_id}"
method="delete"
headers={{
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
  }}
/>

## Security Guidelines

### Token Storage

Store tokens securely based on their type:

| Token Type    | Storage Location     | Security Level |
| ------------- | -------------------- | -------------- |
| Access Token  | Memory               | High           |
| Refresh Token | HTTP-only Cookie     | High           |
| API Key       | Environment Variable | High           |

### Rotation Policy

Implement token rotation for better security:

1. **Access Tokens**

   - Rotate every hour
   - Use refresh token to get new ones

2. **Refresh Tokens**

   - Rotate every 30 days
   - Implement refresh token rotation

3. **API Keys**
   - Rotate manually
   - Use key rotation for sensitive operations

### Monitoring

Monitor token usage for security:

```javascript
// Example token usage monitoring
async function logTokenUsage(tokenId, action) {
  await fetch('/auth/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token_id: tokenId,
      action: action,
      timestamp: new Date().toISOString(),
    }),
  });
}
```

## Error Handling

### Common Token Errors

| Error Code | Description              | Solution               |
| ---------- | ------------------------ | ---------------------- |
| 401        | Token expired            | Refresh the token      |
| 403        | Insufficient permissions | Check token scope      |
| 422        | Invalid token format     | Verify token structure |

### Error Response Format

```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "The access token has expired",
    "details": {
      "expired_at": "2024-01-15T00:00:00Z"
    }
  }
}
```
