import { test, expect, Page } from '@playwright/test';
import {
  createTestUser,
  deleteTestUsers,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
  clearAuthState,
  cleanupTestEnvironment,
} from '../utils/test-helpers';

test.describe('Platform Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await cleanupTestEnvironment(page);
    await page.goto('/login');
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestEnvironment(page);
  });

  test('should show login form', async ({ page }) => {
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('submit-button')).toBeVisible();
  });

  test('should validate login form fields', async ({ page }) => {
    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('email-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toBeVisible();
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('error-message')).toBeVisible();
  });

  test('should successfully log in user', async ({ page }) => {
    await createTestUser(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    await page.getByTestId('email-input').fill(TEST_USER_EMAIL);
    await page.getByTestId('password-input').fill(TEST_USER_PASSWORD);
    await page.getByTestId('submit-button').click();

    await expect(page).toHaveURL(/.*\/dashboard.*/);
  });
});

test.describe('Platform Registration', () => {
  test.beforeEach(async ({ page }) => {
    await cleanupTestEnvironment(page);
    await page.goto('/register');
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestEnvironment(page);
  });

  test('should show registration form', async ({ page }) => {
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('submit-button')).toBeVisible();
  });

  test('should validate registration form', async ({ page }) => {
    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('email-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toBeVisible();
  });

  test('should handle existing email registration', async ({ page }) => {
    await createTestUser(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    await page.getByTestId('email-input').fill(TEST_USER_EMAIL);
    await page.getByTestId('password-input').fill(TEST_USER_PASSWORD);
    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('error-message')).toBeVisible();
  });

  test('should complete registration', async ({ page }) => {
    const email = 'new.user@example.com';
    const password = 'NewPass123!';

    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('submit-button').click();

    await expect(page).toHaveURL(/.*\/login.*/);
  });
});
