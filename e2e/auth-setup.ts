/**
 * Global setup for Supabase auth tests
 * Matches current implementation's setup flow
 */

import { chromium, type FullConfig } from '@playwright/test';
import { setupTestDatabase, OWNER_EMAIL, PASSWORD, adminClient, test } from './test-setup';
import { Mutex } from 'async-mutex';

// Create a mutex for database operations
const dbMutex = new Mutex();

async function globalSetup(_config: FullConfig) {
  // Make sure the .auth directory exists
  const { mkdir } = await import('fs/promises');
  await mkdir('./e2e/.auth', { recursive: true });

  // Set up the test database first
  console.log('Setting up test database...');
  await dbMutex.runExclusive(async () => {
    await setupTestDatabase();
  });
  console.log('Test database setup complete');

  // Before test execution
  // Check if the owner exists and has correct role
  const { data: ownerProfile, error: ownerError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('email', OWNER_EMAIL)
    .single();

  if (ownerError) {
    if (ownerError.code === 'PGRST116') {
      console.log('Owner profile not found, will be created during test setup');
    } else {
      console.error('Error checking owner role:', ownerError);
      throw ownerError;
    }
  } else if (ownerProfile.role !== 'owner') {
    throw new Error('Schema validation failed - owner role not set correctly');
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to all console messages
  page.on('console', msg => {
    console.log(`Browser console ${msg.type()}: ${msg.text()}`);
  });

  // Listen to all uncaught errors
  page.on('pageerror', error => {
    console.error('Browser uncaught error:', error);
  });

  try {
    // Go to the application auth page
    await page.goto('http://localhost:3000/login');

    // Fill in login form
    await page.getByLabel('Email').fill(OWNER_EMAIL);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for auth and verify
    await page.waitForResponse(res => 
      res.url().includes('/auth/v1/token') && 
      res.status() === 200
    );

    // Save signed-in state
    await page.context().storageState({
      path: './e2e/.auth/user.json'
    });

    await browser.close();
  } catch (error) {
    console.error('Error in auth setup:', error);
    throw error;
  }
}

export default globalSetup;
