---
sidebar_position: 2
---

# Jobs API

Manage job listings through the API.

## List Jobs

```http
GET /v1/jobs
```

List all jobs in a community.

### Query Parameters

| Parameter      | Type   | Description                     |
| -------------- | ------ | ------------------------------- |
| `community_id` | string | Filter by community             |
| `status`       | string | Filter by status (open, closed) |
| `page`         | number | Page number for pagination      |
| `limit`        | number | Number of items per page        |

### Response

```json
{
  "data": [
    {
      "id": "job_123",
      "title": "Senior Developer",
      "company": "Tech Corp",
      "location": "Remote",
      "type": "Full-time",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "total": 50
  }
}
```

## Create Job

```http
POST /v1/jobs
```

Create a new job listing.

### Request Body

```json
{
  "community_id": "com_123",
  "title": "Senior Developer",
  "company": "Tech Corp",
  "description": "We're looking for a senior developer...",
  "location": "Remote",
  "type": "Full-time",
  "salary_range": {
    "min": 100000,
    "max": 150000,
    "currency": "USD"
  }
}
```

### Response

```json
{
  "data": {
    "id": "job_123",
    "title": "Senior Developer",
    "company": "Tech Corp",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
