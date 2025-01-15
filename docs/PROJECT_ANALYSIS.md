# Terrarium Project Analysis

Version: 1.0.4 (January 2025)
Last Updated: 2025-01-15

## Document Changelog

- v1.0.4 (2025-01-15): Enhanced testing documentation and infrastructure
  - Consolidated testing documentation
  - Improved test patterns and examples
  - Reorganized internal and public docs
  - Added detailed environment-specific testing guidelines
- v1.0.3 (2025-01-15): Implemented CI/CD and testing infrastructure
  - Added GitHub Actions workflow for CI/CD
  - Configured test coverage thresholds
  - Added automated deployment stages
- v1.0.2 (2025-01-15): Updated testing infrastructure analysis
  - Added current testing setup details
  - Revised timeline for implementation
- v1.0.1 (2025-01-15): Added documentation preview system
  - Set up Netlify deployment
  - Added preview workflow
  - Improved documentation structure
- v1.0.0 (2025-01-15): Initial comprehensive documentation
  - Core architecture documentation
  - Development standards
  - Infrastructure setup
  - Quality assurance practices
  - Security implementation

## Document Maintenance Guidelines

### 1. Version Control

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Major: Breaking changes to architecture or standards
- Minor: New features or substantial additions
- Patch: Clarifications and minor updates

### 2. Update Frequency

- Scheduled review: Monthly
- Immediate updates: For major architectural changes
- Change proposals: Submit via pull requests

### 3. Related Documentation

- Detailed implementation guides: `/docs/implementation/`
- API documentation: `/docs/api/`
- Security protocols: `/docs/security/`
- Development workflows: `/docs/workflows/`

## Project Overview

Terrarium is a multi-tenant community platform designed to provide job boards, community management, and member engagement features. This document provides a comprehensive analysis of the project structure, architecture, and recommendations for future development.

## Technical Stack

### Frontend

- **Core**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**:
  - Jotai for global state
  - React Query for server state
  - React Hook Form for form state
- **UI Components**: Radix UI
- **Data Visualization**: Chart.js
- **Type Checking**: TypeScript
- **Testing**: Vitest, Testing Library

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: RESTful with Supabase
- **Real-time**: Supabase Realtime (planned)

### Development Tools

- **Code Quality**: ESLint, Prettier
- **Version Control**: Git
- **Package Manager**: npm
- **CI/CD**: GitHub Actions
- **Documentation**: Markdown
- **Testing**: Vitest, Playwright

## Project Structure Analysis

### Core Directories Detailed Breakdown

```
terrarium/
├── src/
│   ├── api/                # API client configurations
│   │   └── routes/        # API route definitions
│   │
│   ├── backend/           # Backend services and types
│   │   ├── services/     # Core services
│   │   │   ├── auth.service.ts
│   │   │   └── rbac.service.ts
│   │   └── types/       # Backend type definitions
│   │
│   ├── components/        # React components
│   │   ├── features/     # Feature-specific components
│   │   │   ├── auth/    # Authentication components
│   │   │   ├── community/ # Community management
│   │   │   ├── jobs/    # Job board components
│   │   │   └── members/ # Member management
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Reusable UI components
│   │       ├── atoms/   # Basic UI elements
│   │       ├── molecules/ # Composite components
│   │       └── organisms/ # Complex components
│   │
│   ├── lib/              # Core utilities and hooks
│   │   ├── hooks/       # Custom React hooks
│   │   ├── utils/       # Utility functions
│   │   └── constants/   # Application constants
│   │
│   ├── pages/            # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── community/   # Community pages
│   └── member/      # Member pages
│   │
│   ├── services/         # Service layer
│   ├── stores/           # State management
│   └── types/            # TypeScript types
│
├── docs/                 # Documentation
├── supabase/            # Database configuration
├── tests/               # Test files
└── e2e/                 # End-to-end tests
```

## Component Analysis

### Authentication System

Location: `src/backend/services/auth.service.ts`

Current Implementation:

```typescript
class AuthenticationError extends Error implements AuthError {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

const authService = {
  async login({ email, password }: LoginCredentials): Promise<AuthResult> {
    // Implementation
  },
  async register(
    data: RegisterData
  ): Promise<{ needsEmailVerification: boolean }> {
    // Implementation
  },
  // ... other methods
};
```

Improvements Needed:

1. **Error Handling**

```typescript
// Current
throw new AuthenticationError(error.name, error.message);

// Proposed
throw new AuthenticationError({
  code: error.name,
  message: error.message,
  context: {
    userId: user?.id,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  },
});
```

2. **Rate Limiting**

```typescript
// Proposed Implementation
const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
});

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    await rateLimiter.checkLimit(credentials.ip);
    // Existing login logic
  },
};
```

3. **Session Management**

```typescript
// Proposed Implementation
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SessionOptions {
  duration?: number;
  refreshToken?: boolean;
  deviceInfo?: DeviceInfo;
}

async function createSession(
  user: User,
  options: SessionOptions
): Promise<Session> {
  // Implementation
}
```

### Community Management

Location: `src/components/features/community/`

Current Issues:

1. **Large Component Sizes**

```typescript
// Current (BrandingSettings.tsx - 20KB+)
export function BrandingSettings() {
  // 500+ lines of code
}

// Proposed Split
// BrandingSettings/
// ├── index.tsx
// ├── ColorSettings.tsx
// ├── LogoSettings.tsx
// ├── TypographySettings.tsx
// └── hooks/
//     ├── useColorSettings.ts
//     ├── useLogoSettings.ts
//     └── useTypographySettings.ts
```

2. **Performance Issues**

```typescript
// Current
const { data: community } = await supabase
  .from('communities')
  .select('*')
  .eq('slug', slug)
  .single();

// Proposed
const { data: community } = await supabase
  .from('communities')
  .select(
    `
    id,
    name,
    slug,
    branding:branding_id(colors, typography),
    owner:owner_id(id, name, email)
  `
  )
  .eq('slug', slug)
  .single();
```

### Job Board System

Location: `src/components/features/jobs/`

Current Implementation:

```typescript
// JobBoard.tsx
export function JobBoard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState<JobFilters>({});
  // ... more state
}
```

Proposed Improvements:

1. **State Management**

```typescript
// jobs.store.ts
interface JobsState {
  search: {
    term: string;
    location: string;
  };
  filters: JobFilters;
  pagination: {
    page: number;
    limit: number;
  };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

const useJobsStore = create<JobsState>((set) => ({
  // Implementation
}));
```

2. **Performance Optimization**

```typescript
// useJobs.ts
export function useJobs(options: JobsQueryOptions) {
  return useQuery({
    queryKey: ['jobs', options],
    queryFn: () => fetchJobs(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

## Database Schema Analysis

### Current Schema

```sql
-- Communities Table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  community_id UUID REFERENCES communities(id),
  role TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Proposed Improvements

1. **Indexing Strategy**

```sql
-- Add indexes for common queries
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_profiles_community ON profiles(community_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_metadata ON profiles USING gin (metadata);
```

2. **Constraints and Validations**

```sql
-- Add check constraints
ALTER TABLE communities
ADD CONSTRAINT valid_slug
CHECK (slug ~* '^[a-z0-9-]+$');

ALTER TABLE profiles
ADD CONSTRAINT valid_role
CHECK (role IN ('owner', 'admin', 'member'));
```

## Performance Optimization Strategy

### Code Splitting

```typescript
// Current
import { BrandingSettings } from './BrandingSettings';

// Proposed
const BrandingSettings = lazy(() => import('./BrandingSettings'));
```

### Bundle Size Optimization

```typescript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
};
```

### Caching Strategy

```typescript
// api.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

## Security Implementation

### RBAC System

```typescript
// rbac.service.ts
interface Permission {
  action: string;
  resource: string;
}

interface Role {
  name: string;
  permissions: Permission[];
}

class RBACService {
  async hasPermission(
    userId: string,
    permission: Permission
  ): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    return this.checkPermission(userRole, permission);
  }
}
```

### API Security

```typescript
// api.interceptor.ts
axios.interceptors.request.use((config) => {
  config.headers['X-CSRF-Token'] = getCsrfToken();
  config.headers['X-Request-ID'] = generateRequestId();
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      return refreshTokenAndRetry(error.config);
    }
    return Promise.reject(error);
  }
);
```

## Testing Strategy

### Unit Tests

```typescript
// auth.service.test.ts
describe('AuthService', () => {
  describe('login', () => {
    it('should authenticate valid credentials', async () => {
      // Test implementation
    });

    it('should handle invalid credentials', async () => {
      // Test implementation
    });

    it('should respect rate limits', async () => {
      // Test implementation
    });
  });
});
```

### E2E Tests

```typescript
// community-login.spec.ts
test('community owner can customize branding', async ({ page }) => {
  // Test implementation
});
```

## Monitoring and Logging

### Error Tracking

```typescript
// error-tracking.ts
interface ErrorContext {
  user?: {
    id: string;
    role: string;
  };
  metadata?: Record<string, any>;
}

class ErrorTracker {
  captureError(error: Error, context?: ErrorContext) {
    // Implementation
  }
}
```

### Performance Monitoring

```typescript
// performance-monitoring.ts
interface PerformanceMetrics {
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
}

class PerformanceMonitor {
  trackPageLoad(metrics: PerformanceMetrics) {
    // Implementation
  }
}
```

## Accessibility Implementation

### Current Status

```typescript
// Current implementation lacks proper accessibility
<button onClick={handleClick}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>

// Proposed accessible implementation
<button
  onClick={handleClick}
  aria-busy={isLoading}
  aria-label={`${isLoading ? 'Loading' : 'Submit'} form`}
  disabled={isLoading}
>
  {isLoading ? (
    <span className="sr-only">Loading...</span>
  ) : (
    'Submit'
  )}
</button>
```

### Required Improvements

1. **ARIA Labels and Roles**

```typescript
// components/ui/atoms/Button.tsx
interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaControls?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  ariaLabel,
  ariaDescribedBy,
  ariaControls,
  children,
  ...props
}) => (
  <button
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    aria-controls={ariaControls}
    {...props}
  >
    {children}
  </button>
);
```

2. **Keyboard Navigation**

```typescript
// hooks/useKeyboardNav.ts
export function useKeyboardNav() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Tab':
          // Handle tab navigation
          break;
        case 'Enter':
          // Handle enter key
          break;
        case 'Escape':
          // Handle escape key
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

## Performance Metrics and Monitoring

### Core Web Vitals Tracking

```typescript
// utils/performance.ts
export function trackWebVitals() {
  const vitals = {
    LCP: 0, // Largest Contentful Paint
    FID: 0, // First Input Delay
    CLS: 0, // Cumulative Layout Shift
    FCP: 0, // First Contentful Paint
    TTI: 0, // Time to Interactive
  };

  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      // Track LCP
      if (entry.entryType === 'largest-contentful-paint') {
        vitals.LCP = entry.startTime;
      }
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Similar observers for other metrics
}
```

### Performance Budget

```json
{
  "budget": {
    "timings": [
      {
        "metric": "interactive",
        "budget": 3000
      },
      {
        "metric": "first-contentful-paint",
        "budget": 1000
      }
    ],
    "resourceSizes": [
      {
        "resourceType": "script",
        "budget": 300
      },
      {
        "resourceType": "total",
        "budget": 1000
      }
    ]
  }
}
```

## Error Boundary Implementation

### Global Error Boundary

```typescript
// components/ErrorBoundary.tsx
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    errorTracker.captureError(error, {
      extra: errorInfo,
      tags: {
        component: 'GlobalErrorBoundary'
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## API Rate Limiting and Caching

### Rate Limiting Implementation

```typescript
// services/rateLimiter.ts
class RateLimiter {
  private cache: Map<string, number[]>;
  private windowMs: number;
  private maxRequests: number;

  constructor(options: { windowMs: number; maxRequests: number }) {
    this.cache = new Map();
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
  }

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const timestamps = this.cache.get(key) || [];

    // Remove old timestamps
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }

    validTimestamps.push(now);
    this.cache.set(key, validTimestamps);
    return true;
  }
}
```

### API Caching Strategy

```typescript
// services/apiCache.ts
interface CacheOptions {
  ttl: number;
  maxSize: number;
  invalidateOn?: string[];
}

class APICache {
  private cache: Map<string, { data: any; timestamp: number }>;
  private options: CacheOptions;

  constructor(options: CacheOptions) {
    this.cache = new Map();
    this.options = options;
  }

  async get<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.options.ttl) {
      return cached.data;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  invalidate(keys: string[]) {
    keys.forEach((key) => this.cache.delete(key));
  }
}
```

## Security Hardening

### Content Security Policy

```typescript
// config/security.ts
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://analytics.example.com'],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://api.example.com'],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
};
```

### XSS Prevention

```typescript
// utils/security.ts
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function sanitizeFileName(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}
```

## Deployment Strategy

### CI/CD Pipeline Configuration

```yaml
# .github/workflows/deployment.yml
name: Deployment
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Build
        run: npm run build
      - name: Deploy to staging
        if: github.ref == 'refs/heads/staging'
        run: |
          # Deploy to staging environment
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: |
          # Deploy to production environment
```

### Environment Configuration

```typescript
// config/environment.ts
interface EnvironmentConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  auth: {
    sessionDuration: number;
    refreshTokenWindow: number;
  };
  features: {
    realtime: boolean;
    analytics: boolean;
    experimentation: boolean;
  };
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    api: {
      baseUrl: 'http://localhost:3000',
      timeout: 5000,
      retryAttempts: 3,
    },
    auth: {
      sessionDuration: 24 * 60 * 60 * 1000,
      refreshTokenWindow: 5 * 60 * 1000,
    },
    features: {
      realtime: true,
      analytics: false,
      experimentation: true,
    },
  },
  production: {
    // Production config
  },
};
```

## Analytics and Monitoring

### User Analytics

```typescript
// services/analytics.ts
interface EventProperties {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

class Analytics {
  trackEvent(name: string, properties?: EventProperties) {
    // Implementation
  }

  trackPageView(path: string) {
    // Implementation
  }
}
```

### Error Monitoring

```typescript
// services/errorMonitoring.ts
interface ErrorContext {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

class ErrorMonitoring {
  private static instance: ErrorMonitoring;

  private constructor() {
    window.addEventListener(
      'unhandledrejection',
      this.handleUnhandledRejection
    );
    window.addEventListener('error', this.handleError);
  }

  static getInstance(): ErrorMonitoring {
    if (!ErrorMonitoring.instance) {
      ErrorMonitoring.instance = new ErrorMonitoring();
    }
    return ErrorMonitoring.instance;
  }

  captureError(error: Error, context?: ErrorContext) {
    // Implementation
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    // Implementation
  }

  private handleError(event: ErrorEvent) {
    // Implementation
  }
}
```

## Database Management

### Migration Strategy

```typescript
// migrations/Migration.ts
interface MigrationMetadata {
  version: string;
  description: string;
  timestamp: number;
}

abstract class Migration {
  abstract up(): Promise<void>;
  abstract down(): Promise<void>;
  abstract get metadata(): MigrationMetadata;
}

// migrations/20250115_add_user_preferences.ts
class AddUserPreferencesMigration extends Migration {
  async up() {
    await supabase.rpc('create_user_preferences_table', {
      sql: `
        CREATE TABLE user_preferences (
          user_id UUID REFERENCES auth.users(id),
          theme VARCHAR(20) DEFAULT 'light',
          notifications JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (user_id)
        );
      `,
    });
  }

  async down() {
    await supabase.rpc('drop_user_preferences_table', {
      sql: 'DROP TABLE user_preferences;',
    });
  }

  get metadata(): MigrationMetadata {
    return {
      version: '20250115001',
      description: 'Add user preferences table',
      timestamp: 1705270343000,
    };
  }
}
```

## Real-time Communication

### WebSocket Manager

```typescript
// services/websocket/WebSocketManager.ts
interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

class WebSocketManager {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(private url: string) {
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
    this.socket.onerror = this.handleError.bind(this);
  }

  private handleMessage(event: MessageEvent) {
    const message: WebSocketMessage = JSON.parse(event.data);
    const listeners = this.listeners.get(message.type);
    listeners?.forEach((listener) => listener(message.payload));
  }

  private handleClose() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(
        () => this.connect(),
        1000 * Math.pow(2, this.reconnectAttempts)
      );
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error);
  }

  subscribe(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  unsubscribe(type: string, callback: (data: any) => void) {
    this.listeners.get(type)?.delete(callback);
  }
}
```

## Progressive Web App Implementation

### Service Worker

```typescript
// public/service-worker.ts
const CACHE_NAME = 'terrarium-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/static/images/logo.png',
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
```

### PWA Manifest

```json
{
  "name": "Terrarium",
  "short_name": "Terrarium",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Code Quality Standards

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    'max-len': ['error', { code: 100 }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/explicit-function-return-type': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### Testing Standards

```typescript
// tests/standards.md
/**
 * Testing Standards
 *
 * 1. Unit Tests
 *    - All business logic must have unit tests
 *    - Min coverage: 80% statements, 70% branches
 *    - Use meaningful test descriptions
 *
 * 2. Integration Tests
 *    - Test all API endpoints
 *    - Test main user flows
 *    - Include error cases
 *
 * 3. E2E Tests
 *    - Cover critical user journeys
 *    - Test on multiple browsers
 *    - Include mobile viewport tests
 */

// Example Test Pattern
describe('UserService', () => {
  describe('updatePreferences', () => {
    it('should update user preferences successfully', async () => {
      // Arrange
      const userId = 'test-user';
      const preferences = { theme: 'dark' };

      // Act
      const result = await userService.updatePreferences(userId, preferences);

      // Assert
      expect(result).toBeDefined();
      expect(result.theme).toBe('dark');
    });

    it('should handle invalid preferences gracefully', async () => {
      // Arrange
      const userId = 'test-user';
      const invalidPreferences = { theme: 123 }; // Invalid type

      // Act & Assert
      await expect(
        userService.updatePreferences(userId, invalidPreferences)
      ).rejects.toThrow('Invalid preference format');
    });
  });
});
```

## Incident Response

### Error Classification

```typescript
// services/error/ErrorClassification.ts
enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

interface ErrorMetadata {
  severity: ErrorSeverity;
  category: string;
  source: string;
  userImpact: string;
}

class ErrorClassifier {
  classify(error: Error): ErrorMetadata {
    if (error instanceof DatabaseError) {
      return {
        severity: ErrorSeverity.HIGH,
        category: 'database',
        source: 'database-layer',
        userImpact: 'Data operations affected',
      };
    }

    if (error instanceof AuthenticationError) {
      return {
        severity: ErrorSeverity.MEDIUM,
        category: 'auth',
        source: 'auth-service',
        userImpact: 'User login affected',
      };
    }

    // Default classification
    return {
      severity: ErrorSeverity.LOW,
      category: 'unknown',
      source: 'application',
      userImpact: 'Limited functionality',
    };
  }
}
```

### Incident Response Procedure

```typescript
// services/incident/IncidentManager.ts
interface Incident {
  id: string;
  error: Error;
  metadata: ErrorMetadata;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

class IncidentManager {
  private activeIncidents: Map<string, Incident> = new Map();
  private errorClassifier = new ErrorClassifier();

  async handleIncident(error: Error): Promise<void> {
    const metadata = this.errorClassifier.classify(error);
    const incident: Incident = {
      id: uuid(),
      error,
      metadata,
      status: 'open',
      createdAt: new Date(),
    };

    // Log incident
    await this.logIncident(incident);

    // Notify relevant teams
    if (metadata.severity >= ErrorSeverity.HIGH) {
      await this.notifyTeam(incident);
    }

    // Auto-recovery for known issues
    if (this.canAutoRecover(incident)) {
      await this.attemptRecovery(incident);
    }

    this.activeIncidents.set(incident.id, incident);
  }

  private async logIncident(incident: Incident): Promise<void> {
    // Implementation
  }

  private async notifyTeam(incident: Incident): Promise<void> {
    // Implementation
  }

  private canAutoRecover(incident: Incident): boolean {
    // Implementation
    return false;
  }

  private async attemptRecovery(incident: Incident): Promise<void> {
    // Implementation
  }
}
```

## Technical Debt Tracking

### Technical Debt Registry

```typescript
// utils/technical-debt/Registry.ts
interface TechnicalDebt {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'small' | 'medium' | 'large';
  area: string;
  created: Date;
  deadline?: Date;
  tags: string[];
}

class TechnicalDebtRegistry {
  private items: TechnicalDebt[] = [];

  add(debt: Omit<TechnicalDebt, 'id' | 'created'>): void {
    this.items.push({
      ...debt,
      id: uuid(),
      created: new Date(),
    });
  }

  getPrioritized(): TechnicalDebt[] {
    return [...this.items].sort((a, b) => {
      // Prioritize high impact items
      const impactScore = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactScore[b.impact] - impactScore[a.impact];
      if (impactDiff !== 0) return impactDiff;

      // Then by effort (prefer quick wins)
      const effortScore = { small: 1, medium: 2, large: 3 };
      const effortDiff = effortScore[a.effort] - effortScore[b.effort];
      if (effortDiff !== 0) return effortDiff;

      // Finally by deadline if exists
      if (a.deadline && b.deadline) {
        return a.deadline.getTime() - b.deadline.getTime();
      }
      return 0;
    });
  }

  getByArea(area: string): TechnicalDebt[] {
    return this.items.filter((item) => item.area === area);
  }

  getByTag(tag: string): TechnicalDebt[] {
    return this.items.filter((item) => item.tags.includes(tag));
  }
}
```

## Immediate Action Items

### 1. Testing Infrastructure

```bash
# Install dependencies
npm install -D vitest @testing-library/react @testing-library/user-event

# Set up test configuration
npm install -D @vitest/coverage-c8
```

### 2. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run E2E tests
        run: npm run test:e2e
```

### 3. Documentation

```bash
# Install documentation generator
npm install -D typedoc

# Generate documentation
npx typedoc --out docs/api src/
```

## Long-term Recommendations

### 1. Micro-frontend Architecture

```typescript
// app.tsx
const CommunityApp = lazy(() => import('./apps/community'));
const MemberApp = lazy(() => import('./apps/member'));
const AdminApp = lazy(() => import('./apps/admin'));
```

### 2. Real-time Features

```typescript
// real-time.ts
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const channel = supabase
  .channel('room1')
  .on('presence', { event: 'sync' }, () => {
    const newState = channel.presenceState();
    // Handle presence state
  })
  .subscribe();
```

### 3. Analytics Integration

```typescript
// analytics.ts
class Analytics {
  trackEvent(name: string, properties?: Record<string, any>) {
    // Implementation
  }

  trackPageView(path: string) {
    // Implementation
  }
}
```

## Current State Analysis

### Testing Infrastructure

✅ Test Environment (Already Set Up):

- Vitest with JSDOM for browser-like environment
- Jest DOM matchers for assertions
- React Testing Library for component testing
- User Event for simulating user interactions
- Global mocks for fetch, localStorage, ResizeObserver, etc.

✅ Test Scripts:

- `test`: Run tests in watch mode
- `test:coverage`: Run tests with coverage
- `test:ui`: Run tests with UI

✅ Testing Patterns:

- Component isolation
- Mock dependencies
- User interaction testing
- Async testing
- Proper cleanup between tests

### Areas for Improvement

#### 1. Test Coverage Enhancement (1-2 days)

- Configure coverage thresholds
  - Set minimum coverage requirements (2-3 hours)
  - Add coverage reporting to CI (2-3 hours)
- Add tests for new components (4-6 hours)
  - Routing components
  - Job board components
  - Community admin components

#### 2. CI/CD Pipeline (2-3 days)

- Setup GitHub Actions (4-6 hours)
  - Configure test automation
  - Add coverage reporting
  - Set up deployment environments
- Configure test status reporting (4-6 hours)
  - Add status badges
  - Configure PR checks
- Setup deployment automation (4-6 hours)
  - Development environment
  - Staging environment
  - Production environment

#### 3. Test Documentation (4-6 hours)

- Document test patterns (2-3 hours)
  - Component testing strategies
  - Mocking patterns
  - Common test scenarios
- Add test examples (2-3 hours)
  - Basic component tests
  - Complex interaction tests
  - Async operation tests

## Implementation Plan

### Phase 1: Coverage Enhancement

1. Configure coverage thresholds
2. Add tests for new components
3. Set up coverage reporting

### Phase 2: CI/CD Setup

1. Configure GitHub Actions
2. Set up test automation
3. Add deployment workflows

### Phase 3: Documentation

1. Document test patterns
2. Add example tests
3. Update development guides

## Timeline

- Phase 1: 1-2 days
- Phase 2: 2-3 days
- Phase 3: 1 day

Total estimated time: 4-6 days

## Success Criteria

- Test coverage above 80%
- All critical paths tested
- Automated CI/CD pipeline
- Clear test documentation
- Fast and reliable test suite

### Testing Infrastructure

The project uses a comprehensive testing setup:

1. **Unit Testing**

   - Framework: Vitest
   - Coverage requirements: >80% for core functionality
   - Patterns: Component testing, hooks testing, utility testing
   - Location: `__tests__` directories adjacent to source files

2. **Integration Testing**

   - Framework: Vitest + React Testing Library
   - Focus: Component interactions, data flow, API integration
   - Coverage: Critical user flows and feature interactions
   - Environment: Development environment with test database

3. **End-to-End Testing**

   - Framework: Playwright
   - Scope: Critical user journeys
   - Environments: Development environment
   - Browsers: Chrome, Firefox, Safari

4. **Test Data Management**

   - Development: Regular refresh of test data
   - CI/CD: Isolated test database
   - Cleanup: Automated daily cleanup

5. **Test Documentation**

   - Internal: Detailed patterns and examples in `/docs/testing.md`
   - Public: High-level overview in docs-site
   - Checklist: Manual testing procedures in `/docs/TESTING_CHECKLIST.md`

6. **CI/CD Integration**
   - Automated test runs on pull requests
   - Coverage reports via Codecov
   - Required status checks for merging
