# Terrarium Onboarding Guide

## Quick Start

### For Developers

1. **Environment Setup**
   ```bash
   # Clone and setup
   git clone https://github.com/CharlesIXofFrance/terrarium.git
   cd terrarium
   npm install

   # Configure environment
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

2. **Database Setup**
   ```bash
   # Install Supabase CLI
   brew install supabase/tap/supabase

   # Start local Supabase
   npx supabase start

   # Apply migrations
   npx supabase db push
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```

### For Community Administrators

1. **Initial Setup**
   - Navigate to `/admin/setup`
   - Complete the community profile
   - Configure branding settings
   - Set up job board preferences

2. **Member Management**
   - Configure member roles
   - Set up invitation system
   - Define membership tiers

3. **Job Board Setup**
   - Configure job categories
   - Set up application forms
   - Define employer guidelines

### For Community Members

1. **Profile Setup**
   - Complete professional profile
   - Set notification preferences
   - Configure privacy settings

2. **Community Engagement**
   - Join relevant groups
   - Set up job alerts
   - Connect with other members

### For Employers

1. **Company Profile**
   - Create company profile
   - Set up employer branding
   - Configure job posting templates

2. **Recruitment Setup**
   - Define hiring workflow
   - Set up team access
   - Configure application tracking

## Troubleshooting

### Common Issues

1. **Environment Setup**
   - Issue: Missing environment variables
   - Solution: Check `.env.example` for required variables

2. **Database Connection**
   - Issue: Cannot connect to Supabase
   - Solution: Verify credentials in `.env.local`

3. **Build Errors**
   - Issue: TypeScript errors
   - Solution: Run `npm run type-check` for detailed errors

## Best Practices

1. **Security**
   - Use environment variables for sensitive data
   - Follow role-based access control
   - Implement proper data validation

2. **Performance**
   - Optimize image uploads
   - Use proper caching strategies
   - Follow lazy loading patterns

3. **Code Quality**
   - Follow TypeScript best practices
   - Write comprehensive tests
   - Use proper error handling

## Support

- GitHub Issues: [Report bugs](https://github.com/CharlesIXofFrance/terrarium/issues)
- Documentation: [Full documentation](./docs)
- Community: [Join our Discord](#)
