import { test, expect } from '@playwright/test';
import { TEST_EMAIL, TEST_PASSWORD, clearAuthState, createTestUser, cleanup, verifyDevServer } from './setup';

test.beforeAll(async () => {
  await verifyDevServer();
  await createTestUser();
});

test.afterAll(async () => {
  await cleanup();
});

test.beforeEach(async ({ page }) => {
  await clearAuthState(page);
});

test('should successfully login using email and password on platform tenant', async ({ page }) => {
  try {
    console.log('Starting login test...');
    
    // Navigate to the login page with platform subdomain parameter
    console.log('Navigating to login page...');
    await page.goto(process.env.VITE_APP_URL + '/login?subdomain=platform');
    
    // Wait for the form to be ready
    console.log('Waiting for login form...');
    await page.waitForSelector('[data-testid="platform-login"]', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('input[id="email"]', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('input[id="password"]', { state: 'visible', timeout: 10000 });
    
    // Fill in login form
    console.log('Filling login form...');
    await page.fill('input[id="email"]', TEST_EMAIL);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    
    // Wait for the submit button to be enabled
    console.log('Waiting for submit button...');
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 10000 });
    
    // Submit the login form
    console.log('Submitting login form...');
    await submitButton.click();
    
    // Wait for navigation to platform dashboard with a reasonable timeout
    console.log('Waiting for navigation to dashboard...');
    await page.waitForURL('**/platform/dashboard', { timeout: 15000 });
    
    // Wait for the dashboard to be ready and verify visibility
    console.log('Verifying dashboard visibility...');
    const dashboard = page.locator('[data-testid="platform-dashboard"]');
    await expect(dashboard).toBeVisible({ timeout: 10000 });
    
    console.log('Login test completed successfully');
  } catch (error) {
    console.error('Login test failed:', error);
    // Take a screenshot on failure
    await page.screenshot({ path: 'login-test-failure.png' });
    throw error;
  }
});
