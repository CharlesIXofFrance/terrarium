import { describe, it, expect, beforeEach } from 'vitest';
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

describe('Supabase Client', () => {
  let supabase;

  beforeEach(() => {
    supabase = createClient(supabaseUrl, supabaseKey);
  });

  it('should have correct auth configuration', () => {
    expect(createClient).toHaveBeenCalledWith(supabaseUrl, supabaseKey);
  });

  it('should be able to connect to Supabase', async () => {
    const { error } = await supabase.from('profiles').select('*').single();
    expect(error).toBeNull();
  });

  it('should handle auth operations', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };

    // Mock sign up
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const signUpResult = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(signUpResult.error).toBeNull();
    expect(signUpResult.data.user).toEqual(mockUser);

    // Mock sign in
    (supabase.auth.signIn as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const signInResult = await supabase.auth.signIn({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(signInResult.error).toBeNull();
    expect(signInResult.data.user).toEqual(mockUser);
  });
});
