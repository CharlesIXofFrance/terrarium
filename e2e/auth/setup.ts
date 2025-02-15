import { createClient } from '@supabase/supabase-js';
import { Page } from '@playwright/test';

export const TEST_EMAIL = 'test@example.com';
export const TEST_PASSWORD = 'password123';

/**
 * Clears cookies and storage.
 * Wrapped localStorage/sessionStorage clear calls in try/catch to avoid security errors.
 */
export async function clearAuthState(page: Page) {
  console.log('Clearing auth state...');
  try {
    await page.context().clearCookies();
    console.log('Cookies cleared successfully');

    await page.evaluate(() => {
      try {
        localStorage.clear();
        console.log('localStorage cleared successfully');
      } catch (err) {
        console.warn('Failed to clear localStorage:', err);
      }
      try {
        sessionStorage.clear();
        console.log('sessionStorage cleared successfully');
      } catch (err) {
        console.warn('Failed to clear sessionStorage:', err);
      }
    });

    // Wait a bit after clearing state to ensure it takes effect
    await page.waitForTimeout(1000);
    console.log('Auth state cleared successfully');
  } catch (error) {
    console.error('Failed to clear auth state:', error);
    throw error;
  }
}

let testUserCreated = false;

/**
 * Creates a test user via Supabase Admin API.
 * Now includes a user_metadata property to assign the 'owner' role required for community owners.
 */
export async function createTestUser() {
  if (testUserCreated) {
    console.log('Test user already exists, skipping creation...');
    return;
  }

  console.log('Starting test user creation process...');
  console.log('Creating test user...');

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // First try to delete any existing user
    console.log('Checking for existing test user...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userToDelete = existingUsers?.users.find(
      (u) => u.email === TEST_EMAIL
    );

    if (userToDelete) {
      console.log('Deleting existing test user...');
      await supabase.auth.admin.deleteUser(userToDelete.id);
      // Wait for deletion to complete
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Now create the new test user
    console.log('Creating fresh test user...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'owner' },
    });

    if (error) {
      console.error('Error creating test user:', error);
      throw error;
    }

    // Wait for user creation to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Test user created successfully');
    testUserCreated = true;
    return data.user;
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }
}

/**
 * Cleanup function to be called after tests
 */
export async function cleanup() {
  if (testUserCreated) {
    console.log('Cleaning up test user...');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userToDelete = existingUser?.users.find(
        (u) => u.email === TEST_EMAIL
      );
      if (userToDelete) {
        await supabase.auth.admin.deleteUser(userToDelete.id);
        console.log('Test user cleaned up successfully');
      }
    } catch (error) {
      console.error('Failed to cleanup test user:', error);
    }
    testUserCreated = false;
  }
}

export async function verifyDevServer() {
  console.log('Verifying dev server...');
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('http://localhost:3000');
      if (response.ok) {
        console.log('Dev server is running and responding');
        return true;
      }
      lastError = new Error(`Dev server returned status ${response.status}`);
    } catch (error) {
      lastError = error;
      console.log(
        `Attempt ${i + 1}/${maxRetries} failed, retrying in 2 seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.error('Dev server check failed after retries:', lastError);
  throw new Error(
    'Dev server is not running or not responding. Please start it with `npm run dev` first.'
  );
}
