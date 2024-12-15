# Security and Coding Protocols for Multi-Tenant Architecture

## Multi-Tenant Security Model

### 1. Tenant Isolation

#### Data Isolation
```typescript
// Tenant context middleware
interface TenantContext {
  tenantId: string;
  organizationId: string;
  permissions: string[];
}

// Database queries must always include tenant context
interface BaseRepository<T> {
  find(context: TenantContext, query: Query): Promise<T[]>;
  create(context: TenantContext, data: Partial<T>): Promise<T>;
  // ... other methods
}

// Example implementation
class JobRepository implements BaseRepository<Job> {
  async find(context: TenantContext, query: Query): Promise<Job[]> {
    return this.db.jobs.find({
      ...query,
      tenantId: context.tenantId, // Always enforce tenant isolation
    });
  }
}
```

#### API Isolation
```typescript
// API route middleware
const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    return res.status(401).json({ error: 'Tenant ID required' });
  }
  
  // Validate tenant access
  const tenant = await validateTenantAccess(tenantId, req.user);
  if (!tenant) {
    return res.status(403).json({ error: 'Invalid tenant access' });
  }
  
  req.tenantContext = {
    tenantId,
    organizationId: tenant.organizationId,
    permissions: tenant.permissions,
  };
  
  next();
};
```

### 2. Authentication & Authorization

#### JWT Token Structure
```typescript
interface JWTPayload {
  sub: string;          // User ID
  tenantId: string;     // Current tenant context
  org: string;          // Organization ID
  roles: string[];      // User roles
  permissions: string[];// Granular permissions
  scope: string[];      // API scopes
  exp: number;          // Expiration
  jti: string;          // Token ID for revocation
}

// Token service
class TokenService {
  generateToken(user: User, tenant: Tenant): string {
    return jwt.sign({
      sub: user.id,
      tenantId: tenant.id,
      org: tenant.organizationId,
      roles: user.roles,
      permissions: this.computePermissions(user, tenant),
      scope: tenant.allowedScopes,
      jti: uuid(),
      exp: Date.now() + TOKEN_EXPIRY,
    }, process.env.JWT_SECRET);
  }
}
```

#### Role-Based Access Control (RBAC)
```typescript
// Permission definitions
enum Permission {
  READ_JOBS = 'jobs:read',
  WRITE_JOBS = 'jobs:write',
  MANAGE_USERS = 'users:manage',
  // ... other permissions
}

// Role definitions
interface Role {
  name: string;
  permissions: Permission[];
  tenantScoped: boolean; // Whether role applies across tenants
}

// Authorization decorator
const requirePermission = (permission: Permission) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const context = this.tenantContext as TenantContext;
      if (!context.permissions.includes(permission)) {
        throw new UnauthorizedError();
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
};
```

### 3. Data Security

#### Encryption at Rest
```typescript
// Encryption service
class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  }

  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      encrypted: encrypted.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  decrypt(data: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(data.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
    
    return Buffer.concat([
      decipher.update(Buffer.from(data.encrypted, 'hex')),
      decipher.final(),
    ]).toString();
  }
}
```

#### Data Masking
```typescript
// PII data masking
const maskPII = (value: string, type: 'email' | 'phone' | 'ssn'): string => {
  switch (type) {
    case 'email':
      const [local, domain] = value.split('@');
      return `${local[0]}***@${domain}`;
    case 'phone':
      return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    case 'ssn':
      return value.replace(/\d{5}(\d{4})/, '*****$1');
    default:
      return value;
  }
};
```

### 4. API Security

#### Rate Limiting
```typescript
// Rate limiting middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Different limits per tenant tier
    const tenant = req.tenantContext;
    return tenant.tier === 'enterprise' ? 1000 : 100;
  },
  keyGenerator: (req) => {
    // Rate limit by tenant and user
    return `${req.tenantContext.tenantId}:${req.user.id}`;
  },
});
```

#### Request Validation
```typescript
// Request validation middleware
const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details,
      });
    }
    
    next();
  };
};
```

## Coding Best Practices

### 1. Error Handling

```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Global error handler
const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error', { error: err });
  
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
};
```

### 2. Logging

```typescript
// Structured logging
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'terrarium-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

// Request logging middleware
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      tenantId: req.tenantContext?.tenantId,
      userId: req.user?.id,
      duration: Date.now() - start,
      status: res.statusCode,
    });
  });
  
  next();
};
```

### 3. Performance Monitoring

```typescript
// Performance monitoring middleware
const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    if (duration > 1000) { // Alert on slow requests
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration,
        tenantId: req.tenantContext?.tenantId,
      });
    }
    
    metrics.recordRequestDuration(duration, {
      method: req.method,
      route: req.route?.path,
      tenant: req.tenantContext?.tenantId,
    });
  });
  
  next();
};
```

### 4. Database Best Practices

```typescript
// Database connection pool
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Query helper with automatic tenant isolation
const executeQuery = async <T>(
  context: TenantContext,
  query: string,
  params: any[]
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('SET app.tenant_id = $1', [context.tenantId]);
    return await client.query(query, params);
  } finally {
    client.release();
  }
};
```

## Security Checklist

### Authentication & Authorization
- [ ] Implement JWT with proper expiration
- [ ] Add refresh token rotation
- [ ] Implement role-based access control
- [ ] Add tenant context validation
- [ ] Implement API key management
- [ ] Add OAuth2 support for third-party integrations

### Data Security
- [ ] Implement data encryption at rest
- [ ] Add transport layer security
- [ ] Implement PII data masking
- [ ] Add audit logging
- [ ] Implement backup and recovery
- [ ] Add data retention policies

### API Security
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Implement CORS policies
- [ ] Add API versioning
- [ ] Implement request signing
- [ ] Add API documentation

### Infrastructure Security
- [ ] Set up VPC configuration
- [ ] Implement network segmentation
- [ ] Add WAF rules
- [ ] Set up monitoring and alerting
- [ ] Implement disaster recovery
- [ ] Add security scanning

### Compliance
- [ ] Implement GDPR requirements
- [ ] Add data privacy controls
- [ ] Implement audit trails
- [ ] Add compliance reporting
- [ ] Set up data governance
- [ ] Implement data classification

## Implementation Priority

1. **Critical Security Features**
   - Tenant isolation
   - Authentication system
   - Basic authorization
   - Data encryption
   - API security

2. **Enhanced Security**
   - Advanced RBAC
   - Audit logging
   - Enhanced monitoring
   - Security alerting
   - Compliance features

3. **Optional Features**
   - Advanced analytics
   - Custom security rules
   - Advanced compliance
   - Enhanced monitoring
   - Custom security policies

## Monitoring and Alerts

### Security Monitoring
- Failed authentication attempts
- Unusual access patterns
- Data access anomalies
- API usage patterns
- Performance degradation

### Security Alerts
- Authentication failures
- Authorization violations
- Rate limit breaches
- Data access violations
- System anomalies

## Regular Security Reviews

1. **Weekly**
   - Review access logs
   - Check failed attempts
   - Monitor rate limits
   - Review performance
   - Check error rates

2. **Monthly**
   - Security patch updates
   - Dependency updates
   - Performance review
   - Security scan
   - Compliance check

3. **Quarterly**
   - Full security audit
   - Penetration testing
   - Compliance review
   - Architecture review
   - Policy updates
