/**
 * AI Context:
 * This file contains end-to-end tests for the community login feature using Playwright.
 * It tests the complete login flow including customization and error cases.
 */

import { test, expect } from '@playwright/test';

test.describe('Community Login Page', () => {
  const TEST_COMMUNITY = 'test-community';
  const OWNER_EMAIL = 'owner@example.com';
  const MEMBER_EMAIL = 'member@example.com';
  const PASSWORD = 'password123';

  test.beforeEach(async ({ page }) => {
    // Reset database to known state
    // This would typically be done through an API or direct database access
    await page.goto(`/api/test/reset-db`);
  });

  test('successful login with custom branding', async ({ page }) => {
    // Go to community login page
    await page.goto(`/c/${TEST_COMMUNITY}/login`);

    // Verify custom branding is applied
    await expect(page.getByRole('heading')).toHaveText('Welcome to Test Community');
    await expect(page.getByAltText('Community Logo')).toHaveAttribute('src', '/test-logo.png');
    
    // Custom colors should be applied
    const signInButton = page.getByRole('button', { name: 'Sign in' });
    await expect(signInButton).toHaveCSS('background-color', 'rgb(79, 70, 229)');

    // Login process
    await page.getByPlaceholderText('Email address').fill(MEMBER_EMAIL);
    await page.getByPlaceholderText('Password').fill(PASSWORD);
    await signInButton.click();

    // Should redirect to community dashboard
    await expect(page).toHaveURL(`/c/${TEST_COMMUNITY}/dashboard`);
  });

  test('login with non-existent community redirects to main login', async ({ page }) => {
    await page.goto('/c/non-existent/login');
    await expect(page).toHaveURL('/login');
  });

  test('shows validation errors', async ({ page }) => {
    await page.goto(`/c/${TEST_COMMUNITY}/login`);

    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Should show validation errors
    await expect(page.getByText('Invalid email address')).toBeVisible();
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();

    // Try invalid email format
    await page.getByPlaceholderText('Email address').fill('invalid-email');
    await expect(page.getByText('Invalid email address')).toBeVisible();
  });

  test('handles invalid credentials', async ({ page }) => {
    await page.goto(`/c/${TEST_COMMUNITY}/login`);

    await page.getByPlaceholderText('Email address').fill('wrong@example.com');
    await page.getByPlaceholderText('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid login credentials')).toBeVisible();
  });

  test('customization changes by community owners', async ({ page }) => {
    // Login as community owner
    await page.goto('/login');
    await page.getByPlaceholderText('Email address').fill(OWNER_EMAIL);
    await page.getByPlaceholderText('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Navigate to customization settings
    await page.goto(`/c/${TEST_COMMUNITY}/settings/customization`);

    // Update branding
    await page.getByLabel('Headline').fill('New Welcome Message');
    await page.getByLabel('Primary Color').fill('#FF0000');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify changes on login page
    await page.goto(`/c/${TEST_COMMUNITY}/login`);
    await expect(page.getByRole('heading')).toHaveText('New Welcome Message');
    
    const signInButton = page.getByRole('button', { name: 'Sign in' });
    await expect(signInButton).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  });

  test('prevents non-owners from changing customization', async ({ page }) => {
    // Login as regular member
    await page.goto('/login');
    await page.getByPlaceholderText('Email address').fill(MEMBER_EMAIL);
    await page.getByPlaceholderText('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Try to access customization settings
    await page.goto(`/c/${TEST_COMMUNITY}/settings/customization`);

    // Should be redirected or shown access denied
    await expect(page.getByText('Access Denied')).toBeVisible();
  });

  test('handles network errors gracefully', async ({ page }) => {
    await page.goto(`/c/${TEST_COMMUNITY}/login`);

    // Simulate offline state
    await page.route('**/*', route => route.abort());

    await page.getByPlaceholderText('Email address').fill(MEMBER_EMAIL);
    await page.getByPlaceholderText('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('An unexpected error occurred')).toBeVisible();
  });
});
