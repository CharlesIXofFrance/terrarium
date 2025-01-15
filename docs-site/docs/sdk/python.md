---
sidebar_position: 3
---

# Python SDK

Our Python SDK provides a Pythonic interface to interact with the Terrarium API.

## Installation

```bash
# pip
pip install terrarium-sdk

# poetry
poetry add terrarium-sdk

# pipenv
pipenv install terrarium-sdk
```

## Quick Start

```python
from terrarium import Terrarium

# Initialize the client
terrarium = Terrarium(api_key="your-api-key")

# Create a community
community = terrarium.communities.create(
    name="Tech Hub",
    description="A community for tech enthusiasts"
)

# List communities
communities = terrarium.communities.list(
    page=1,
    limit=10
)

# Get a specific community
community = terrarium.communities.get("comm_123")

# Update a community
updated = terrarium.communities.update(
    "comm_123",
    name="Updated Name"
)

# Delete a community
terrarium.communities.delete("comm_123")
```

## Type Hints

The SDK uses Python type hints for better IDE support:

```python
from terrarium.types import Community, CommunityCreateParams

# All params are typed
params: CommunityCreateParams = {
    "name": "My Community",
    "description": "Description",
    "settings": {
        "privacy": "public",
        "join_mode": "open"
    }
}

# Response is typed
community: Community = terrarium.communities.create(params)
```

## Advanced Usage

### Custom Configuration

```python
terrarium = Terrarium(
    api_key="your-api-key",
    base_url="https://api.custom-domain.com",
    timeout=30,
    retries=3,
    headers={
        "Custom-Header": "value"
    },
    logger={
        "level": "DEBUG",
        "handler": lambda level, message, meta: print(f"[{level}] {message}", meta)
    }
)
```

### Middleware

```python
# Add request middleware
@terrarium.middleware
async def log_request(request, next):
    print("Before request:", request)
    response = await next(request)
    print("After request:", response)
    return response

# Add response middleware
@terrarium.middleware
async def handle_rate_limit(response, next):
    if response.status == 429:
        await asyncio.sleep(1)
        return await next(response.request)
    return response
```

### Batch Operations

```python
# Create multiple communities
communities = terrarium.communities.create_many([
    {"name": "Community 1"},
    {"name": "Community 2"}
])

# Update multiple communities
updated = terrarium.communities.update_many([
    {"id": "comm_1", "name": "Updated 1"},
    {"id": "comm_2", "name": "Updated 2"}
])
```

### Pagination

```python
# Manual pagination
response = terrarium.communities.list(page=1, limit=10)
communities = response.data
meta = response.meta

# Automatic pagination
async for community in terrarium.communities.iterate():
    print(community)

# Get all items
all_communities = terrarium.communities.all()
```

### Caching

```python
# Enable caching
terrarium = Terrarium(
    api_key="your-api-key",
    cache={
        "enabled": True,
        "ttl": 60,  # seconds
        "max_size": 100  # items
    }
)

# Cache specific requests
community = terrarium.communities.get(
    "comm_123",
    cache=True,
    ttl=30
)
```

### Webhooks

```python
# Verify webhook signature
is_valid = terrarium.webhooks.verify_signature(
    payload=request.body,
    signature=request.headers["x-terrarium-signature"],
    timestamp=request.headers["x-terrarium-timestamp"]
)

# Handle webhook events
@terrarium.webhooks.on("community.created")
def handle_community_created(event):
    print("New community:", event.data)
```

### Error Handling

```python
from terrarium.exceptions import APIError, NetworkError

try:
    community = terrarium.communities.create(
        name="My Community"
    )
except APIError as e:
    # API-level error
    print("API Error:", e.message)
    print("Status:", e.status)
    print("Code:", e.code)
    print("Details:", e.details)
except NetworkError as e:
    # Network-level error
    print("Network Error:", e.message)
    print("Request:", e.request)
except Exception as e:
    # Unknown error
    print("Unknown error:", e)
```

## Async Support

The SDK provides async support using `asyncio`:

```python
from terrarium import AsyncTerrarium

# Initialize async client
terrarium = AsyncTerrarium(api_key="your-api-key")

# Use async/await
async def main():
    community = await terrarium.communities.create(
        name="My Community"
    )
    print(community)

# Run async code
asyncio.run(main())
```

## Testing

```python
# Create a test client
test_client = Terrarium(
    api_key="test-api-key",
    environment="test"
)

# Mock responses
test_client.mock("communities.create", {
    "status": 201,
    "data": {
        "id": "comm_test",
        "name": "Test Community"
    }
})

# Run tests
community = test_client.communities.create(
    name="Test Community"
)
```

## Examples

### Authentication Flow

```python
# Initialize with refresh token
terrarium = Terrarium(refresh_token="refresh-token")

# Handle token refresh
@terrarium.on("token.refresh")
def handle_token_refresh(token):
    # Save new token
    save_token(token)

# Handle token expiry
@terrarium.on("token.expired")
def handle_token_expired():
    # Handle expiry
    redirect_to_login()
```

### Real-time Updates

```python
# Subscribe to real-time updates
def handle_update(community):
    print("Community updated:", community)

def handle_delete():
    print("Community deleted")

subscription = terrarium.communities.subscribe(
    "comm_123",
    on_update=handle_update,
    on_delete=handle_delete
)

# Unsubscribe
subscription.unsubscribe()
```

### File Upload

```python
# Upload community avatar
with open("avatar.png", "rb") as f:
    avatar = terrarium.communities.upload_avatar(
        "comm_123",
        file=f,
        on_progress=lambda progress: print(f"Upload progress: {progress}%")
    )
```
