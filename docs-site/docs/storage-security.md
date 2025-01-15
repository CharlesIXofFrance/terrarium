# Storage Security Implementation

## Current Working Version (With Community Isolation and Member Access)

```sql
-- Create storage bucket with size and type restrictions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'community-assets',
    'community-assets',
    false,
    5242880, -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy for community owners (full access)
CREATE POLICY "Community owners can manage their assets"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'community-assets'
        AND (
            -- Check both session role and profile role
            (
                (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'community_admin'
                OR EXISTS (
                    SELECT 1 FROM profiles p
                    WHERE p.id = auth.uid()
                    AND p.role = 'community_admin'
                )
            )
            -- Verify community ownership using split_part
            AND EXISTS (
                SELECT 1 FROM public.communities c
                WHERE c.owner_id = auth.uid()
                AND split_part(name, '/', 1) = c.slug
            )
        )
    );

-- Policy for community members (read-only)
CREATE POLICY "Community members can view assets"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'community-assets'
        AND (
            EXISTS (
                SELECT 1 FROM public.communities c
                JOIN public.community_members cm ON c.id = cm.community_id
                WHERE cm.profile_id = auth.uid()
                AND split_part(name, '/', 1) = c.slug
            )
        )
    );
```

## Migration and Setup

### Database Schema

The storage security implementation relies on the following schema:

```sql
-- Communities table with owner reference
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Community members table for access control
CREATE TABLE IF NOT EXISTS public.community_members (
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    role TEXT NOT NULL DEFAULT 'member',
    PRIMARY KEY (community_id, profile_id)
);
```

### Storage Path Structure

Assets are organized using the following path structure:

```
{community-slug}/{asset-type}/{filename}
```

Example:

```
test-community/logo/logo.png
test-community/banner/banner.jpg
```

### Security Features

1. **Access Control**

   - Community owners have full CRUD access to their community's assets
   - Community members have read-only access to their community's assets
   - Non-members have no access to assets
   - Access is controlled through database relationships

2. **File Restrictions**

   - Maximum file size: 5MB
   - Allowed file types: PNG, JPEG, GIF, SVG, WebP
   - Enforced through bucket configuration

3. **Path Security**
   - Assets are isolated by community using slugs
   - Prevents path traversal attacks
   - Uses `split_part` for reliable path parsing

## Prerequisites

### Environment Setup

1. **Required Environment Variables**

   ```bash
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=<anon-key>
   VITE_SUPABASE_SERVICE_ROLE=<service-role-key>
   ```

2. **Database Initialization**
   ```bash
   supabase init
   supabase start
   supabase db reset
   ```

### Schema Requirements

1. **Auth Schema**

   ```sql
   -- Verify auth schema exists
   SELECT schema_name
   FROM information_schema.schemata
   WHERE schema_name = 'auth';

   -- Verify auth.users table
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'auth';
   ```

2. **Service Role Setup**

   ```sql
   -- Create service role
   CREATE ROLE service_role NOINHERIT CREATEROLE;

   -- Grant schema permissions
   GRANT USAGE ON SCHEMA auth TO service_role;
   GRANT USAGE ON SCHEMA public TO service_role;
   GRANT USAGE ON SCHEMA storage TO service_role;

   -- Grant table permissions
   GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
   GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;
   GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO service_role;
   ```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Database Error Creating New User

- **Symptoms**:

  - Error: "Database error creating new user"
  - Status: 500
  - Code: "unexpected_failure"
  - Occurs during test setup when trying to create test users

- **Potential Causes**:

  1. Missing or incorrect auth schema initialization
  2. Incorrect permissions for the service role
  3. Missing required database extensions
  4. Incorrect environment variables configuration

- **Troubleshooting Steps Taken**:

  1. Created and updated auth schema migration (`20241223201500_init_auth.sql`)
     - Added all necessary auth tables (users, identities, etc.)
     - Added proper enum types for MFA
     - Set up correct table relationships and constraints
     - Granted appropriate permissions to service_role
  2. Verified environment variables in `.env.test`:

     - GOTRUE_JWT_SECRET
     - GOTRUE_JWT_EXP
     - GOTRUE_JWT_DEFAULT_GROUP_NAME
     - GOTRUE_DB_DRIVER
     - GOTRUE_API_HOST
     - GOTRUE_SITE_URL
     - GOTRUE_MAILER_AUTOCONFIRM
     - GOTRUE_SMS_AUTOCONFIRM

  3. Database reset and initialization:
     - Ran `supabase db reset` to apply migrations
     - Verified successful migration application
     - Checked for any SQL syntax errors in migrations

- **Current Status**:

  - Issue persists despite schema initialization
  - Further investigation needed into GoTrue service logs
  - Potential need to verify auth service configuration

- **Next Steps**:
  1. Check GoTrue service logs for detailed error messages
  2. Verify auth service is properly initialized
  3. Compare schema with official Supabase auth schema
  4. Test basic auth functionality outside of storage tests

### Common Issues and Troubleshooting

#### User Creation Errors

If you encounter a `USER_CREATE_ERROR` with the message "Database error creating new user", check the following:

1. **Database Schema**

   - Ensure the `auth` schema exists and is properly initialized
   - Verify all required extensions are enabled:
     ```sql
     CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
     CREATE EXTENSION IF NOT EXISTS "citext";
     CREATE EXTENSION IF NOT EXISTS "pgcrypto";
     ```

2. **Table Permissions**

   - Confirm proper permissions are granted to the service role:
     ```sql
     GRANT USAGE ON SCHEMA auth TO service_role;
     GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
     GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;
     GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO service_role;
     ```

3. **Environment Variables**

   - Check that all required environment variables are set in `.env.test`:
     ```bash
     GOTRUE_JWT_SECRET=your-jwt-secret
     GOTRUE_JWT_EXP=3600
     GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated
     GOTRUE_DB_DRIVER=postgres
     GOTRUE_API_HOST=localhost
     GOTRUE_SITE_URL=http://localhost:3000
     GOTRUE_MAILER_AUTOCONFIRM=true
     GOTRUE_SMS_AUTOCONFIRM=true
     ```

4. **Database Connection**

   - Verify the database connection is working:

     ```sql
     -- Check if auth schema exists
     SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth';

     -- Check if users table exists
     SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'auth' AND table_name = 'users';
     ```

5. **Reset Steps**
   If issues persist:
   1. Drop and recreate the auth schema
   2. Re-run migrations
   3. Restart the Supabase services
   4. Clear any cached sessions

## Known Issues and Solutions

### 1. User Creation Error in Tests

When running storage security tests, you might encounter the following error:

```
TestError: Failed to create owner user
AuthApiError: Database error creating new user
```

#### Potential Causes and Solutions

1. **Missing Database Extensions**

   ```sql
   -- Verify required extensions are installed
   SELECT * FROM pg_extension;

   -- Install if missing
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

2. **Auth Schema Configuration**

   - The auth schema must be properly initialized with all required tables
   - The service role must have proper permissions
   - Tables must have correct constraints and relationships

3. **GoTrue Configuration**
   Required environment variables for proper GoTrue operation:

   ```bash
   # Database Connection
   GOTRUE_DB_DRIVER=postgres
   GOTRUE_DB_HOST=localhost
   GOTRUE_DB_PORT=54322
   GOTRUE_DB_NAME=postgres
   GOTRUE_DB_USER=postgres
   GOTRUE_DB_PASSWORD=postgres

   # JWT Configuration
   JWT_SECRET=<your-jwt-secret>
   GOTRUE_JWT_SECRET=<same-as-jwt-secret>
   GOTRUE_JWT_EXP=3600
   GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated

   # API Configuration
   GOTRUE_API_HOST=localhost
   GOTRUE_SITE_URL=http://localhost:3000
   GOTRUE_MAILER_AUTOCONFIRM=true
   GOTRUE_SMS_AUTOCONFIRM=true
   ```

4. **Service Role Permissions**
   Ensure the service role has all necessary permissions:

   ```sql
   -- Grant schema usage
   GRANT USAGE ON SCHEMA auth TO service_role;

   -- Grant table permissions
   GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;

   -- Grant sequence permissions
   GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;

   -- Grant function permissions
   GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO service_role;
   ```

5. **Profile Table Configuration**
   - Ensure the `profiles` table exists and has correct foreign key relationships
   - Verify the trigger function for new user creation is properly set up

#### Troubleshooting Steps

1. **Verify Database Setup**

   ```sql
   -- Check auth schema exists
   SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth';

   -- Check required tables exist
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth';

   -- Check service role permissions
   SELECT grantee, privilege_type
   FROM information_schema.role_table_grants
   WHERE table_schema = 'auth';
   ```

2. **Check GoTrue Service**

   - Restart the Supabase stack to ensure new configurations are applied
   - Verify GoTrue service is running and healthy
   - Check GoTrue logs for detailed error messages

3. **Test Database Connection**

   ```sql
   -- Test connection as service_role
   SET ROLE service_role;
   SELECT current_user, current_database();

   -- Test auth schema access
   SELECT COUNT(*) FROM auth.users;
   ```

4. **Reset and Reinitialize**

   ```bash
   # Stop Supabase
   supabase stop

   # Start fresh
   supabase start

   # Reset database
   supabase db reset
   ```

### References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [GoTrue Documentation](https://github.com/supabase/gotrue)
- [Database Setup Guide](https://supabase.com/docs/guides/database)

## Best Practices

1. **Error Handling**

   ```typescript
   try {
     const { data, error } = await adminClient.auth.admin.createUser({
       email,
       password,
       email_confirm: true,
       user_metadata: {
         full_name: name,
         role: 'member',
       },
     });

     if (error) {
       console.error('Create user error:', error);
       // Log detailed error information
       console.error('Error code:', error.code);
       console.error('Error message:', error.message);
       console.error('Error status:', error.status);
     }
   } catch (e) {
     console.error('Unexpected error:', e);
   }
   ```

2. **Testing Setup**

   ```typescript
   // Before running tests
   beforeAll(async () => {
     // Reset database
     await execSync('supabase db reset');

     // Verify environment
     const { data, error } = await adminClient.auth.getUser();
     if (error) {
       throw new Error('Auth setup failed');
     }
   });
   ```

3. **Cleanup**
   ```typescript
   // After tests
   afterAll(async () => {
     // Clean up test users
     for (const userId of createdUsers) {
       await adminClient.auth.admin.deleteUser(userId);
     }

     // Clean up storage
     await adminClient.storage.from('community-assets').remove(['test/*']);
   });
   ```

## Monitoring

### Audit Logs

```sql
-- Monitor auth operations
SELECT * FROM auth.audit_log_entries
ORDER BY created_at DESC
LIMIT 10;

-- Monitor storage operations
SELECT * FROM storage.objects
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Error Tracking

```sql
-- Check for failed operations
SELECT * FROM pg_stat_activity
WHERE state = 'active'
  AND query LIKE '%error%'
ORDER BY query_start DESC;

-- Monitor trigger errors
SELECT * FROM pg_stat_user_functions
WHERE funcname = 'handle_new_user';
```

## Testing Infrastructure

### Test Setup

1. Create test users with different roles:

   - Community owner (community_admin role)
   - Community member (member role)
   - Non-member (member role)

2. Create test community:

   - Owned by the owner user
   - Member user added as member
   - Non-member user not added

3. Test Cases:
   - Owner can upload valid image files
   - Owner cannot upload non-image files
   - Owner cannot exceed file size limit
   - Member can view community images
   - Member cannot upload/delete images
   - Non-member cannot access images

### Test Cleanup

1. Delete test files from storage
2. Delete test community and memberships
3. Delete test user profiles and auth accounts

## Next Steps

1. **Enhanced Security**

   - Add virus scanning for uploads
   - Implement file content validation
   - Add upload rate limiting

2. **Monitoring**

   - Add audit logging for file operations
   - Track storage usage per community
   - Monitor access patterns

3. **Test Improvements**
   - Add concurrent access tests
   - Test edge cases with special characters
   - Add performance benchmarks

## Storage Security Documentation

### Overview

This document outlines the storage security implementation for the Terrarium storage system, focusing on access control, permissions, and testing infrastructure.

### Storage Bucket Configuration

The `community-assets` bucket is configured with the following settings:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'community-assets',
    'community-assets',
    false, -- Private bucket
    5242880, -- 5MB limit
    ARRAY[
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/svg+xml',
        'image/webp'
    ]
);
```

### Storage Policies

#### 1. Community Owner Access

```sql
CREATE POLICY "Community owners can manage their assets"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'community-assets'
        AND (
            -- Check both session role and profile role
            (
                (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'community_admin'
                OR EXISTS (
                    SELECT 1 FROM profiles p
                    WHERE p.id = auth.uid()
                    AND p.role = 'community_admin'
                )
            )
            -- Verify community ownership using split_part
            AND EXISTS (
                SELECT 1 FROM public.communities c
                WHERE c.owner_id = auth.uid()
                AND split_part(name, '/', 1) = c.slug
            )
        )
    );

-- Policy for community members (read-only)
CREATE POLICY "Community members can view assets"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'community-assets'
        AND (
            EXISTS (
                SELECT 1 FROM public.communities c
                JOIN public.community_members cm ON c.id = cm.community_id
                WHERE cm.profile_id = auth.uid()
                AND split_part(name, '/', 1) = c.slug
            )
        )
    );
```

### Path Structure

Storage paths follow this format:

```
community-assets/{community-slug}/{asset-type}/{filename}
```

Example:

```
community-assets/my-community/avatars/user123.jpg
community-assets/my-community/banners/header.png
```

### Security Features

1. **Private Bucket**: The bucket is private by default (`public: false`)
2. **File Size Limits**: Maximum file size is 5MB
3. **MIME Type Restrictions**: Only allows specific image formats
4. **Path-based Access**: Uses community slugs for path-based authorization
5. **Role-based Permissions**: Different access levels for owners and members

### Testing Infrastructure

#### 1. Role Setup

```sql
-- Required database roles
CREATE ROLE anon NOINHERIT;
CREATE ROLE authenticated NOINHERIT;
CREATE ROLE authenticator NOINHERIT;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO authenticated;
```

#### 2. User Management

```typescript
interface UserMetadata {
  full_name: string;
  role: 'community_admin' | 'member';
}

// Create test users with proper metadata
const { data: user } = await adminClient.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    full_name: `Test ${role}`,
    role: role === 'owner' ? 'community_admin' : 'member',
  },
});
```

#### 3. Profile Trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_role_val user_role;
    metadata jsonb;
BEGIN
    metadata := COALESCE(new.raw_user_meta_data, '{}'::jsonb);
    user_role_val := CASE metadata->>'role'
        WHEN 'community_admin' THEN 'community_admin'::user_role
        WHEN 'member' THEN 'member'::user_role
        ELSE 'member'::user_role
    END;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        COALESCE(new.email, 'unknown'),
        COALESCE(metadata->>'full_name', new.email),
        user_role_val
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Security Best Practices

1. **Least Privilege Access**: Users only have access to their community's assets
2. **Content Validation**: Strict MIME type checking
3. **Size Restrictions**: Prevent large file uploads
4. **Path Validation**: Structured paths with community slugs
5. **Error Handling**: Proper error logging and graceful failure

### Monitoring and Logging

1. **Access Logs**: Track storage access patterns
2. **Error Logs**: Monitor failed access attempts
3. **Usage Metrics**: Track storage usage per community

### Next Steps

1. **Rate Limiting**: Implement upload rate limits
2. **Virus Scanning**: Add malware detection
3. **Backup System**: Implement automated backups
4. **Audit Logging**: Enhanced access tracking
