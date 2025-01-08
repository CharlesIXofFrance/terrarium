# Development Guidelines and Standards

## 1. Project Structure and Organization

### Frontend Structure

```
src/
├── components/
│   ├── ui/             # Generic UI components
│   │   ├── atoms/     # Basic UI elements (Button, Input)
│   │   └── molecules/ # Composed UI components (Card, Modal)
│   ├── features/      # Feature-specific components
│   │   ├── auth/     # Authentication components
│   │   ├── jobs/     # Job-related components
│   │   └── events/   # Event-related components
│   ├── layout/        # Layout components
│   │   ├── molecules/ # Layout-specific molecules
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── charts/        # Data visualization components
│   └── platform/      # Platform owner components
├── pages/             # Route components
│   ├── auth/         # Authentication pages
│   ├── member/       # Member-specific pages
│   └── community/    # Community owner pages
├── lib/              # Application logic
│   ├── hooks/        # Custom React hooks
│   ├── stores/       # State management
│   ├── types/        # TypeScript types
│   ├── utils/        # Utility functions
│   └── mocks/        # Mock data
└── styles/           # Global styles and themes
```

### Backend Structure

```
server/
├── api/                # API routes and controllers
├── config/             # Configuration files
├── db/                 # Database migrations and models
├── middleware/         # Custom middleware
├── services/           # Business logic
└── utils/              # Utility functions
```

## 2. Code Style and Standards

### TypeScript/JavaScript

```typescript
// Use explicit typing
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Use enums for fixed values
enum UserRole {
  PLATFORM_OWNER = 'PLATFORM_OWNER',
  COMMUNITY_OWNER = 'COMMUNITY_OWNER',
  MEMBER = 'MEMBER',
  EMPLOYER = 'EMPLOYER',
}

// Use meaningful variable names
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  // ...
};

// Document complex functions
/**
 * Calculates the community score based on various metrics
 * @param metrics - Array of community engagement metrics
 * @returns Calculated community score
 */
const calculateCommunityScore = (metrics: CommunityMetric[]): number => {
  // ...
};
```

### React Components

```typescript
// Use functional components with TypeScript
interface ProfileCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onEdit }) => {
  // ...
};

// Use custom hooks for reusable logic
const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // ...
  return { profile, loading, error };
};
```

## 3. State Management Patterns

### Authentication State

```typescript
// Use Jotai atoms for global state
import { atom } from 'jotai';
import type { UserProfile, Community } from '../types';

// Define atoms at the top level
export const userAtom = atom<UserProfile | null>(null);
export const userCommunityAtom = atom<Community | null>(null);

// Use atoms in components
function MyComponent() {
  const [user] = useAtom(userAtom);
  const [community] = useAtom(userCommunityAtom);

  // Access user and community data
}
```

### Protected Routes

```typescript
// Use the ProtectedRoute component
<Route
  path="/c/:slug/*"
  element={
    <ProtectedRoute>
      <CommunityLayout />
    </ProtectedRoute>
  }
/>

// Validate community access
if (!user || user.role !== 'community_owner' || !userCommunity || userCommunity.slug !== slug) {
  return <Navigate to="/login" replace />;
}
```

### Error Handling

```typescript
// Handle missing data gracefully
const { slug } = useParams();
if (!slug) {
  return <div>Invalid community</div>;
}

// Validate community access
if (!community) {
  return <Navigate to="/dashboard" replace />;
}
```

## 4. Database Patterns

### Community Data Structure

```sql
-- communities table
CREATE TABLE communities (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id),
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- community_settings table
CREATE TABLE community_settings (
  community_id UUID REFERENCES communities(id),
  settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Tech Stack Requirements

- React 18+ with TypeScript
- Vite for building
- TailwindCSS for styling
- Jotai for state management
- Supabase for backend/auth
- React Hook Form + Zod for forms
- React Router for routing
- Chart.js for analytics
- Radix UI for components

All new features must use these technologies consistently.

## Multi-Tenant Architecture Rules

1. Data Isolation

   - Use RLS policies for tenant isolation
   - Include community_id in relevant tables
   - Validate tenant context in queries

2. Feature Customization

   - Store community settings in JSONB
   - Use feature flags for tenant features
   - Implement proper caching strategies

3. Security
   - Validate tenant access in middleware
   - Implement proper role checks
   - Handle cross-tenant requests carefully

### Row-Level Security

```sql
-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Platform owner access policy
CREATE POLICY "Platform owners can access all communities"
ON communities
FOR ALL
USING (auth.uid() = 'PLATFORM_OWNER');

-- Community owner access policy
CREATE POLICY "Community owners can access their communities"
ON communities
FOR SELECT
USING (id IN (
  SELECT community_id
  FROM community_owners
  WHERE user_id = auth.uid()
));
```

## 5. Security Practices

### Authentication

```typescript
// Always use typed request handlers
interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  tenantId: string;
}

// Use middleware for auth checks
const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // ...
};
```

### Data Access

```typescript
// Always include tenant context
const fetchUserData = async (
  userId: string,
  tenantId: string
): Promise<UserData> => {
  // Validate tenant access
  // Fetch data with tenant scope
};
```

## 6. Testing Standards

### Unit Tests

```typescript
describe('JobService', () => {
  it('should create job with proper tenant context', async () => {
    // Arrange
    const jobData = {...};
    const tenantId = '123';

    // Act
    const result = await jobService.createJob(jobData, tenantId);

    // Assert
    expect(result.tenantId).toBe(tenantId);
  });
});
```

### Integration Tests

```typescript
describe('Job API', () => {
  it('should enforce tenant isolation', async () => {
    // Setup test data
    // Make API call
    // Verify tenant isolation
  });
});
```

## 7. Role-Based Access Control (RBAC)

### User Roles

```typescript
// Role definitions
enum UserRole {
  PLATFORM_OWNER = 'PLATFORM_OWNER', // Global platform owner
  COMMUNITY_OWNER = 'COMMUNITY_OWNER', // Owner of specific communities
  MEMBER = 'MEMBER', // Regular community member
  EMPLOYER = 'EMPLOYER', // Employer with job posting privileges
}
```

### Database Structure

```sql
-- Core tables
profiles          -- User profiles with role information
communities       -- Community information
community_owners  -- Community owner assignments

-- Row-Level Security (RLS)
- Platform owners: Full access to all tables
- Community owners:
  * Read access to all profiles
  * Write access to community owners' profiles
  * Full access to their communities
- Members:
  * Read access to all profiles
  * Write access to own profile
```

### Security Functions

```sql
-- Role check functions
auth.has_role(role)              -- Check if user has specific role
auth.is_platform_owner()              -- Check if user is platform owner
auth.is_community_owner(comm_id) -- Check if user is owner of specific community
```

## 8. Environment Setup

### Required Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Other configurations as needed
```

### Development Setup Steps

1. Clone repository:

   ```bash
   git clone https://github.com/CharlesIXofFrance/terrarium.git
   cd terrarium
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Supabase:

   ```bash
   # Install Supabase CLI
   brew install supabase/tap/supabase

   # Link your project
   npx supabase link --project-ref your_project_ref

   # Apply migrations
   npx supabase db push
   ```

4. Create `.env.local` with required environment variables

5. Start development server:
   ```bash
   npm run dev
   ```

### Database Migrations

- Location: `supabase/migrations/`
- Format: `YYYYMMDD_description.sql`
- Apply: `npx supabase db push`
- Reset: `npx supabase db reset`

## 9. Documentation Requirements

### Code Documentation

```typescript
/**
 * Service for managing community-specific job postings
 * @class JobService
 */
class JobService {
  /**
   * Creates a new job posting within a community
   * @param {CreateJobDTO} jobData - Job posting data
   * @param {string} communityId - Community identifier
   * @returns {Promise<Job>} Created job posting
   * @throws {APIError} If validation fails or user lacks permission
   */
  async createJob(jobData: CreateJobDTO, communityId: string): Promise<Job> {
    // Implementation
  }
}
```

### API Documentation

```typescript
/**
 * @api {post} /api/v1/communities/:communityId/jobs Create Job
 * @apiGroup Jobs
 * @apiParam {string} communityId Community's unique ID
 * @apiBody {CreateJobDTO} jobData Job posting data
 * @apiSuccess {Job} job Created job posting
 * @apiError {APIError} 400 Invalid input data
 * @apiError {APIError} 403 Insufficient permissions
```

## 10. Performance Guidelines

### Frontend

1. Use React.memo for expensive renders
2. Implement proper list virtualization
3. Optimize images and assets
4. Use code splitting

### Backend

1. Implement proper database indexing
2. Use caching strategies
3. Optimize API responses
4. Handle N+1 query problems

## 11. AI Context Documentation

Every file in the codebase must include an AI Context comment block at the top that explains:

1. The purpose and responsibility of the file
2. Why it's located in its current directory
3. How it fits into the larger system architecture
4. Any important design decisions or constraints

Example:

```typescript
/**
 * AI Context:
 * This component implements the community-specific login page. It's located in the pages directory
 * because it represents a full page that's directly tied to a route (/c/:slug/login).
 *
 * The page:
 * 1. Loads community-specific branding (logo, colors, text)
 * 2. Provides a login form with validation
 * 3. Handles authentication through Supabase
 *
 * It's placed in pages/ rather than features/ because it's a complete, routable page.
 * The actual login form could be extracted into features/ if needed for reuse.
 */
```

### When to Add AI Context

- All new files or older files without it must include AI Context
- When substantially modifying existing files, add AI Context
- When moving or renaming files, update AI Context
- When changing a file's responsibilities, update AI Context

### AI Context Guidelines

1. **Be Specific**

   - Explain exact responsibilities
   - List key features or functions
   - Mention important dependencies

2. **Explain Location**

   - Justify directory placement
   - Mention alternative locations considered
   - Explain relationship to nearby files

3. **Document Constraints**

   - Note any design locks
   - List immutable aspects
   - Explain security considerations

4. **Future Considerations**
   - Note potential refactoring opportunities
   - Mention planned extensions
   - List known limitations

## 12. Frontend Preservation Rules

### Design Lock

- Never modify existing UI/UX design without explicit request
- Preserve all Tailwind CSS classes exactly as they are
- Keep component structure and hierarchy unchanged
- Maintain existing animations and transitions
- Preserve all accessibility attributes

### Component Modification

- Only modify component logic, not presentation
- Keep all existing props and their types
- Maintain current component file structure
- Don't change component naming conventions
- Preserve all comments about design decisions

### File Organization

```
src/
├── components/
│   ├── ui/           # Locked UI components
│   │   └── [...]     # Don't modify without request
│   ├── features/     # Feature components
│   │   └── [...]     # Can add logic, not design
│   └── layouts/      # Layout components
│       └── [...]     # Don't modify without request
├── styles/          # Locked styles
└── theme/           # Locked theme configuration
```

## 13. Implementation Order

When implementing new features:

1. First implement all backend functionality
2. Then add state management and data flow
3. Finally, connect to existing UI components
4. Never modify UI during steps 1-3

### Review Process

- Review all proposed changes for UI modifications
- Verify no design classes were altered
- Check component structure preservation
- Ensure accessibility features remain intact
- Confirm animations and transitions are preserved

## 14. Error Handling

### Frontend Error Boundaries

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// Centralized error handling
const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error', { error });

  return res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
};
```

## 15. Deployment and CI/CD

### Build Process

1. TypeScript compilation
2. Bundle optimization
3. Asset optimization
4. Environment configuration

### Deployment Checklist

1. Database migrations
2. Environment variables
3. Security headers
4. SSL certificates
5. Monitoring setup

## 16. Monitoring and Logging

### Application Monitoring

```typescript
// Use structured logging
const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'terrarium-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

// Track performance metrics
const trackAPIMetrics = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    metrics.recordRequestDuration(duration, {
      path: req.path,
      method: req.method,
      status: res.statusCode,
    });
  });

  next();
};
```

## 17. Code Review Guidelines

### Pull Request Template

```markdown
## Description

[Description of changes]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Security Considerations

- [ ] Security impact assessed
- [ ] Tenant isolation maintained
- [ ] Input validation added
```

### Review Checklist

1. Code follows style guide
2. Proper error handling
3. Security considerations
4. Performance impact
5. Test coverage
6. Documentation updated

## File Organization

### Frontend Structure

```
src/
├── components/
│   ├── ui/             # Generic UI components
│   │   ├── atoms/     # Basic UI elements (Button, Input)
│   │   └── molecules/ # Composed UI components (Card, Modal)
│   ├── features/      # Feature-specific components
│   │   ├── auth/     # Authentication components
│   │   ├── jobs/     # Job-related components
│   │   └── events/   # Event-related components
│   ├── layout/        # Layout components
│   │   ├── molecules/ # Layout-specific molecules
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── charts/        # Data visualization components
│   └── platform/      # Platform owner components
├── pages/             # Route components
│   ├── auth/         # Authentication pages
│   ├── member/       # Member-specific pages
│   └── community/    # Community owner pages
├── lib/              # Application logic
│   ├── hooks/        # Custom React hooks
│   ├── stores/       # State management
│   ├── types/        # TypeScript types
│   ├── utils/        # Utility functions
│   └── mocks/        # Mock data
└── styles/           # Global styles and themes
```

### Implementation Guidelines

1. UI Components (`components/ui/`)

   - Never modify without explicit request
   - Keep all Tailwind classes
   - Maintain accessibility features
   - Document with @preserve-design tag

2. Feature Components (`components/features/`)

   - Can modify logic and data flow
   - Must preserve existing UI structure
   - Can add new props for functionality
   - Cannot modify visual appearance

3. Layout Components (`components/layouts/`)

   - Design-locked like UI components
   - Can add new routes and navigation
   - Must maintain existing grid/flex structure
   - Cannot modify visual hierarchy

4. Core Functionality (`lib/`)
   - Main focus for backend implementation
   - Can be modified freely
   - Should not affect UI components
   - Must maintain type safety

### Best Practices for Backend Implementation

1. Separation of Concerns

```typescript
// Good: Separate data fetching
const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });
};

// Good: UI remains unchanged
function JobList() {
  const { data: jobs } = useJobs();
  return (
    <div className="existing-classes">
      {jobs?.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

2. State Management

```typescript
// Good: Backend state management
const jobsStore = create<JobsStore>((set) => ({
  jobs: [],
  setJobs: (jobs) => set({ jobs }),
}));

// Good: UI connection
function JobCard({ job }: JobCardProps) {
  const applyToJob = useJobApplication();
  return (
    <ExistingCardComponent
      job={job}
      onApply={() => applyToJob.mutate(job.id)}
    />
  );
}
```

3. Error Handling

```typescript
// Good: Error boundary wrapper
const JobListErrorBoundary = () => (
  <ErrorBoundary fallback={<ExistingErrorUI />}>
    <JobList />
  </ErrorBoundary>
);

// Good: Loading states
function JobList() {
  const { isLoading } = useJobs();
  if (isLoading) return <ExistingLoadingUI />;
  return <ExistingListComponent />;
}
```
