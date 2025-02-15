import { test as base, expect, type Page } from '@playwright/test';
import { clearAuthState } from './setup';

const APP_URL = process.env.VITE_APP_URL || 'http://localhost:3000';

// Test data
const TEST_USER = {
  email: `test${Date.now()}@example.com`,
  password: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User',
  companyName: 'Test Company',
  communityName: 'Test Community',
};

// Custom test fixture with helpers
type TestFixtures = {
  registrationPage: Page;
};

const test = base.extend<TestFixtures>({
  registrationPage: async ({ page }, use) => {
    // Set up debug listeners
    page.on('pageerror', (error) => console.error('Page error:', error));
    page.on('console', (msg) => console.log('Browser console:', msg.text()));
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/auth')) {
        console.log(`Auth response: ${response.status()} ${url}`);
      }
    });

    // Navigate to registration page
    await page.goto(`${APP_URL}/register?subdomain=platform`, {
      waitUntil: 'networkidle',
      timeout: 10000,
    });

    await use(page);
  },
});

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await clearAuthState(page);
  });

  test('should show validation errors for empty form', async ({
    registrationPage: page,
  }) => {
    // Submit empty form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Check validation messages
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page.getByText('Community name is required')).toBeVisible();
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Last name is required')).toBeVisible();
    await expect(page.getByText('Company name is required')).toBeVisible();
  });

  test('should validate password requirements', async ({
    registrationPage: page,
  }) => {
    // Fill only password with weak value
    await page.getByLabel('Password').fill('weak');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Check password validation message
    await expect(
      page.getByText('Password must be at least 8 characters')
    ).toBeVisible();
  });

  test('should validate email format', async ({ registrationPage: page }) => {
    // Fill invalid email
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Check email validation message
    await expect(page.getByText('Invalid email address')).toBeVisible();
  });

  test('should show error for existing email', async ({
    registrationPage: page,
  }) => {
    // Fill form with existing email
    await page.getByLabel('Email').fill('existing@example.com');
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByLabel('Community Name').fill(TEST_USER.communityName);
    await page.getByLabel('First Name').fill(TEST_USER.firstName);
    await page.getByLabel('Last Name').fill(TEST_USER.lastName);
    await page.getByLabel('Company Name').fill(TEST_USER.companyName);

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Check duplicate email error
    await expect(page.getByText('Email address is already in use')).toBeVisible(
      { timeout: 5000 }
    );
  });

  test('should register successfully with valid data', async ({
    registrationPage: page,
  }) => {
    // Fill registration form
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByTestId('password-input').fill(TEST_USER.password);
    await page.getByTestId('confirmPassword-input').fill(TEST_USER.password);
    await page.getByLabel('First Name').fill(TEST_USER.firstName);
    await page.getByLabel('Last Name').fill(TEST_USER.lastName);
    await page.getByLabel('Company Name').fill(TEST_USER.companyName);

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Wait for successful registration response
    const authResponse = await page.waitForResponse(
      (res) => res.url().includes('/auth/v1/signup'),
      { timeout: 10000 }
    );

    // Verify successful registration
    expect(authResponse.ok()).toBeTruthy();
    const data = await authResponse.json();
    expect(data.user).toBeTruthy();
    expect(data.user.email).toBe(TEST_USER.email);

    // Wait for redirect and verify logged in state
    await page.waitForURL(`${APP_URL}/onboarding?subdomain=platform`, {
      timeout: 10000,
    });

    // Verify we're on the onboarding page
    await expect(
      page.getByRole('heading', { name: 'Welcome to Terrarium' })
    ).toBeVisible();
  });

  test('should handle server errors gracefully', async ({
    registrationPage: page,
  }) => {
    // Force a server error by using a very long email
    const longEmail = 'a'.repeat(1000) + '@example.com';

    // Fill form with invalid data
    await page.getByLabel('Email').fill(longEmail);
    await page.getByTestId('password-input').fill(TEST_USER.password);
    await page.getByTestId('confirmPassword-input').fill(TEST_USER.password);
    await page.getByLabel('First Name').fill(TEST_USER.firstName);
    await page.getByLabel('Last Name').fill(TEST_USER.lastName);
    await page.getByLabel('Company Name').fill(TEST_USER.companyName);

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Check for error message
    await expect(
      page.getByText('An error occurred. Please try again.')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should allow navigation back to login', async ({
    registrationPage: page,
  }) => {
    // Click login link
    await page.getByRole('link', { name: 'Sign in' }).click();

    // Verify navigation to login page
    await expect(page).toHaveURL(
      new RegExp(`${APP_URL}/login?subdomain=platform`)
    );
  });
});
