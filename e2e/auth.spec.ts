/**
 * Authentication E2E tests using Supabase's built-in features
 * Matches current implementation's auth flows and security features
 */

import { expect, type Page } from '@playwright/test';
import {
  test as base,
  adminClient,
  TEST_COMMUNITY,
  OWNER_EMAIL,
  MEMBER_EMAIL,
  PASSWORD,
  getMagicLink,
} from './test-setup';
import { createClient } from '@supabase/supabase-js';
import {
  createTestUser,
  deleteTestUsers,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
  TEST_PLATFORM_DOMAIN,
} from './utils/test-helpers';

// Test fixtures for multi-tenant auth (matching current setup)
type TestFixtures = {
  platformPage: Page;
  communityPage: Page;
};

const test = base.extend<TestFixtures>({
  platformPage: async ({ page }, use) => {
    // Add platform subdomain parameter (matching current routing)
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      url.search = url.search
        ? `${url.search}&subdomain=platform`
        : '?subdomain=platform';
      route.continue({ url: url.toString() });
    });
    await use(page);
  },

  communityPage: async ({ page }, use) => {
    // Add community subdomain parameter (matching current routing)
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      url.search = url.search
        ? `${url.search}&subdomain=${TEST_COMMUNITY}`
        : `?subdomain=${TEST_COMMUNITY}`;
      route.continue({ url: url.toString() });
    });
    await use(page);
  },
});

// Helper to clear auth state (matching current implementation)
async function clearAuthState(page: Page) {
  // Clear browser context state
  await page.context().clearPermissions();
  await page.context().clearCookies();

  // Navigate to about:blank to ensure we're in a clean context
  await page.goto('about:blank');

  // Clear storage in a safe way
  await page
    .evaluate(() => {
      try {
        window.localStorage?.clear();
        window.sessionStorage?.clear();
      } catch (e) {
        // Ignore storage access errors
        console.log('Storage clear skipped - this is normal in some contexts');
      }
    })
    .catch(() => {
      // Ignore any evaluation errors
      console.log(
        'Storage evaluation skipped - this is normal in some contexts'
      );
    });
}

test.describe('Authentication Flows', () => {
  test.beforeAll(async () => {
    await deleteTestUsers();
  });

  test.describe('Platform Login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${TEST_PLATFORM_DOMAIN}/login`);
    });

    test('should validate form fields', async ({ page }) => {
      await page.getByTestId('submit-button').click();

      await expect(page.getByText('Please enter a valid email')).toBeVisible();
      await expect(
        page.getByText('Password must be at least 8 characters')
      ).toBeVisible();
    });

    test('should handle invalid credentials', async ({ page }) => {
      await page.getByTestId('email-input').fill('wrong@example.com');
      await page.getByTestId('password-input').fill('wrongpass');
      await page.getByTestId('submit-button').click();

      await expect(page.getByTestId('error-message')).toBeVisible();
      await expect(page.getByText('Invalid login credentials')).toBeVisible();
    });

    test('should successfully log in', async ({ page }) => {
      await createTestUser({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        role: 'owner',
        firstName: 'Test',
        lastName: 'Owner',
      });

      await page.getByTestId('email-input').fill(TEST_USER_EMAIL);
      await page.getByTestId('password-input').fill(TEST_USER_PASSWORD);
      await page.getByTestId('submit-button').click();

      await expect(page).toHaveURL('/platform/dashboard');
    });
  });

  test.describe('Platform Registration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${TEST_PLATFORM_DOMAIN}/register`);
    });

    test('should validate form fields', async ({ page }) => {
      await page.getByTestId('submit-button').click();

      await expect(
        page.getByText('First name must be at least 2 characters')
      ).toBeVisible();
      await expect(
        page.getByText('Last name must be at least 2 characters')
      ).toBeVisible();
      await expect(page.getByText('Please enter a valid email')).toBeVisible();
      await expect(
        page.getByText('Password must be at least 8 characters')
      ).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      await page.getByTestId('firstName-input').fill('Test');
      await page.getByTestId('lastName-input').fill('User');
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('weak');
      await page.getByTestId('confirmPassword-input').fill('weak');
      await page.getByTestId('submit-button').click();

      await expect(
        page.getByText('Password must contain at least one uppercase letter')
      ).toBeVisible();
      await expect(
        page.getByText('Password must contain at least one number')
      ).toBeVisible();
      await expect(
        page.getByText('Password must contain at least one special character')
      ).toBeVisible();
    });

    test('should successfully register', async ({ page }) => {
      await page.getByTestId('firstName-input').fill('New');
      await page.getByTestId('lastName-input').fill('User');
      await page.getByTestId('email-input').fill('new.user@example.com');
      await page.getByTestId('password-input').fill('StrongPass123!');
      await page.getByTestId('confirmPassword-input').fill('StrongPass123!');
      await page.getByTestId('submit-button').click();

      await expect(page.getByTestId('verification-sent')).toBeVisible();
      await expect(
        page.getByText('Please check your email to verify your account')
      ).toBeVisible();
    });
  });
});

test.describe('Platform Authentication (Password-based)', () => {
  test.beforeAll(async () => {
    console.log('Setting up test environment...');
    // Delete existing users to start fresh
    await deleteTestUsers();
  });

  test.beforeEach(async ({ platformPage }) => {
    console.log('Starting platform authentication test');

    // Force clear any existing sessions
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();

    // Clear browser state
    await clearAuthState(platformPage);

    // Add debug logging for DOM state
    platformPage.on('console', (msg) => {
      console.log(`Browser console ${msg.type()}: ${msg.text()}`);
    });

    console.log('Navigating to login page...');
    const response = await platformPage.goto('/login?fresh=true', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log(`Login page response status: ${response?.status()}`);
    if (!response?.ok()) {
      console.error('Failed to load login page:', response?.statusText());
    }

    // Verify we're actually on the login page
    const loginForm = await platformPage.$('form');
    if (!loginForm) {
      console.error('Login form not found!');
      console.log('Current URL:', await platformPage.url());
      console.log('Page HTML:', await platformPage.content());
      throw new Error('Login form not found');
    }
  });

  test('should sign in platform owner with password and PKCE', async ({
    platformPage: page,
  }) => {
    // Create a fresh owner user for this test
    console.log('Creating test owner user...');
    await createTestUser(OWNER_EMAIL, PASSWORD, 'owner', {
      firstName: 'Test',
      lastName: 'Owner',
      onboardingComplete: true,
    });

    // Fill login form
    console.log('Filling login form...');
    await page.getByLabel('Email').fill(OWNER_EMAIL);
    await page.getByLabel('Password').fill(PASSWORD);

    console.log('Clicking sign in button...');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for Supabase PKCE auth flow
    console.log('Waiting for PKCE auth flow...');
    const pkceResponse = await page.waitForResponse(
      (res) => res.url().includes('/auth/v1/token') && res.status() === 200
    );
    const pkceData = await pkceResponse.json();
    expect(pkceData.session?.access_token).toBeTruthy();
    console.log('PKCE auth flow completed successfully');

    // Verify redirect and welcome message
    await expect(page).toHaveURL('/platform/dashboard');
    await expect(page.getByText(/welcome back/i)).toBeVisible();

    // Verify session and role using Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
    const {
      data: { session },
    } = await supabase.auth.getSession();
    expect(session?.user.email).toBe(OWNER_EMAIL);
    expect(session?.user.user_metadata.role).toBe('owner');

    // Verify audit log
    const { data: auditLogs } = await adminClient
      .from('auth.audit_log_entries')
      .select('*')
      .eq('actor_email', OWNER_EMAIL)
      .order('created_at', { ascending: false })
      .limit(1);
    expect(auditLogs?.[0]?.action).toBe('login');
  });

  test('should handle invalid credentials with rate limiting', async ({
    platformPage: page,
  }) => {
    // Try multiple invalid logins to trigger rate limiting
    for (let i = 0; i < 5; i++) {
      await page.getByLabel('Email').fill(OWNER_EMAIL);
      await page.getByLabel('Password').fill('wrong' + i);
      await page.getByRole('button', { name: /sign in/i }).click();

      const response = await page.waitForResponse((res) =>
        res.url().includes('/auth/v1/token')
      );

      if (i < 4) {
        expect(response.status()).toBe(400);
        await expect(page.getByText(/invalid credentials/i)).toBeVisible();
      } else {
        expect(response.status()).toBe(429);
        await expect(page.getByText(/too many requests/i)).toBeVisible();
      }
    }

    // Verify rate limit in audit logs
    const { data: auditLogs } = await adminClient
      .from('auth.audit_log_entries')
      .select('*')
      .eq('actor_email', OWNER_EMAIL)
      .order('created_at', { ascending: false })
      .limit(5);
    expect(auditLogs?.length).toBe(5);
    expect(auditLogs?.every((log) => log.action === 'login_failed')).toBe(true);
  });
});

test.describe('Community Authentication (Passwordless)', () => {
  test.beforeEach(async ({ communityPage }) => {
    await clearAuthState(communityPage);
    await communityPage.goto(`/c/${TEST_COMMUNITY}/login`);
  });

  test('should handle passwordless sign in with magic link and Inbucket', async ({
    communityPage: page,
  }) => {
    // Verify custom branding
    await expect(
      page.getByRole('heading', { name: `Welcome to ${'Test Community'}` })
    ).toBeVisible();

    // Start passwordless flow
    await page.getByLabel('Email').fill(MEMBER_EMAIL);
    await page.getByRole('button', { name: /send magic link/i }).click();

    // Verify confirmation message
    await expect(page.getByText(/check your email/i)).toBeVisible();

    // Get magic link from Inbucket
    const magicLink = await getMagicLink(MEMBER_EMAIL);
    expect(magicLink).toBeTruthy();

    // Visit magic link
    await page.goto(magicLink!);

    // Wait for Supabase auth callback
    const callbackResponse = await page.waitForResponse(
      (res) => res.url().includes('/auth/v1/callback') && res.status() === 200
    );
    const callbackData = await callbackResponse.json();
    expect(callbackData.session?.access_token).toBeTruthy();

    // Verify redirect to dashboard
    await expect(page).toHaveURL(`/c/${TEST_COMMUNITY}/dashboard`);

    // Verify session and role
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
    const {
      data: { session },
    } = await supabase.auth.getSession();
    expect(session?.user.email).toBe(MEMBER_EMAIL);
    expect(session?.user.user_metadata.role).toBe('member');

    // Verify audit log
    const { data: auditLogs } = await adminClient
      .from('auth.audit_log_entries')
      .select('*')
      .eq('actor_email', MEMBER_EMAIL)
      .order('created_at', { ascending: false })
      .limit(1);
    expect(auditLogs?.[0]?.action).toBe('magiclink');
  });

  test('should handle session refresh and token rotation', async ({
    communityPage: page,
  }) => {
    // Sign in first
    await page.getByLabel('Email').fill(MEMBER_EMAIL);
    await page.getByRole('button', { name: /send magic link/i }).click();

    // Get and use magic link
    const magicLink = await getMagicLink(MEMBER_EMAIL);
    await page.goto(magicLink!);

    // Wait for initial session
    await page.waitForResponse(
      (res) => res.url().includes('/auth/v1/callback') && res.status() === 200
    );

    // Get initial session
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
    const {
      data: { session: initialSession },
    } = await supabase.auth.getSession();

    // Wait a bit and refresh session
    await page.waitForTimeout(1000);
    await supabase.auth.refreshSession();

    // Get new session
    const {
      data: { session: newSession },
    } = await supabase.auth.getSession();

    // Verify token rotation
    expect(newSession?.access_token).not.toBe(initialSession?.access_token);
    expect(newSession?.refresh_token).not.toBe(initialSession?.refresh_token);
  });
});

test.describe('Security Features', () => {
  test('should enforce proper CORS and security headers', async ({
    request,
  }) => {
    // Try auth request with invalid origin
    const response = await request.post(
      `${process.env.VITE_SUPABASE_URL}/auth/v1/token`,
      {
        headers: {
          Origin: 'https://evil.com',
          'Content-Type': 'application/json',
        },
        data: {
          email: MEMBER_EMAIL,
          password: 'test123',
        },
      }
    );

    // Verify CORS blocks the request
    expect(response.status()).toBe(400);

    // Verify security headers
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['x-xss-protection']).toBe('1; mode=block');
    expect(response.headers()['strict-transport-security']).toBeTruthy();
  });

  test('should handle concurrent sessions correctly', async ({ context }) => {
    // Create two pages (simulating different tabs/windows)
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Sign in on first page
    await page1.goto('/login');
    await page1.getByLabel('Email').fill(MEMBER_EMAIL);
    await page1.getByRole('button', { name: /send magic link/i }).click();

    // Get and use magic link
    const magicLink = await getMagicLink(MEMBER_EMAIL);
    await page1.goto(magicLink!);

    // Wait for session on first page
    await page1.waitForResponse(
      (res) => res.url().includes('/auth/v1/callback') && res.status() === 200
    );

    // Verify session works on second page
    await page2.goto(`/c/${TEST_COMMUNITY}/dashboard`);
    await expect(page2.getByText(/welcome back/i)).toBeVisible();

    // Sign out on first page
    await page1.getByRole('button', { name: /sign out/i }).click();

    // Verify second page session is also invalidated
    await page2.reload();
    await expect(page2).toHaveURL('/login');
  });
});
