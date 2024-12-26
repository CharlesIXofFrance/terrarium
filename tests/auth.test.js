import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const testUser = {
  email: 'test' + Date.now() + '@example.com',
  password: 'testpassword123',
  name: 'Test User',
};

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

describe('Authentication Flow', () => {
  let userId = null;

  beforeEach(async () => {
    // Wait for any previous operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterEach(async () => {
    if (userId) {
      try {
        // Clean up any test data
        await supabase.from('profiles').delete().eq('id', userId);
        await supabase.auth.admin.deleteUser(userId);
      } catch (error) {
        console.error('Cleanup error (can be ignored):', error.message);
      }
    }
  });

  it('should verify API health', async () => {
    console.log('Testing API health...');
    const response = await fetch(process.env.VITE_SUPABASE_URL + '/rest/v1/');
    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response:', data);
    expect(response.status).toBe(200);
  });

  it('should sign up a new user', async () => {
    console.log('Starting signup test with email:', testUser.email);
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: testUser.name,
        },
      },
    });

    console.log('Signup response:', {
      user: data?.user ? { email: data.user.email } : null,
      session: data?.session ? 'exists' : null,
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testUser.email);
    userId = data.user.id;

    // Wait for user to be fully created
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it('should sign in an existing user', async () => {
    // First ensure we have a user to sign in
    if (!userId) {
      const { data } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
      });
      userId = data.user.id;
      // Wait for user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testUser.email);
  });

  it('should get user profile', async () => {
    // First ensure we have a user profile
    if (!userId) {
      const { data } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
      });
      userId = data.user.id;
      // Wait for user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Create profile if it doesn't exist
    await supabase.from('profiles').upsert({
      id: userId,
      email: testUser.email,
      full_name: testUser.name,
    });

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.email).toBe(testUser.email);
  });

  it('should update profile', async () => {
    // First ensure we have a user profile
    if (!userId) {
      const { data } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
      });
      userId = data.user.id;
      // Wait for user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create initial profile
      await supabase.from('profiles').upsert({
        id: userId,
        email: testUser.email,
        full_name: testUser.name,
      });
    }

    const updates = {
      bio: 'Test bio',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    expect(error).toBeNull();

    // Verify update
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    expect(profile.bio).toBe(updates.bio);
    expect(profile.avatar_url).toBe(updates.avatar_url);
  });
});
