import { AuthError, AuthResponse, User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/utils/types';

const DEBUG = process.env.NODE_ENV === 'development';

interface DebugData {
  [key: string]: unknown;
}

function debugLog(area: string, message: string, data?: DebugData) {
  if (DEBUG) {
    console.log(`[Auth Debug] ${area}:`, message, data || '');
  }
}

/**
 * Result of an authentication operation
 */
export interface AuthResult {
  success: boolean;
  message: string;
  error?: string;
  user?: User;
}

/**
 * Options for signing in with email
 */
export interface SignInOptions {
  role: UserRole;
  communitySlug: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Passwordless authentication service for members and employers.
 * Uses magic links for a seamless sign-in experience.
 */
export class PasswordlessAuthService {
  /**
   * Send magic link for members/employers to sign up or sign in
   */
  async signInWithEmail(
    email: string,
    options: SignInOptions
  ): Promise<AuthResult> {
    try {
      // Build callback
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      if (options.communitySlug) {
        callbackUrl.searchParams.set('subdomain', options.communitySlug);
      }
      callbackUrl.searchParams.set('type', 'magiclink');

      // Attempt signInWithOtp
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl.toString(),
          data: {
            role: options.role || 'member',
            communitySlug: options.communitySlug,
            firstName: options.firstName || '',
            lastName: options.lastName || '',
            isNewUser: !!(options.firstName && options.lastName),
          },
        },
      });
      if (error) {
        return {
          success: false,
          message: error.message,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Check your email for the magic link',
      };
    } catch (err) {
      console.error('Passwordless signInWithEmail error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to send magic link',
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify OTP from magic link
   */
  async verifyOtp(tokenHash: string, type: 'magiclink'): Promise<{ session: Session | null; user: User | null }> {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      throw error;
    }
    return {
      session: data.session,
      user: data.session?.user || null,
    };
  }

  /**
   * Get current session if any
   */
  async getSession(): Promise<{ session: Session | null; user: User | null }> {
    const { data } = await supabase.auth.getSession();
    return {
      session: data.session,
      user: data.session?.user || null,
    };
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }
}
  }

  /**
   * Verify OTP token hash from magic link
   * @param tokenHash The token hash from the magic link
   * @param type The type of verification ('magic-link' for passwordless auth)
   */
  async verifyOtp(
    tokenHash: string,
    type: 'magiclink'
  ): Promise<{ session: Session | null; user: User | null }> {
    debugLog('verifyOtp', 'Starting verification', { tokenHash, type });

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      debugLog('verifyOtp', 'Verification error', { error });
      throw error;
    }

    debugLog('verifyOtp', 'Verification successful', { data });
    return {
      session: data.session,
      user: data.session?.user || null,
    };
  }

  /**
   * Get the current session and user
   */
  async getSession(): Promise<{ session: Session | null; user: User | null }> {
    debugLog('getSession', 'Fetching session');
    const { data } = await supabase.auth.getSession();
    return {
      session: data.session,
      user: data.session?.user || null,
    };
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    debugLog('signOut', 'Starting sign out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      debugLog('signOut', 'Sign out error', { error });
      throw error;
    }
    debugLog('signOut', 'Sign out successful');
  }
}

export const memberAuth = new PasswordlessAuthService();