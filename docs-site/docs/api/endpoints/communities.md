---
sidebar_position: 1
---

# Communities API

Manage your communities through the API.

## List Communities

```http
GET /v1/communities
```

List all communities you have access to.

### Query Parameters

| Parameter | Type   | Description                         |
| --------- | ------ | ----------------------------------- |
| `page`    | number | Page number for pagination          |
| `limit`   | number | Number of items per page            |
| `status`  | string | Filter by status (active, archived) |

### Response

```json
{
  "data": [
    {
      "id": "com_123",
      "name": "Tech Community",
      "description": "A community for tech enthusiasts",
      "members_count": 1000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "total": 100
  }
}
```

## Create Community

```http
POST /v1/communities
```

Create a new community.

### Request Body

```json
{
  "name": "Tech Community",
  "description": "A community for tech enthusiasts",
  "settings": {
    "privacy": "public",
    "join_mode": "approval"
  }
}
```

### Response

```json
{
  "data": {
    "id": "com_123",
    "name": "Tech Community",
    "description": "A community for tech enthusiasts",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
