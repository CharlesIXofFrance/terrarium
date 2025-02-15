# Authentication Troubleshooting Guide

This guide provides solutions for common authentication issues in the Terrarium platform.

## Common Issues & Solutions

### 1. JWT Token Issues

#### Invalid Token Format

**Symptoms:**

- 401 Unauthorized errors
- "Invalid token format" in Kong logs
- Failed requests to protected endpoints

**Solutions:**

1. Verify token format in Kong configuration:

```yaml
plugins:
  - name: jwt
    config:
      secret_is_base64: false
      key_claim_name: sub
```

2. Check token in browser storage:

```javascript
// Browser Console
localStorage.getItem('sb-auth-token');
```

3. Validate token structure using [jwt.io](https://jwt.io)

#### Token Expiration

**Symptoms:**

- Sudden session termination
- "Token expired" errors
- Automatic logout

**Solutions:**

1. Check token expiration settings in `docker-compose.yml`:

```yaml
services:
  auth:
    environment:
      GOTRUE_JWT_EXP: 3600
```

2. Verify token refresh is working:

```typescript
// src/lib/supabase.ts
export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
  },
});
```

### 2. Database Connection Issues

#### Hostname Resolution

**Symptoms:**

- "Unable to connect to database" errors
- Auth service fails to start
- Failed migrations

**Solutions:**

1. Verify hostnames in Docker Compose:

```yaml
services:
  auth:
    environment:
      GOTRUE_DB_HOST: terrarium-test-db
      DATABASE_URL: postgres://postgres:postgres@terrarium-test-db:5432/postgres
```

2. Check network configuration:

```yaml
networks:
  test-network:
    driver: bridge
```

#### RLS Policy Conflicts

**Symptoms:**

- "Permission denied" errors
- Unable to access data after authentication
- Inconsistent data access

**Solutions:**

1. Review RLS policies:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);
```

2. Verify service role permissions:

```sql
CREATE POLICY "Service role can manage all profiles"
    ON public.profiles FOR ALL
    USING (auth.role() = 'service_role');
```

### 3. Auth Service Issues

#### Service Role Creation

**Symptoms:**

- Unable to create service role users
- Admin operations failing
- "Insufficient permissions" errors

**Solutions:**

1. Verify service role key:

```bash
# .env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. Check service role configuration:

```yaml
services:
  auth:
    environment:
      GOTRUE_JWT_ADMIN_ROLES: service_role
```

#### Email Verification

**Symptoms:**

- Verification emails not sent
- Users stuck in unverified state
- Email provider errors

**Solutions:**

1. Check email provider configuration:

```yaml
services:
  auth:
    environment:
      GOTRUE_SMTP_HOST: smtp.example.com
      GOTRUE_SMTP_PORT: 587
```

2. Verify email templates:

```sql
-- Check email template configuration
SELECT * FROM auth.email_templates;
```

## Debugging Steps

### 1. Check Service Health

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs -f auth
docker-compose logs -f db
```

### 2. Verify Database Connection

```bash
# Connect to database
docker-compose exec db psql -U postgres

# Check auth schema
\dt auth.*
```

### 3. Test Authentication Flow

```bash
# Test auth endpoint
curl -v http://localhost:9999/health

# Check Kong routes
curl -v http://localhost:8000/auth/v1/health
```

## Prevention & Best Practices

1. **Regular Health Checks**

   - Implement service health monitoring
   - Set up alerts for authentication failures
   - Monitor token refresh rates

2. **Logging & Monitoring**

   - Enable detailed logging for auth service
   - Monitor failed authentication attempts
   - Track session statistics

3. **Backup & Recovery**
   - Regular database backups
   - Document recovery procedures
   - Test restoration process

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Kong JWT Plugin Documentation](https://docs.konghq.com/hub/kong-inc/jwt/)
- [GoTrue Documentation](https://github.com/supabase/gotrue)

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/your-org/terrarium/issues)
2. Review the [Supabase Forum](https://github.com/supabase/supabase/discussions)
3. Contact the development team
