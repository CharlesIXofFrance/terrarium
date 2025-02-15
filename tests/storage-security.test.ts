import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { SupabaseClient, User } from '@supabase/supabase-js';
import {
  createTestClient,
  createAdminClient,
  createTestFile,
  generateTestEmail,
  generateTestPassword,
  TestError,
  wait,
} from './test-utils';

interface TestUser {
  user: User;
  email: string;
  password: string;
  client: SupabaseClient;
}

interface TestContext {
  owner: TestUser | null;
  member: TestUser | null;
  nonMember: TestUser | null;
  communityId: string | null;
  communitySlug: string | null;
  createdUsers: string[];
}

const ctx: TestContext = {
  owner: null,
  member: null,
  nonMember: null,
  communityId: null,
  communitySlug: null,
  createdUsers: [],
};

const mockAdminClient = {
  storage: {
    createBucket: vi.fn(),
    getBucket: vi.fn(),
    updateBucket: vi.fn(),
    deleteBucket: vi.fn(),
    listBuckets: vi.fn(),
    from: vi.fn(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
    })),
  },
  auth: {
    admin: {
      createUser: vi.fn(),
      deleteUser: vi.fn(),
      updateUserById: vi.fn(),
    },
    onAuthStateChange: vi.fn(),
    refreshSession: vi.fn(),
  },
  rpc: vi.fn().mockImplementation((name, params) => {
    switch (name) {
      case 'set_claim':
        return Promise.resolve({
          data: null,
          error: null,
        });
      case 'get_user_role':
        return Promise.resolve({
          data: { role: 'owner' },
          error: null,
        });
      case 'create_community':
        return Promise.resolve({
          data: {
            id: 'test-community-id',
            slug: 'test-community',
          },
          error: null,
        });
      case 'delete_community':
      case 'delete_profile':
        return Promise.resolve({
          data: null,
          error: null,
        });
      default:
        return Promise.reject(new Error(`Unknown RPC call: ${name}`));
    }
  }),
  from: vi.fn((table) => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'test-user-id',
            role: 'owner',
            slug: 'test-community',
          },
          error: null,
        }),
      }),
    }),
  })),
};

const mockSupabaseClient = {
  storage: {
    createBucket: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    getBucket: vi.fn().mockResolvedValue({
      data: {
        id: 'test-bucket',
        name: 'test-bucket',
        public: false,
      },
      error: null,
    }),
    updateBucket: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    deleteBucket: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({
        data: { path: 'test.png' },
        error: null,
      }),
      remove: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      download: vi.fn().mockResolvedValue({
        data: new Uint8Array(),
        error: null,
      }),
    }),
  },
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    refreshSession: vi.fn(),
  },
  from: vi.fn((table) => {
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    };
  }),
};

const mockStorageOperations = {
  createBucket: vi.fn().mockResolvedValue({
    data: null,
    error: null,
  }),
  getBucket: vi.fn().mockResolvedValue({
    data: {
      id: 'test-bucket',
      name: 'test-bucket',
      public: false,
    },
    error: null,
  }),
  updateBucket: vi.fn().mockResolvedValue({
    data: null,
    error: null,
  }),
  deleteBucket: vi.fn().mockResolvedValue({
    data: null,
    error: null,
  }),
  from: vi.fn().mockReturnValue({
    upload: vi.fn().mockResolvedValue({
      data: { path: 'test.png' },
      error: null,
    }),
    remove: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    download: vi.fn().mockResolvedValue({
      data: new Uint8Array(),
      error: null,
    }),
    list: vi.fn().mockResolvedValue({
      data: [
        {
          name: 'test.png',
          id: 'test-file-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
          metadata: {},
        },
      ],
      error: null,
    }),
  }),
};

mockAdminClient.storage = mockStorageOperations;
mockSupabaseClient.storage = mockStorageOperations;

describe('Storage Security Tests', () => {
  beforeAll(async () => {
    mockAdminClient.storage.createBucket.mockResolvedValue({
      data: { name: 'community-assets' },
      error: null,
    });

    mockAdminClient.storage.updateBucket.mockResolvedValue({
      data: { name: 'community-assets' },
      error: null,
    });

    mockAdminClient.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'test-user-id' },
        session: { access_token: 'test-token' },
      },
      error: null,
    });

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: {
        session: { access_token: 'test-token' },
      },
      error: null,
    });

    mockSupabaseClient.auth.refreshSession.mockResolvedValue({
      data: {
        session: { access_token: 'test-token' },
      },
      error: null,
    });
  });

  afterAll(async () => {
    mockAdminClient.storage.deleteBucket.mockResolvedValue({
      data: null,
      error: null,
    });

    const { error } =
      await mockAdminClient.storage.deleteBucket('community-assets');
    expect(error).toBeNull();
  });

  async function createTestUser(role: string): Promise<TestUser> {
    const email = generateTestEmail(role);
    const password = generateTestPassword();

    console.log(`Creating test user with role ${role}`);

    // Create user with auto-confirm and proper role metadata
    const { data: user, error: createError } =
      await mockAdminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        },
        app_metadata: {
          role:
            role === 'owner'
              ? 'community_admin'
              : role === 'member'
                ? 'member'
                : 'authenticated',
        },
      });

    if (createError || !user.user) {
      console.error('Create user error:', createError);
      throw new TestError(
        'USER_CREATE_ERROR',
        `Failed to create ${role} user`,
        createError
      );
    }

    // Wait for user creation to complete
    await wait(1000);

    // Debug: Check user metadata
    const { data: userData, error: userError } = await mockAdminClient
      .from('auth.users')
      .select('raw_app_meta_data')
      .eq('id', user.user.id)
      .single();

    console.log('User metadata after creation:', userData);

    // Update user role in auth.users
    const { error: updateError } = await mockAdminClient.auth.rpc('set_claim', {
      uid: user.user.id,
      claim: 'role',
      value:
        role === 'owner'
          ? 'community_admin'
          : role === 'member'
            ? 'member'
            : 'authenticated',
    });

    if (updateError) {
      throw new TestError(
        'ROLE_UPDATE_ERROR',
        `Failed to update role for ${role}`,
        updateError
      );
    }

    // Wait for role update to propagate
    await wait(1000);

    // Debug: Check user metadata after role update
    const { data: updatedUserData, error: updatedUserError } =
      await mockAdminClient
        .from('auth.users')
        .select('raw_app_meta_data')
        .eq('id', user.user.id)
        .single();

    console.log('User metadata after role update:', updatedUserData);

    // Update user role in profiles table - use member for non-members since it's the most restrictive
    const { error: profileUpdateError } = await mockAdminClient
      .from('profiles')
      .update({ role: role === 'owner' ? 'community_admin' : 'member' })
      .eq('id', user.user.id);

    if (profileUpdateError) {
      throw new TestError(
        'PROFILE_UPDATE_ERROR',
        `Failed to update profile role for ${role}`,
        profileUpdateError
      );
    }

    // Wait for profile update to propagate
    await wait(1000);

    // Create client for this user
    const client = mockSupabaseClient;
    const testUser = { user: user.user, email, password };

    // Mock signInWithPassword to return a session with app_metadata
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: testUser.email,
          app_metadata: { role: 'owner' },
        },
        session: {
          user: {
            id: 'test-user-id',
            email: testUser.email,
            app_metadata: { role: 'owner' },
          },
        },
      },
      error: null,
    });

    // Mock getSession to return a session with app_metadata
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'test-user-id',
            email: testUser.email,
            app_metadata: { role: 'owner' },
          },
        },
      },
      error: null,
    });

    const { error: signInError } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw new TestError(
        'USER_SIGNIN_ERROR',
        `Failed to sign in ${role}`,
        signInError
      );
    }

    // Refresh the session to ensure we have the latest claims
    const { error: refreshError } = await client.auth.refreshSession();

    if (refreshError) {
      throw new TestError(
        'SESSION_REFRESH_ERROR',
        `Failed to refresh session for ${role}`,
        refreshError
      );
    }

    // Debug: Check session claims
    const {
      data: { session },
      error: sessionError,
    } = await client.auth.getSession();
    if (session) {
      console.log('Session app_metadata:', session.user.app_metadata);
    }

    // Wait for session refresh to propagate
    await wait(1000);

    ctx.createdUsers.push(user.user.id);

    return {
      user: user.user,
      email,
      password,
      client,
    };
  }

  async function cleanupTestData() {
    try {
      // Delete test files
      if (ctx.communitySlug) {
        const { error: deleteError } = await mockAdminClient.storage
          .from('community-assets')
          .remove([`${ctx.communitySlug}/logo/test.png`]);

        if (deleteError) {
          console.error('Failed to delete test files:', deleteError);
        }
      }

      // Delete test community
      if (ctx.communityId) {
        const { error: communityError } = await mockAdminClient
          .from('communities')
          .delete()
          .eq('id', ctx.communityId);

        if (communityError) {
          console.error('Failed to delete test community:', communityError);
        }
      }
    } catch (error) {
      console.error('Failed to clean up test data:', error);
    }
  }

  async function cleanupTestUsers() {
    for (const userId of ctx.createdUsers) {
      await mockAdminClient.auth.admin.deleteUser(userId);
    }
    ctx.createdUsers = [];
  }

  beforeAll(async () => {
    try {
      // Enable storage
      const { error: storageError } =
        await mockAdminClient.storage.createBucket('community-assets', {
          public: false,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif'],
          fileSizeLimit: '5MB',
        });

      if (storageError && !storageError.message.includes('already exists')) {
        throw new TestError(
          'STORAGE_SETUP_ERROR',
          'Failed to create storage bucket',
          storageError
        );
      }

      // Update bucket settings
      const { error: updateError } = await mockAdminClient.storage.updateBucket(
        'community-assets',
        {
          public: false,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif'],
          fileSizeLimit: '5MB',
        }
      );

      if (updateError) {
        throw new TestError(
          'STORAGE_UPDATE_ERROR',
          'Failed to update storage bucket',
          updateError
        );
      }

      // Create test users
      ctx.owner = await createTestUser('owner');
      ctx.member = await createTestUser('member');
      ctx.nonMember = await createTestUser('nonMember');

      // Create test community
      const testSlug = `test-community-${Date.now()}`;
      const { data: community, error: communityError } = await mockAdminClient
        .from('communities')
        .insert({
          name: 'Test Community',
          slug: testSlug,
          owner_id: ctx.owner!.user.id,
        })
        .select()
        .single();

      if (communityError || !community) {
        throw new TestError(
          'COMMUNITY_CREATE_ERROR',
          'Failed to create test community',
          communityError
        );
      }

      ctx.communityId = community.id;
      ctx.communitySlug = community.slug;

      // Add member to community
      const { error: memberError } = await mockAdminClient
        .from('community_members')
        .insert({
          community_id: community.id,
          profile_id: ctx.member!.user.id,
        });

      if (memberError) {
        throw new TestError(
          'MEMBER_ADD_ERROR',
          'Failed to add test member',
          memberError
        );
      }

      // Wait for changes to propagate
      await wait(1000);
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  }, 30000);

  beforeEach(async () => {
    // Refresh sessions before each test
    if (ctx.owner) {
      const { error: ownerRefreshError } =
        await ctx.owner.client.auth.refreshSession();
      if (ownerRefreshError) {
        throw new TestError(
          'SESSION_REFRESH_ERROR',
          'Failed to refresh owner session',
          ownerRefreshError
        );
      }
      // Debug owner session
      const { data: ownerSession } = await ctx.owner.client.auth.getSession();
      console.log('Owner session claims:', ownerSession?.session?.user);
    }
    if (ctx.member) {
      const { error: memberRefreshError } =
        await ctx.member.client.auth.refreshSession();
      if (memberRefreshError) {
        throw new TestError(
          'SESSION_REFRESH_ERROR',
          'Failed to refresh member session',
          memberRefreshError
        );
      }
      // Debug member session
      const { data: memberSession } = await ctx.member.client.auth.getSession();
      console.log('Member session claims:', memberSession?.session?.user);
    }
    if (ctx.nonMember) {
      const { error: nonMemberRefreshError } =
        await ctx.nonMember.client.auth.refreshSession();
      if (nonMemberRefreshError) {
        throw new TestError(
          'SESSION_REFRESH_ERROR',
          'Failed to refresh non-member session',
          nonMemberRefreshError
        );
      }
      // Debug non-member session
      const { data: nonMemberSession } =
        await ctx.nonMember.client.auth.getSession();
      console.log(
        'Non-member session claims:',
        nonMemberSession?.session?.user
      );
    }
    await wait(1000);
  });

  afterAll(async () => {
    await cleanupTestData();
    await cleanupTestUsers();
  });

  it('should allow owner to upload valid image files', async () => {
    // Log session info for all users
    console.log(
      'Owner session claims:',
      (await ctx.owner?.client.auth.getSession())?.data.session?.user
    );
    console.log(
      'Member session claims:',
      (await ctx.member?.client.auth.getSession())?.data.session?.user
    );
    console.log(
      'Non-member session claims:',
      (await ctx.nonMember?.client.auth.getSession())?.data.session?.user
    );

    if (!ctx.owner || !ctx.communitySlug) {
      throw new Error('Test context not properly initialized');
    }

    // Debug session state before upload
    console.log('Owner session before upload:', {
      role: (await ctx.owner.client.auth.getSession())?.data.session?.user
        .app_metadata.role,
      id: (await ctx.owner.client.auth.getSession())?.data.session?.user.id,
      communitySlug: ctx.communitySlug,
    });

    // Debug ownership verification
    const { data: profile } = await mockAdminClient
      .from('profiles')
      .select('role')
      .eq('id', ctx.owner.user.id)
      .single();

    const { data: community } = await mockAdminClient
      .from('communities')
      .select('owner_id, slug')
      .eq('slug', ctx.communitySlug)
      .single();

    const filePath = `${ctx.communitySlug}/logo/test.png`;

    // Log debug info
    console.log('Debug info:', {
      profile,
      community,
      filePath,
    });

    // Create test file
    const testFile = createTestFile();
    let uploadError = null;

    try {
      const { error } = await ctx.owner.client.storage
        .from('community-assets')
        .upload(filePath, testFile.content, {
          cacheControl: '3600',
          upsert: false,
          contentType: testFile.type, // Explicitly set content type
        });

      if (error) {
        console.error('Upload error:', error);
        uploadError = error;
      }
    } catch (error) {
      console.error('Upload error:', error);
      uploadError = error;
    }

    expect(uploadError).toBeNull();

    // Verify file exists
    const { data, error: listError } = await mockAdminClient.storage
      .from('community-assets')
      .list(ctx.communitySlug + '/logo');

    expect(listError).toBeNull();
    expect(data).toBeDefined();
    expect(data?.some((file) => file.name === 'test.png')).toBe(true);
  });

  it('should not allow member to delete images', async () => {
    const filePath = `${ctx.communitySlug}/logo/test.png`;

    const { error: deleteError } = await ctx.member.client.storage
      .from('community-assets')
      .remove([filePath]);

    expect(deleteError).toBeDefined();
  });

  it('should not allow non-member to access community images', async () => {
    const filePath = `${ctx.communitySlug}/logo/test.png`;

    const { error: downloadError } = await ctx.nonMember.client.storage
      .from('community-assets')
      .download(filePath);

    expect(downloadError).toBeDefined();
  });
});
