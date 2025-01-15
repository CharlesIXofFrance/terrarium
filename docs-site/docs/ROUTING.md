# Routing Architecture

## Overview

Terrarium uses a subdomain-based routing architecture for multi-tenant separation. This approach provides several benefits:

- Clear separation between tenants
- Better SEO optimization
- Professional look and feel
- Natural isolation for cookies/localStorage
- Support for custom domains

## Domain Structure

### Main Domain (`terrarium.dev`)

- Landing page and marketing content
- Main authentication flows
- Platform-wide features

### Platform Subdomain (`platform.terrarium.dev`)

- Platform administration
- Community management
- User management
- Analytics dashboard

### Community Subdomains (`[community-slug].terrarium.dev`)

- Community-specific content
- Member area
- Job boards
- Community settings

## Implementation Details

### Router Components

1. **SubdomainRouter** (`src/components/routing/SubdomainRouter.tsx`)

   - Main router that handles subdomain parsing and routing
   - Determines which set of routes to render based on the current subdomain
   - Handles authentication state and protected routes

2. **CommunityRoutes** (`src/components/routing/CommunityRoutes.tsx`)

   - Community-specific routes
   - Handles both community admin and member routes
   - Implements role-based access control

3. **PlatformRoutes** (`src/components/routing/PlatformRoutes.tsx`)
   - Platform administration routes
   - Restricted to platform owners
   - Manages global platform settings

### Subdomain Utilities

The `src/lib/utils/subdomain.ts` module provides utilities for:

- Parsing domains and subdomains
- Handling custom domains
- Managing subdomain redirects
- Local development support

## Local Development

During local development, subdomains are simulated using URL parameters:

```
Main app:    http://localhost:3000
Platform:    http://localhost:3000?subdomain=platform
Community:   http://localhost:3000?subdomain=community-slug
```

## Production Setup Requirements

1. **DNS Configuration**

   - Set up wildcard DNS record (`*.terrarium.dev`)
   - Configure custom domain handling

2. **SSL Certificates**

   - Obtain wildcard SSL certificate
   - Set up automatic certificate renewal

3. **Hosting Configuration**
   - Configure web server for subdomain routing
   - Set up proper proxy rules if needed

## Best Practices

1. **URL Generation**

   - Always use the subdomain utilities to generate URLs
   - Never hardcode domain names
   - Handle custom domains appropriately

2. **State Management**

   - Use subdomain-specific stores when needed
   - Properly scope cookies and localStorage
   - Handle cross-subdomain authentication

3. **Security**
   - Implement proper CORS policies
   - Use secure cookie settings
   - Validate subdomain access rights

## Example Usage

```typescript
import { getSubdomainUrl, redirectToSubdomain } from '@/lib/utils/subdomain';

// Generate a URL for a community
const communityUrl = getSubdomainUrl('my-community', '/dashboard');

// Redirect to platform
redirectToSubdomain('platform', '/settings');

// Redirect to main domain
redirectToSubdomain(null, '/login');
```
