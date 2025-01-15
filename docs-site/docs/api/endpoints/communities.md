---
sidebar_position: 1
---

import CodeSamples from '@site/src/components/CodeSamples';

# Communities API

Manage your communities through the API.

## List Communities

List all communities you have access to.

### Endpoint

`GET /v1/communities`

### Query Parameters

| Parameter | Type   | Description                         |
| --------- | ------ | ----------------------------------- |
| `page`    | number | Page number for pagination          |
| `limit`   | number | Number of items per page            |
| `status`  | string | Filter by status (active, archived) |

### Example Request

<CodeSamples
endpoint="/v1/communities"
method="get"
headers={{
    "Authorization": "Bearer YOUR_API_TOKEN",
    "Content-Type": "application/json"
  }}
params={{
    "page": 1,
    "limit": 10,
    "status": "active"
  }}
/>

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

Create a new community.

### Endpoint

`POST /v1/communities`

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

### Example Request

<CodeSamples
endpoint="/v1/communities"
method="post"
headers={{
    "Authorization": "Bearer YOUR_API_TOKEN",
    "Content-Type": "application/json"
  }}
params={{
    "name": "Tech Community",
    "description": "A community for tech enthusiasts",
    "settings": {
      "privacy": "public",
      "join_mode": "approval"
    }
  }}
/>

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
