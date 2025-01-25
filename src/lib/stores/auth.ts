import { atom, createStore } from 'jotai';
import type {
  User,
  Community,
  AuthError,
} from '../../backend/types/auth.types';
import { supabase } from '../supabase';

const STORAGE_KEY = 'terrarium_user';
const COMMUNITY_STORAGE_KEY = 'terrarium_community';

// Create a store instance
const store = createStore();

// Storage utilities with proper error handling
const storage = {
  load: <T>(key: string): T | null => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error(`Failed to load from storage (${key}):`, error);
      return null;
    }
  },
  save: <T>(key: string, data: T | null): void => {
    try {
      if (data) {
        localStorage.setItem(key, JSON.stringify(data));
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to save to storage (${key}):`, error);
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COMMUNITY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },
};

// Atoms
export const userAtom = atom<User | null>(storage.load(STORAGE_KEY));
export const userCommunityAtom = atom<Community | null>(
  storage.load(COMMUNITY_STORAGE_KEY)
);
export const isLoadingAtom = atom<boolean>(true);
export const authErrorAtom = atom<AuthError | null>(null);

// Combined auth state atom with proper typing
export const authStateAtom = atom((get) => ({
  user: get(userAtom),
  community: get(userCommunityAtom),
  isLoading: get(isLoadingAtom),
  error: get(authErrorAtom),
}));

// Session management
let sessionCheckInterval: NodeJS.Timeout | null = null;

const clearAuthState = () => {
  store.set(userAtom, null);
  store.set(userCommunityAtom, null);
  store.set(authErrorAtom, null);
  storage.clear();
};

const startSessionCheck = () => {
  // Clear any existing interval
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
  }

  // Check session every 5 minutes
  sessionCheckInterval = setInterval(
    async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        clearAuthState();
      }
    },
    5 * 60 * 1000
  );
};

const stopSessionCheck = () => {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
};

export async function initAuth() {
  store.set(isLoadingAtom, true);
  store.set(authErrorAtom, null);

  try {
    // Get initial session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (session) {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (profile) {
        const user = {
          id: session.user.id,
          email: session.user.email!,
          name: profile.name,
          avatar: profile.avatar_url,
          role: profile.role,
        };

        // Update atoms and storage
        store.set(userAtom, user);
        storage.save(STORAGE_KEY, user);

        // Start session checking
        startSessionCheck();

        // Get user's community if they're a community owner
        if (profile.role === 'community_owner') {
          const { data: community, error: communityError } = await supabase
            .from('communities')
            .select('*')
            .eq('owner_id', session.user.id)
            .single();

          if (communityError && communityError.code !== 'PGRST116') {
            // Only throw if it's not a "no rows returned" error
            throw communityError;
          }

          if (community) {
            store.set(userCommunityAtom, community);
            storage.save(COMMUNITY_STORAGE_KEY, community);
          }
        }
      }
    } else {
      clearAuthState();
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    store.set(authErrorAtom, {
      code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
    clearAuthState();
  } finally {
    store.set(isLoadingAtom, false);
  }
}

// Cleanup function for unmounting
export function cleanup() {
  stopSessionCheck();
  clearAuthState();
}

// Export storage utilities for external use
export const { save: saveUser } = storage;
