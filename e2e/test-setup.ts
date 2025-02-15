/**
 * Test setup for Terrarium e2e tests
 * Using Supabase's built-in features
 */

import type { Database } from '@/lib/database.types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { test as base } from '@playwright/test';

// Create admin client for test setup
export const adminClient = createClient<Database>(
  process.env.VITE_SUPABASE_URL || 'http://localhost:8000',
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Test utilities
const generateTestId = () => Math.random().toString(36).substring(7);
const generateTestEmail = () => `test-${generateTestId()}@example.com`;
const generateTestPassword = () => `password-${generateTestId()}`;

// Constants for testing
export const TEST_COMMUNITY = 'test-community';
export const OWNER_EMAIL = 'owner@example.com';
export const MEMBER_EMAIL = 'member@example.com';
export const PASSWORD = 'password123';

/**
 * Create a test user with the given role and metadata
 */
const createTestUser = async (
  email: string,
  password: string,
  role: string,
  metadata: Record<string, unknown> = {}
) => {
  const { data: user, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, ...metadata },
  });
  if (error) throw error;
  return user;
};

/**
 * Create a test community owned by the given user
 */
const createTestCommunity = async (
  ownerId: string,
  data: Record<string, unknown> = {}
) => {
  const testId = generateTestId();
  const { name: providedName, slug: providedSlug, ...otherData } = data;
  const { data: community, error } = await adminClient
    .from('communities')
    .insert({
      ...otherData,
      name: providedName
        ? `${providedName}-${testId}`
        : `Test Community-${testId}`,
      slug: providedSlug || `test-community-${testId}`,
      owner_id: ownerId,
    })
    .select()
    .single();
  if (error) throw error;
  return community;
};

/**
 * Create a community membership for a user
 */
const createTestMembership = async (
  userId: string,
  communityId: string,
  role: string = 'member'
) => {
  const { data: membership, error } = await adminClient
    .from('community_members')
    .insert({
      profile_id: userId,
      community_id: communityId,
      role,
    })
    .select()
    .single();
  if (error) throw error;
  return membership;
};

/**
 * Delete test users from auth and profiles
 */
async function deleteTestUsers() {
  try {
    console.log('Deleting test users...');

    // Delete from auth.users (cascades to profiles)
    const { data: users, error: listError } =
      await adminClient.auth.admin.listUsers();
    if (listError) throw listError;

    const testUsers = users.users.filter(
      (user) => user.email === OWNER_EMAIL || user.email === MEMBER_EMAIL
    );

    for (const user of testUsers) {
      const { error } = await adminClient.auth.admin.deleteUser(user.id);
      if (error) console.error(`Error deleting user ${user.email}:`, error);
    }

    console.log('Test users deleted');
  } catch (error) {
    console.error('Error deleting test users:', error);
  }
}

/**
 * Set up test database with initial data
 * Creates a test community with an owner and a member
 */
async function setupTestDatabase() {
  console.log('Setting up test database...');

  // Delete existing test users first
  await deleteTestUsers();

  try {
    // Create owner
    console.log('Creating owner...');
    const owner = await createTestUser(OWNER_EMAIL, PASSWORD, 'owner', {
      firstName: 'Test',
      lastName: 'Owner',
      onboardingComplete: true,
    });
    console.log('Owner created successfully');

    // Create test community
    console.log('Creating test community...');
    const community = await createTestCommunity(owner.user.id, {
      name: 'Test Community',
      description: 'Test community for e2e tests',
    });
    console.log('Test community created successfully');

    // Create owner's community membership
    console.log('Creating owner membership...');
    await createTestMembership(owner.user.id, community.id, 'owner');
    console.log('Owner membership created successfully');

    // Create member
    console.log('Creating member...');
    const memberUser = await createTestUser(MEMBER_EMAIL, PASSWORD, 'member', {
      firstName: 'Test',
      lastName: 'Member',
      onboardingComplete: true,
      metadata: { community_slug: TEST_COMMUNITY },
    });
    console.log('Member created successfully');

    // Create member's community membership
    console.log('Creating member membership...');
    await createTestMembership(memberUser.user.id, community.id, 'member');
    console.log('Member membership created successfully');

    // Verify setup
    console.log('Verifying setup...');
    const { data: ownerProfile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('email', OWNER_EMAIL)
      .single();

    const { data: memberProfile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('email', MEMBER_EMAIL)
      .single();

    if (!ownerProfile || !memberProfile) {
      throw new Error('Failed to verify test setup');
    }

    console.log('Test database setup complete');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

// Test fixtures type
type TestFixtures = {
  adminClient: SupabaseClient<Database>;
};

// Export the base test with auth utilities
export const test = base.extend<TestFixtures>({
  adminClient: [
    async (_: any, use: (arg: SupabaseClient<Database>) => Promise<void>) => {
      await use(adminClient);
    },
    { scope: 'test' },
  ],
});
