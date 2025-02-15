import { FullConfig } from '@playwright/test';
import { deleteTestUsers } from './utils/test-helpers';

async function globalTeardown(_config: FullConfig): Promise<void> {
  console.log('Starting global test teardown...');

  // Clean up any remaining test users
  try {
    await deleteTestUsers();
    console.log('Successfully cleaned up test users');
  } catch (error) {
    console.error('Failed to clean up test users:', error);
    // Don't throw here as we don't want to fail the test run
    // just because cleanup failed
  }

  console.log('Global test teardown completed');
}

export default globalTeardown;
