import { createClient } from '@supabase/supabase-js';
import { Page } from '@playwright/test';
import { UserRole } from '@/lib/utils/types';
import jwt from 'jsonwebtoken';

// Test configuration
export const TEST_BASE_URL =
  process.env.TEST_BASE_URL || 'http://localhost:3000';
export const TEST_USER_EMAIL =
  process.env.TEST_USER_EMAIL || 'test.user@example.com';
export const TEST_USER_PASSWORD =
  process.env.TEST_USER_PASSWORD || 'TestPass123!';
export const TEST_PLATFORM_DOMAIN =
  process.env.TEST_PLATFORM_DOMAIN || 'http://platform.localhost:3000';

// Initialize Supabase admin client
const supabaseUrl = process.env.SUPABASE_URL || 'http://supabase:8000';
const authUrl = process.env.GOTRUE_URL || 'http://auth:9999';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const jwtSecret =
  process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-token-for-testing';
const operatorToken =
  process.env.GOTRUE_OPERATOR_TOKEN || 'super-secret-operator-token';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
  );
}

// Create a signed JWT token for service role
const serviceRoleToken = jwt.sign(
  {
    role: 'service_role',
    iss: 'supabase',
    sub: 'service_role@supabase.io',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    aud: 'authenticated',
    email: 'service_role@supabase.io',
    app_metadata: {
      provider: 'email',
      providers: ['email'],
      role: 'service_role',
    },
    user_metadata: {
      role: 'service_role',
    },
    session_id: 'service-role-session',
    amr: [
      {
        method: 'password',
        timestamp: Math.floor(Date.now() / 1000),
      },
    ],
  },
  jwtSecret,
  {
    algorithm: 'HS256',
    header: {
      typ: 'JWT',
      alg: 'HS256',
    },
  }
);

// Create service role user if it doesn't exist
async function ensureServiceRoleUser() {
  try {
    // First try to create the service role user using the operator token
    const response = await fetch(`${authUrl}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${operatorToken}`,
      },
      body: JSON.stringify({
        email: 'service_role@supabase.io',
        password: 'super-secret-service-role-password',
        email_confirm: true,
        user_metadata: {
          role: 'service_role',
        },
        app_metadata: {
          role: 'service_role',
          provider: 'email',
          providers: ['email'],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      if (!error.includes('user already exists')) {
        console.error('Failed to create service role user:', error);
      }
    }
  } catch (error) {
    console.error('Error creating service role user:', error);
  }
}

// Ensure service role user exists before setting up the admin client
await ensureServiceRoleUser();

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Set the auth token for the admin client
await supabaseAdmin.auth.setSession({
  access_token: serviceRoleToken,
  refresh_token: '',
});

/**
 * Helper to verify Supabase connection
 */
export async function verifySupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.auth.getSession();
    if (error) {
      console.error('Failed to verify Supabase connection:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to verify Supabase connection:', error);
    return false;
  }
}

/**
 * Helper to create a test user
 */
export async function createTestUser(email: string, password: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }
}

/**
 * Helper to delete test users
 */
export async function deleteTestUsers() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    const testUsers = data.users.filter((user) =>
      user.email?.includes('test@')
    );

    for (const user of testUsers) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    }
  } catch (error) {
    console.error('Failed to delete test users:', error);
    throw error;
  }
}

/**
 * Helper to clear auth state in the browser
 */
export async function clearAuthState(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('sb-auth-token');
  });
}

/**
 * Helper to clean up test environment
 */
export async function cleanupTestEnvironment(page: Page) {
  try {
    await clearAuthState(page);
    await deleteTestUsers();
  } catch (error) {
    console.error('Test environment cleanup failed:', error);
    throw error;
  }
}

/**
 * Signs in a test user
 */
export async function signInTestUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

interface CreateTestUserParams {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  metadata?: Record<string, unknown>;
}

// Create test user using direct API call
export async function createTestUserUsingParams({
  email,
  password,
  role,
  firstName,
  lastName,
  metadata = {},
}: CreateTestUserParams) {
  try {
    // First try to delete any existing user with this email
    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    const existingUser = existingUsers.users.find((u) => u.email === email);
    if (existingUser) {
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
      // Wait for deletion to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Create new user
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role,
          firstName,
          lastName,
          onboardingComplete: false,
          emailVerified: true,
          ...metadata,
        },
        app_metadata: {
          role,
          provider: 'email',
        },
      });

    if (createError || !userData) {
      throw createError || new Error('Failed to create user');
    }

    // Wait for user creation to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create or update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        onboarding_complete: false,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      throw profileError;
    }

    return userData.user;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

// Enhanced deleteTestUsers with retries
export async function deleteTestUsersWithRetries(
  maxRetries = 3,
  retryDelay = 1000
): Promise<void> {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      // List users using direct API call
      const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'GET',
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${serviceRoleToken}`,
        },
      });

      if (!response.ok) {
        console.error(
          `Failed to list users (attempt ${attempts + 1}):`,
          await response.text()
        );
        attempts++;
        if (attempts < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new Error('Failed to list users');
      }

      const users = await response.json();
      const testUsers = users.users.filter((user: { email?: string }) =>
        user.email?.includes('@example.com')
      );

      // Delete each test user
      for (const user of testUsers) {
        const deleteResponse = await fetch(
          `${supabaseUrl}/auth/v1/admin/users/${user.id}`,
          {
            method: 'DELETE',
            headers: {
              apikey: supabaseServiceKey,
              Authorization: `Bearer ${serviceRoleToken}`,
            },
          }
        );

        if (!deleteResponse.ok) {
          console.error(
            `Failed to delete user ${user.id}:`,
            await deleteResponse.text()
          );
        }
      }

      console.log(`Successfully deleted ${testUsers.length} test users`);
      return;
    } catch (error) {
      console.error(
        `Error deleting test users (attempt ${attempts + 1}):`,
        error
      );
      attempts++;
      if (attempts < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }
      throw error;
    }
  }
}

export async function clearInbucketEmails(): Promise<void> {
  try {
    await fetch('http://localhost:9000/api/v1/mailbox', {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to clear Inbucket emails:', error);
  }
}

export { UserRole };
