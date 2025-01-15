---
sidebar_position: 3
---

import ApiPlayground from '@site/src/components/ApiPlayground';

# API Playground

Try out our API endpoints directly in the documentation. Each playground includes a live editor where you can modify the request and see the response in real-time.

## List Communities

<ApiPlayground
method="GET"
endpoint="/v1/communities"
description="Retrieve a list of communities"
parameters={[
{
name: "page",
description: "Page number for pagination",
default: "1"
},
{
name: "limit",
description: "Number of items per page",
default: "10"
},
{
name: "sort",
description: "Sort field and direction (e.g., name:asc)",
default: "created_at:desc"
}
]}
responses={{
    200: {
      description: "Success",
      example: {
        data: [
          {
            id: "comm_123",
            name: "Tech Enthusiasts",
            description: "A community for tech lovers",
            members_count: 1250,
            created_at: "2025-01-15T00:00:00Z"
          },
          {
            id: "comm_124",
            name: "Design Hub",
            description: "Connect with designers",
            members_count: 850,
            created_at: "2025-01-14T00:00:00Z"
          }
        ],
        meta: {
          total: 42,
          page: 1,
          limit: 10
        }
      }
    }
  }}
/>

## Create Community

<ApiPlayground
method="POST"
endpoint="/v1/communities"
description="Create a new community"
requestBody={{
    type: "object",
    example: {
      name: "My Community",
      description: "A place to connect and share",
      settings: {
        privacy: "public",
        join_mode: "open"
      }
    }
  }}
responses={{
    201: {
      description: "Created",
      example: {
        id: "comm_125",
        name: "My Community",
        description: "A place to connect and share",
        settings: {
          privacy: "public",
          join_mode: "open"
        },
        created_at: "2025-01-15T01:15:38Z"
      }
    },
    400: {
      description: "Bad Request",
      example: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: {
            name: ["Name is required"]
          }
        }
      }
    }
  }}
/>

## Get Community

<ApiPlayground
method="GET"
endpoint="/v1/communities/{id}"
description="Get a specific community by ID"
parameters={[
{
name: "id",
description: "Community ID",
required: true,
default: "comm_123"
}
]}
responses={{
    200: {
      description: "Success",
      example: {
        id: "comm_123",
        name: "Tech Enthusiasts",
        description: "A community for tech lovers",
        settings: {
          privacy: "public",
          join_mode: "open"
        },
        stats: {
          members_count: 1250,
          posts_count: 450,
          events_count: 12
        },
        created_at: "2025-01-15T00:00:00Z",
        updated_at: "2025-01-15T01:15:38Z"
      }
    },
    404: {
      description: "Not Found",
      example: {
        error: {
          code: "NOT_FOUND",
          message: "Community not found"
        }
      }
    }
  }}
/>

## Update Community

<ApiPlayground
method="PUT"
endpoint="/v1/communities/{id}"
description="Update a community"
parameters={[
{
name: "id",
description: "Community ID",
required: true,
default: "comm_123"
}
]}
requestBody={{
    type: "object",
    example: {
      name: "Updated Community Name",
      description: "Updated community description",
      settings: {
        privacy: "private",
        join_mode: "invite"
      }
    }
  }}
responses={{
    200: {
      description: "Success",
      example: {
        id: "comm_123",
        name: "Updated Community Name",
        description: "Updated community description",
        settings: {
          privacy: "private",
          join_mode: "invite"
        },
        updated_at: "2025-01-15T01:15:38Z"
      }
    }
  }}
/>

## Delete Community

<ApiPlayground
method="DELETE"
endpoint="/v1/communities/{id}"
description="Delete a community"
parameters={[
{
name: "id",
description: "Community ID",
required: true,
default: "comm_123"
}
]}
responses={{
    204: {
      description: "No Content"
    },
    404: {
      description: "Not Found",
      example: {
        error: {
          code: "NOT_FOUND",
          message: "Community not found"
        }
      }
    }
  }}
/>
