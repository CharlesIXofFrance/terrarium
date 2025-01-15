---
sidebar_position: 3
---

# Users API

Manage users and profiles through the API.

## Get Current User

```http
GET /v1/users/me
```

Get the currently authenticated user's profile.

### Response

```json
{
  "data": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00Z",
    "communities": [
      {
        "id": "com_123",
        "role": "admin"
      }
    ]
  }
}
```

## Update Profile

```http
PATCH /v1/users/me
```

Update the current user's profile.

### Request Body

```json
{
  "name": "John Smith",
  "bio": "Tech enthusiast and developer",
  "social": {
    "twitter": "@johnsmith",
    "github": "johnsmith",
    "linkedin": "john-smith"
  }
}
```

### Response

```json
{
  "data": {
    "id": "usr_123",
    "name": "John Smith",
    "bio": "Tech enthusiast and developer",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```
