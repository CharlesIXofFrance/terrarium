---
sidebar_position: 2
---

# Authentication

Learn how to authenticate your API requests.

## Getting an API Token

1. Log in to your Terrarium dashboard
2. Navigate to Settings > API Tokens
3. Click "Generate New Token"
4. Save your token securely - it won't be shown again

## Using Your Token

Include your token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
     https://api.terrarium.dev/v1/communities
```

## Token Scopes

Tokens can be created with different scopes:

| Scope   | Description                |
| ------- | -------------------------- |
| `read`  | Read-only access           |
| `write` | Read and write access      |
| `admin` | Full administrative access |

## Token Security

- Never share your tokens
- Rotate tokens regularly
- Use different tokens for different environments
- Set appropriate token scopes
- Monitor token usage in the dashboard
