# Storage Testing Guide

## Overview

This guide explains how to test storage security in the Terrarium platform, focusing on the test setup, execution, and common issues.

## Test Setup

### 1. Test Users

The test suite creates three types of users:

```typescript
interface TestUser {
  user: User;
  email: string;
  password: string;
  client: SupabaseClient;
}

interface TestContext {
  owner: TestUser | null;
  member: TestUser | null;
  nonMember: TestUser | null;
  communityId: string | null;
  communitySlug: string | null;
  createdUsers: string[];
}
```

Users are created with specific roles:

- **Owner**: Has `community_admin` role and owner membership
- **Member**: Has `member` role and member membership
- **Non-member**: Has `member` role but no community membership

### 2. Test Community

A test community is created with a unique slug:

```typescript
const uniqueSlug = `test-community-${Date.now()}`;
const { data: community } = await adminClient
  .from('communities')
  .insert({
    name: 'Test Community',
    owner_id: ctx.owner.user.id,
    slug: uniqueSlug,
  })
  .select()
  .single();
```

### 3. Community Memberships

Members are added to the community with appropriate roles:

```typescript
// Add owner
await adminClient.from('community_members').insert({
  community_id: ctx.communityId,
  profile_id: ctx.owner.user.id,
  role: 'owner',
});

// Add member
await adminClient.from('community_members').insert({
  community_id: ctx.communityId,
  profile_id: ctx.member.user.id,
  role: 'member',
});
```

## Test Cases

### 1. Owner Access Tests

Tests owner permissions for file operations:

```typescript
describe('Owner Access Tests', () => {
  it('should allow owner to upload valid image files', async () => {
    const validTypes = [
      { type: 'image/png', ext: 'png' },
      { type: 'image/jpeg', ext: 'jpg' },
      { type: 'image/gif', ext: 'gif' },
    ];

    for (const { type, ext } of validTypes) {
      const testFile = createTestFile({ type });
      const { error } = await ownerClient.storage
        .from('community-assets')
        .upload(`${ctx.communitySlug}/logo/test.${ext}`, testFile.content);

      expect(error).toBeNull();
    }
  });

  it('should not allow owner to upload non-image files', async () => {
    const invalidFile = createTestFile({
      type: 'application/pdf',
      name: 'test.pdf',
    });

    const { error } = await ownerClient.storage
      .from('community-assets')
      .upload(`${ctx.communitySlug}/logo/test.pdf`, invalidFile.content);

    expect(error).not.toBeNull();
  });
});
```

### 2. Member Access Tests

Tests member permissions:

```typescript
describe('Member Access Tests', () => {
  it('should allow member to view community images', async () => {
    const { error } = await memberClient.storage
      .from('community-assets')
      .list(`${ctx.communitySlug}/logo`);

    expect(error).toBeNull();
  });

  it('should not allow member to delete images', async () => {
    const { error } = await memberClient.storage
      .from('community-assets')
      .remove([`${ctx.communitySlug}/logo/test.png`]);

    expect(error).not.toBeNull();
  });
});
```

### 3. Non-Member Access Tests

Tests access restrictions:

```typescript
describe('Non-Member Access Tests', () => {
  it('should not allow non-member to access community images', async () => {
    const { error } = await nonMemberClient.storage
      .from('community-assets')
      .list(`${ctx.communitySlug}/logo`);

    expect(error).not.toBeNull();
  });
});
```

## Troubleshooting Guide

### Common Issues

1. **Session Role vs App Metadata Role**

   - Issue: Tests failing because policies check `auth.jwt() ->> 'role'` instead of app metadata
   - Solution: Update policies to check `(auth.jwt() ->> 'app_metadata')::jsonb ->> 'role'`
   - Example:

   ```sql
   -- Before
   auth.jwt() ->> 'role' = 'community_admin'

   -- After
   (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'community_admin'
   ```

2. **Missing Service Role Policies**

   - Issue: 403 errors when running tests because service role can't access storage
   - Solution: Add explicit policies for service role
   - Example:

   ```sql
   CREATE POLICY "Allow service role for buckets"
   ON storage.buckets
   FOR ALL
   TO service_role
   USING (true);
   ```

3. **Community Slug Validation**

   - Issue: Tests failing because policies don't validate folder paths
   - Solution: Add EXISTS check to verify folder matches community slug
   - Example:

   ```sql
   EXISTS (
     SELECT 1 FROM public.communities c
     WHERE (storage.foldername(name))[1] = c.slug
   )
   ```

4. **Policy Ordering**

   - Issue: Default deny policies overriding specific allow policies
   - Solution: Create policies in correct order:
     1. Service role bypass
     2. Specific allow policies
     3. Default deny

5. **Folder Path Validation**

   - Issue: Tests failing because policies use different folder path validation methods
   - Solution: Standardize on `split_part(name, '/', 1)` instead of `storage.foldername(name)`
   - Example:

   ```sql
   -- Before
   WHERE (storage.foldername(name))[1] = c.slug

   -- After
   WHERE split_part(name, '/', 1) = c.slug
   ```

   This change is necessary because:

   1. `storage.foldername(name)` is less reliable for path parsing
   2. `split_part` provides more consistent results across different file paths
   3. The function better handles edge cases in path formats

6. **Role-Based Access**

   - Issue: Tests failing due to role validation in policies
   - Solution: Check both session claims and profile roles
   - Example:

   ```sql
   -- Check both session role and profile role
   AND (
       (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'community_admin'
       OR EXISTS (
           SELECT 1 FROM profiles p
           WHERE p.id = auth.uid()
           AND p.role = 'community_admin'
       )
   )
   ```

   Key points:

   1. Community owners must have 'community_admin' role
   2. Role must be set in both JWT claims and profiles table
   3. Policies should check both sources for maximum reliability

### Current Storage Policies

Here are our current storage policies:

```sql
-- Bucket Policies
CREATE POLICY "Allow service role for buckets"
ON storage.buckets FOR ALL TO service_role
USING (true);

CREATE POLICY "Allow owner to manage community assets bucket"
ON storage.buckets FOR ALL
USING (
  name = 'community-assets' AND
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'community_admin'
);

CREATE POLICY "Allow members to view community assets bucket"
ON storage.buckets FOR SELECT
USING (
  name = 'community-assets' AND
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('community_admin', 'member')
);

-- Object Policies
CREATE POLICY "Allow service role for objects"
ON storage.objects FOR ALL TO service_role
USING (true);

CREATE POLICY "Allow owner to manage community assets"
ON storage.objects FOR ALL
USING (
  bucket_id = 'community-assets' AND
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'community_admin' AND
  EXISTS (
    SELECT 1 FROM public.communities c
    WHERE (storage.foldername(name))[1] = c.slug
  )
);

CREATE POLICY "Allow members to view community assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'community-assets' AND
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('community_admin', 'member') AND
  EXISTS (
    SELECT 1 FROM public.communities c
    WHERE (storage.foldername(name))[1] = c.slug
  )
);
```

### Running Tests

To run the storage tests:

1. Reset the database:

```bash
supabase db reset
```

2. Run the storage security tests:

```bash
npm test storage-security.test.ts -- --no-watch
```

3. Debug using Docker logs:

```bash
# View database logs (including policy evaluation)
docker logs supabase_db_terrarium

# View storage service logs
docker logs supabase_storage_terrarium

# View auth service logs
docker logs supabase_auth_terrarium
```

### Current Test Status

The tests are currently failing with the following issues:

1. Owner upload test failing with 403 error

   - Expected: Upload should succeed
   - Actual: Getting "new row violates row-level security policy" error
   - Root cause: Policy using incorrect column reference in SQL
   - Fix: Updated policy to use `storage.objects.name` instead of just `name`

2. Member delete test passing as expected

   - Expected: Delete should fail with 403
   - Actual: Delete failing with permission denied

3. Non-member access test passing as expected
   - Expected: List operation should fail with 403
   - Actual: List operation failing with permission denied

### Latest Storage Policies

Here are our current storage policies that enforce these permissions:

```sql
-- Create policy for community owners on objects
CREATE POLICY "Community owners can manage their assets"
    ON storage.objects FOR ALL
    TO authenticated
    USING (
        bucket_id = 'community-assets'
        AND (
            -- Allow service role full access
            (NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::text = 'service_role')
            OR
            -- Check community admin role and ownership
            (
                -- Check role from app_metadata
                (NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role', '')::text = 'community_admin')
                AND
                -- Check community ownership
                EXISTS (
                    SELECT 1 FROM public.communities c
                    WHERE c.owner_id = auth.uid()
                    AND split_part(storage.objects.name, '/', 1) = c.slug
                )
            )
        )
    );

-- Create policy for community members to view assets
CREATE POLICY "Community members can view assets"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'community-assets'
        AND (
            -- Allow service role full access
            (NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::text = 'service_role')
            OR
            -- Check if user is a member of the community
            EXISTS (
                SELECT 1 FROM public.community_members cm
                JOIN public.communities c ON c.id = cm.community_id
                WHERE cm.profile_id = auth.uid()
                AND split_part(storage.objects.name, '/', 1) = c.slug
            )
            OR
            -- Check if user is the community owner
            EXISTS (
                SELECT 1 FROM public.communities c
                WHERE c.owner_id = auth.uid()
                AND split_part(storage.objects.name, '/', 1) = c.slug
            )
        )
    );
```

### Debugging Tips

1. **Check Policy Evaluation**

   - Use Docker logs to see policy evaluation:

   ```bash
   docker logs supabase_db_terrarium 2>&1 | grep "policy"
   ```

   - Look for lines containing "SELECT" or "INSERT" with your policy names

2. **Verify JWT Claims**

   - Print session claims in tests:

   ```typescript
   const {
     data: { session },
   } = await client.auth.getSession();
   console.log('Session claims:', session?.user);
   ```

   - Check app_metadata contains correct role

3. **Debug Community Ownership**

   - Query community table directly:

   ```typescript
   const { data: community } = await adminClient
     .from('communities')
     .select('owner_id, slug')
     .eq('id', communityId)
     .single();
   console.log('Community:', community);
   ```

4. **Storage Service Logs**

   - Check storage service logs for request details:

   ```bash
   docker logs supabase_storage_terrarium 2>&1 | grep "error"
   ```

   - Look for specific error messages about policy violations

5. **Auth Service Logs**
   - Monitor JWT token issues:
   ```bash
   docker logs supabase_auth_terrarium 2>&1 | grep "error"
   ```
   - Check for token refresh or validation errors

## Common Test Issues

### 1. Authentication Issues

- **Problem**: Tests fail with 401 errors
- **Solution**:
  - Ensure test users are properly created
  - Check if auth tokens are refreshed
  - Verify sign-in process

```typescript
// Refresh session after sign-in
const { error: refreshError } = await client.auth.refreshSession();
if (refreshError) {
  throw new TestError('SESSION_REFRESH_ERROR', 'Failed to refresh session');
}
```

### 2. Role Assignment Issues

- **Problem**: Users don't have correct permissions
- **Solution**:
  - Verify role updates in both auth and profiles tables
  - Add delays after role updates
  - Check community membership entries

```typescript
// Wait for role updates to propagate
await wait(500);

// Update user role in profiles table
await adminClient
  .from('profiles')
  .update({ role: 'community_admin' })
  .eq('id', user.id);
```

### 3. File Operation Issues

- **Problem**: File operations fail unexpectedly
- **Solution**:
  - Check file paths match community slug
  - Verify file size and type restrictions
  - Ensure storage bucket exists and is configured

```typescript
// Create storage bucket with proper settings
await adminClient.storage.createBucket('community-assets', {
  public: false,
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif'],
  fileSizeLimit: '5MB',
});
```

## Test Cleanup

Always clean up test data:

```typescript
async function cleanupTestData() {
  // Delete test files
  await adminClient.storage
    .from('community-assets')
    .remove([`${ctx.communitySlug}/logo/test.png`]);

  // Delete test community
  await adminClient.from('communities').delete().eq('id', ctx.communityId);

  // Delete test users
  for (const userId of ctx.createdUsers) {
    await adminClient.auth.admin.deleteUser(userId);
  }
}
```

## Running Tests

Run storage security tests:

```bash
npm test storage-security.test.ts -- --no-watch
```
