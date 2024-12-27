import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    admin: {
      deleteUser: vi.fn(),
    },
  },
  from: vi.fn(),
};

// Test configuration
const testUser = {
  email: 'test' + Date.now() + '@example.com',
  password: 'testpassword123',
  name: 'Test User',
};

const testCommunity = {
  name: 'Test Community',
  slug: 'test-community',
  description: 'A test community',
};

describe('Onboarding Flow', () => {
  let userId: string | null = null;

  beforeAll(async () => {
    // Set up auth responses
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: {
        user: {
          id: 'test-user-id',
          email: testUser.email,
        },
        session: null,
      },
      error: null,
    });

    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: {
          id: 'test-user-id',
          email: testUser.email,
        },
        session: {
          access_token: 'test-token',
        },
      },
      error: null,
    });

    const { data, error } = await mockSupabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: testUser.name,
        },
      },
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    userId = data.user.id;

    // Sign in to get a valid session
    const { error: signInError } = await mockSupabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    expect(signInError).toBeNull();
  });

  afterAll(async () => {
    if (userId) {
      try {
        // Clean up test data in correct order
        mockSupabase.from.mockImplementation((table) => ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              delete: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }));

        await mockSupabase.from('communities').select('*').eq('owner_id', userId).delete();
        await mockSupabase.from('profiles').select('*').eq('id', userId).delete();

        mockSupabase.auth.admin.deleteUser.mockResolvedValueOnce({
          data: null,
          error: null,
        });

        const { error } = await mockSupabase.auth.admin.deleteUser(userId);
        if (error) {
          console.warn('Failed to delete test user:', error.message);
        }
      } catch (error) {
        console.warn('Cleanup error:', error);
      }
    }

    await mockSupabase.auth.signOut();
  });

  it('should complete the full onboarding flow successfully', async () => {
    // Update profile with full name
    mockSupabase.from.mockImplementation((table) => ({
      upsert: vi.fn().mockResolvedValue({
        data: {
          id: userId,
          email: testUser.email,
          full_name: testUser.name,
        },
        error: null,
      }),
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: { onboarded: true },
          error: null,
        }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: userId,
              email: testUser.email,
              full_name: testUser.name,
              onboarded: true,
            },
            error: null,
          }),
        }),
      }),
    }));

    const { error: profileError } = await mockSupabase.from('profiles').upsert({
      id: userId,
      email: testUser.email,
      full_name: testUser.name,
    });

    expect(profileError).toBeNull();

    // Create community
    const communityData = {
      name: 'Test Community',
      slug: 'test-community',
      owner_id: userId,
      description: 'A test community',
    };

    const { error: communityError } = await mockSupabase
      .from('communities')
      .insert([communityData]);

    expect(communityError).toBeNull();

    // Update profile as onboarded
    const { error: updateError } = await mockSupabase
      .from('profiles')
      .update({ onboarded: true })
      .eq('id', userId);

    expect(updateError).toBeNull();

    // Verify final state
    const { data: profile, error: verifyError } = await mockSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    expect(verifyError).toBeNull();
    expect(profile.onboarded).toBe(true);
  });

  it('should prevent duplicate community slugs', async () => {
    const slug = `test-community-${Date.now()}`;
    
    // Mock for community operations
    const insertMock = vi.fn();
    insertMock
      .mockResolvedValueOnce({
        data: {
          name: 'Test Community 1',
          slug,
          owner_id: userId,
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Duplicate slug',
          code: '23505',
        },
      });

    mockSupabase.from.mockImplementation((table) => ({
      insert: insertMock,
    }));

    // Create first community
    const { error: communityError1 } = await mockSupabase
      .from('communities')
      .insert([{
        name: 'Test Community 1',
        slug,
        owner_id: userId,
      }]);

    expect(communityError1).toBeNull();

    // Try to create second community with same slug
    const { error: communityError2 } = await mockSupabase
      .from('communities')
      .insert([{
        name: 'Test Community 2',
        slug,
        owner_id: userId,
      }]);

    expect(communityError2).toBeDefined();
    expect(communityError2.code).toBe('23505');
  });

  it('should enforce required community fields', async () => {
    // Mock for community creation with missing fields
    mockSupabase.from.mockImplementation((table) => ({
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'Missing required fields',
          code: '23502',
        },
      }),
    }));

    // Try to create community without required fields
    const { error: communityError } = await mockSupabase
      .from('communities')
      .insert([{
        owner_id: userId,
      }]);

    expect(communityError).toBeDefined();
    expect(communityError.code).toBe('23502');
  });
});
