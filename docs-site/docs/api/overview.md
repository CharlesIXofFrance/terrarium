---
sidebar_position: 1
---

# API Overview

Terrarium provides a RESTful API that enables you to programmatically manage your communities, job boards, and user data.

## Authentication

All API requests must be authenticated using a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
     https://api.terrarium.dev/v1/communities
```

## Rate Limiting

The API has rate limits to ensure fair usage:

- 1000 requests per hour for authenticated users
- 60 requests per hour for unauthenticated users

## Response Format

All responses are returned in JSON format:

```json
{
  "data": {
    // Response data here
  },
  "meta": {
    "page": 1,
    "total": 100
  }
}
```

## Error Handling

Errors follow a standard format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request was invalid",
    "details": {
      "field": "email",
      "issue": "must be a valid email"
    }
  }
}
```
