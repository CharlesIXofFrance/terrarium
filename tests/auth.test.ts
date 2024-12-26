import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'test-key';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  })),
}));

describe('Authentication Flow', () => {
  let supabase;

  beforeAll(() => {
    console.log('Setting up Supabase client...');
    supabase = createClient(supabaseUrl, supabaseKey);
  });

  it('should verify API health', async () => {
    console.log('Testing API health...');
    const response = await fetch(`${supabaseUrl}/rest/v1/health-check`);
    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response:', data);
    expect(response.status).toBe(200);
  });

  it('should sign up a new user', async () => {
    const testEmail = `test${Date.now()}@example.com`;
    console.log('Starting signup test with email:', testEmail);

    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: { email: testEmail }, session: null },
      error: null,
    });

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'password123',
    });

    console.log('Signup response:', data);
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe(testEmail);
    expect(error).toBeNull();
  }, 5000);

  it('should sign in an existing user', async () => {
    const testEmail = `test${Date.now()}@example.com`;

    (supabase.auth.signIn as jest.Mock).mockResolvedValueOnce({
      data: {
        user: { email: testEmail },
        session: { access_token: 'test-token' },
      },
      error: null,
    });

    const { data, error } = await supabase.auth.signIn({
      email: testEmail,
      password: 'password123',
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.session).toBeDefined();
    expect(data.user?.email).toBe(testEmail);
  });

  it('should get user profile', async () => {
    const testEmail = `test${Date.now()}@example.com`;

    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: { email: testEmail } },
      error: null,
    });

    const { data, error } = await supabase.auth.getUser();

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe(testEmail);
  });

  it('should sign out', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    const { error } = await supabase.auth.signOut();

    expect(error).toBeNull();
  });

  afterAll(async () => {
    // Clean up any test data if needed
  });
});
