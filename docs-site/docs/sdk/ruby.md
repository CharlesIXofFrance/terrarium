---
sidebar_position: 4
---

# Ruby SDK (Beta)

Our Ruby SDK provides a Ruby-native way to interact with the Terrarium API.

## Installation

```bash
# Using bundler
gem 'terrarium-sdk'

# Or install directly
gem install terrarium-sdk
```

## Quick Start

```ruby
require 'terrarium'

# Initialize the client
terrarium = Terrarium::Client.new(api_key: 'your-api-key')

# Create a community
community = terrarium.communities.create(
  name: 'Tech Hub',
  description: 'A community for tech enthusiasts'
)

# List communities
communities = terrarium.communities.list(
  page: 1,
  limit: 10
)

# Get a specific community
community = terrarium.communities.get('comm_123')

# Update a community
updated = terrarium.communities.update(
  'comm_123',
  name: 'Updated Name'
)

# Delete a community
terrarium.communities.delete('comm_123')
```

## Advanced Usage

### Configuration

```ruby
terrarium = Terrarium::Client.new(
  api_key: 'your-api-key',
  base_url: 'https://api.custom-domain.com',
  timeout: 30,
  retries: 3,
  headers: {
    'Custom-Header' => 'value'
  },
  logger: Logger.new(STDOUT).tap { |l| l.level = Logger::DEBUG }
)
```

### Error Handling

```ruby
begin
  community = terrarium.communities.create(
    name: 'My Community'
  )
rescue Terrarium::APIError => e
  puts "API Error: #{e.message}"
  puts "Status: #{e.status}"
  puts "Code: #{e.code}"
rescue Terrarium::NetworkError => e
  puts "Network Error: #{e.message}"
rescue => e
  puts "Unknown error: #{e.message}"
end
```

### Batch Operations

```ruby
# Create multiple communities
communities = terrarium.communities.create_many([
  { name: 'Community 1' },
  { name: 'Community 2' }
])

# Update multiple communities
updated = terrarium.communities.update_many([
  { id: 'comm_1', name: 'Updated 1' },
  { id: 'comm_2', name: 'Updated 2' }
])
```

### Pagination

```ruby
# Manual pagination
response = terrarium.communities.list(page: 1, limit: 10)
communities = response.data
meta = response.meta

# Automatic pagination
terrarium.communities.each do |community|
  puts community
end

# Get all items
all_communities = terrarium.communities.all
```

### Webhooks

```ruby
# Verify webhook signature
is_valid = terrarium.webhooks.verify_signature(
  payload: request.body.read,
  signature: request.headers['x-terrarium-signature'],
  timestamp: request.headers['x-terrarium-timestamp']
)

# Handle webhook events
terrarium.webhooks.on(:community_created) do |event|
  puts "New community: #{event.data}"
end
```

## Testing

```ruby
# Create a test client
test_client = Terrarium::Client.new(
  api_key: 'test-api-key',
  environment: :test
)

# Mock responses
test_client.mock(:communities_create,
  status: 201,
  data: {
    id: 'comm_test',
    name: 'Test Community'
  }
)

# Run tests
community = test_client.communities.create(
  name: 'Test Community'
)
```
