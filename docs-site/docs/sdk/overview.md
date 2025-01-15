---
sidebar_position: 1
---

# Terrarium SDKs

Terrarium provides official SDKs for multiple programming languages to help you integrate with our platform easily.

## Available SDKs

- [JavaScript SDK](/docs/sdk/javascript)
- [Python SDK](/docs/sdk/python)
- [Ruby SDK](/docs/sdk/ruby)
- [Go SDK](/docs/sdk/go)

## Common Features

All our SDKs provide:

- Authentication management
- Community operations
- Job board management
- Analytics tracking
- Error handling

## Getting Started

1. Choose your preferred SDK from the list above
2. Follow the installation instructions
3. Configure authentication
4. Start making API calls

## Example Usage

Here's a quick example using our JavaScript SDK:

```javascript
import { TerrariumClient } from '@terrarium/sdk';

const client = new TerrariumClient({
  apiKey: 'your-api-key',
});

// Create a new community
const community = await client.communities.create({
  name: 'My Tech Community',
  description: 'A community for tech enthusiasts',
});

// Post a job
const job = await client.jobs.create({
  communityId: community.id,
  title: 'Senior Developer',
  description: 'Looking for an experienced developer...',
});
```

## Support

If you need help with our SDKs:

1. Check the SDK-specific documentation
2. Join our [Discord community](https://discord.gg/terrarium)
3. Open an issue on [GitHub](https://github.com/CharlesIXofFrance/terrarium)
