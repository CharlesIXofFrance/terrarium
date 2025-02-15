import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { Session, User } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';
import { authLogger } from './utils/logger';

/**
 * Enhanced Supabase client with PKCE flow and session persistence
 * @see https://supabase.com/docs/guides/auth/sessions/pkce-flow
 */

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create storage implementation that works in both browser and Node environments
const createStorage = () => {
  if (typeof window === 'undefined') {
    // Node environment - use in-memory storage
    const nodeStorage = new Map<string, string>();
    return {
      storage: {
        getItem: (key: string) => nodeStorage.get(key) ?? null,
        setItem: (key: string, value: string) => nodeStorage.set(key, value),
        removeItem: (key: string) => nodeStorage.delete(key),
      },
    };
  }

  // Browser environment - use localStorage with error handling
  return {
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          authLogger.warn('localStorage.getItem failed:', e);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          authLogger.warn('localStorage.setItem failed:', e);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          authLogger.warn('localStorage.removeItem failed:', e);
        }
      },
    },
  };
};

// Initialize storage
const { storage } = createStorage();

// Basic types for auth state management
export type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
};

export type AuthStateListener = (state: AuthState) => void;

// Simple auth state manager
class AuthStateManager {
  private currentState: AuthState = {
    session: null,
    user: null,
    loading: true,
    error: null,
  };
  private listeners: Set<AuthStateListener> = new Set();

  subscribe(listener: AuthStateListener) {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => this.listeners.delete(listener);
  }

  updateState(partial: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...partial };
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  getState(): AuthState {
    return this.currentState;
  }
}

export const authStateManager = new AuthStateManager();

// Create Supabase client with simple configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
  },
});

// Set up auth state change listener
const {
  data: { subscription },
} = supabase.auth.onAuthStateChange(async (event, session) => {
  // Only handle specific auth events (including TOKEN_REFRESHED for PKCE flow)
  if (
    ![
      'INITIAL_SESSION',
      'SIGNED_IN',
      'SIGNED_OUT',
      'USER_UPDATED',
      'TOKEN_REFRESHED',
    ].includes(event)
  ) {
    return;
  }

  const eventData = {
    event,
    hasSession: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    timestamp: new Date().toISOString(),
  };

  authLogger.debug('[Supabase] Auth state changed:', eventData);

  try {
    // Update auth state
    authStateManager.updateState({
      session,
      user: session?.user ?? null,
      loading: false,
      error: null,
    });

    // Handle specific events
    if (event === 'SIGNED_OUT') {
      // Clear any stored auth data
      storage.removeItem('sb-terrarium-auth-token');
    }
  } catch (error) {
    authLogger.error('[Supabase] Error handling auth state change:', error);
    if (error instanceof AuthError) {
      // Handle error
    } else {
      throw error;
    }
  }
});

// Helper function to check for "no rows" errors
export const isNoRowsError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  return (
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string' &&
    (error as { message: string }).message.includes('Results contain 0 rows')
  );
};

// Export helper functions for auth state management
export const getAuthState = () => authStateManager.getState();
export const subscribeToAuthState = (listener: AuthStateListener) =>
  authStateManager.subscribe(listener);
