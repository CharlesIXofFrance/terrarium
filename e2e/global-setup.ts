import { FullConfig } from '@playwright/test';
import {
  verifySupabaseConnection,
  deleteTestUsers,
} from './utils/test-helpers';

async function globalSetup(_config: FullConfig): Promise<void> {
  console.log('Starting global test setup...');

  // Verify Supabase connection
  const isConnected = await verifySupabaseConnection();
  if (!isConnected) {
    throw new Error('Failed to connect to Supabase during global setup');
  }

  // Clean up any existing test users
  try {
    await deleteTestUsers();
    console.log('Successfully cleaned up test users');
  } catch (error) {
    console.error('Failed to clean up test users:', error);
    throw error;
  }

  console.log('Global test setup completed');
}

export default globalSetup;
