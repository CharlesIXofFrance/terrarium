---
sidebar_position: 5
---

# Go SDK (Beta)

Our Go SDK provides a type-safe way to interact with the Terrarium API.

## Installation

```bash
go get github.com/terrarium/sdk-go
```

## Quick Start

```go
package main

import (
    "context"
    "fmt"
    "log"

    terrarium "github.com/terrarium/sdk-go"
)

func main() {
    // Initialize the client
    client := terrarium.NewClient("your-api-key")

    // Create a community
    community, err := client.Communities.Create(context.Background(), &terrarium.CommunityCreateParams{
        Name:        "Tech Hub",
        Description: "A community for tech enthusiasts",
    })
    if err != nil {
        log.Fatal(err)
    }

    // List communities
    communities, err := client.Communities.List(context.Background(), &terrarium.ListParams{
        Page:  1,
        Limit: 10,
    })
    if err != nil {
        log.Fatal(err)
    }

    // Get a specific community
    community, err := client.Communities.Get(context.Background(), "comm_123")
    if err != nil {
        log.Fatal(err)
    }

    // Update a community
    updated, err := client.Communities.Update(context.Background(), "comm_123", &terrarium.CommunityUpdateParams{
        Name: "Updated Name",
    })
    if err != nil {
        log.Fatal(err)
    }

    // Delete a community
    err = client.Communities.Delete(context.Background(), "comm_123")
    if err != nil {
        log.Fatal(err)
    }
}
```

## Advanced Usage

### Configuration

```go
client := terrarium.NewClient(
    "your-api-key",
    terrarium.WithBaseURL("https://api.custom-domain.com"),
    terrarium.WithTimeout(30*time.Second),
    terrarium.WithRetries(3),
    terrarium.WithHeaders(map[string]string{
        "Custom-Header": "value",
    }),
    terrarium.WithLogger(terrarium.LogLevelDebug),
)
```

### Error Handling

```go
community, err := client.Communities.Create(context.Background(), &terrarium.CommunityCreateParams{
    Name: "My Community",
})
if err != nil {
    switch e := err.(type) {
    case *terrarium.APIError:
        fmt.Printf("API Error: %v\n", e.Message)
        fmt.Printf("Status: %d\n", e.Status)
        fmt.Printf("Code: %s\n", e.Code)
    case *terrarium.NetworkError:
        fmt.Printf("Network Error: %v\n", e.Error())
    default:
        fmt.Printf("Unknown error: %v\n", err)
    }
    return
}
```

### Batch Operations

```go
// Create multiple communities
communities, err := client.Communities.CreateMany(context.Background(), []*terrarium.CommunityCreateParams{
    {Name: "Community 1"},
    {Name: "Community 2"},
})

// Update multiple communities
updated, err := client.Communities.UpdateMany(context.Background(), []*terrarium.CommunityUpdateParams{
    {ID: "comm_1", Name: "Updated 1"},
    {ID: "comm_2", Name: "Updated 2"},
})
```

### Pagination

```go
// Manual pagination
communities, meta, err := client.Communities.List(context.Background(), &terrarium.ListParams{
    Page:  1,
    Limit: 10,
})

// Automatic pagination
iter := client.Communities.Iter(context.Background(), nil)
for iter.Next() {
    community := iter.Community()
    fmt.Println(community)
}
if err := iter.Err(); err != nil {
    log.Fatal(err)
}

// Get all items
allCommunities, err := client.Communities.All(context.Background())
```

### Webhooks

```go
// Verify webhook signature
isValid := client.Webhooks.VerifySignature(&terrarium.WebhookParams{
    Payload:   payload,
    Signature: signature,
    Timestamp: timestamp,
})

// Handle webhook events
client.Webhooks.On("community.created", func(event *terrarium.WebhookEvent) {
    fmt.Printf("New community: %v\n", event.Data)
})
```

## Testing

```go
// Create a test client
testClient := terrarium.NewTestClient("test-api-key")

// Mock responses
testClient.Mock("communities.create", &terrarium.MockResponse{
    Status: 201,
    Data: map[string]interface{}{
        "id":   "comm_test",
        "name": "Test Community",
    },
})

// Run tests
community, err := testClient.Communities.Create(context.Background(), &terrarium.CommunityCreateParams{
    Name: "Test Community",
})
```
