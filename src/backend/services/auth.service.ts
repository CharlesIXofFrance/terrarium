import { supabase } from '../../lib/supabase';
import type {
  LoginCredentials,
  RegisterData,
  AuthResult,
  AuthError,
  User,
} from '../types/auth.types';

class AuthenticationError extends Error implements AuthError {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

const MAX_PROFILE_RETRIES = 3;
const PROFILE_RETRY_DELAY = 1000; // 1 second

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new AuthenticationError(
          error.name,
          error.message,
          { status: error.status }
        );
      }

      // If we have a session but no user profile yet, wait briefly for it
      if (data.session) {
        let profile = null;
        let lastError = null;

        for (let i = 0; i < MAX_PROFILE_RETRIES; i++) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError) {
            lastError = profileError;
            if (i < MAX_PROFILE_RETRIES - 1) {
              await new Promise((resolve) => setTimeout(resolve, PROFILE_RETRY_DELAY));
              continue;
            }
            break;
          }

          if (profileData) {
            profile = profileData;
            break;
          }

          if (i < MAX_PROFILE_RETRIES - 1) {
            await new Promise((resolve) => setTimeout(resolve, PROFILE_RETRY_DELAY));
          }
        }

        if (!profile && lastError) {
          throw new AuthenticationError(
            'PROFILE_ERROR',
            'Failed to fetch user profile',
            { originalError: lastError }
          );
        }

        return {
          user: profile,
          session: data.session,
          needsEmailVerification: false,
        };
      }

      return {
        user: null,
        session: null,
        needsEmailVerification: true,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        'LOGIN_ERROR',
        error instanceof Error ? error.message : 'Failed to login',
        { originalError: error }
      );
    }
  },

  async register(data: RegisterData): Promise<{ needsEmailVerification: boolean }> {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: 'community_admin',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new AuthenticationError(
          error.name,
          error.message,
          { status: error.status }
        );
      }

      return { needsEmailVerification: true };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        'REGISTRATION_ERROR',
        error instanceof Error ? error.message : 'Failed to register',
        { originalError: error }
      );
    }
  },

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new AuthenticationError(
          error.name,
          error.message,
          { status: error.status }
        );
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        'LOGOUT_ERROR',
        error instanceof Error ? error.message : 'Failed to logout',
        { originalError: error }
      );
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new AuthenticationError(
          sessionError.name,
          sessionError.message,
          { status: sessionError.status }
        );
      }

      if (!session?.user) {
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw new AuthenticationError(
          'PROFILE_ERROR',
          'Failed to fetch user profile',
          { originalError: profileError }
        );
      }

      return profile;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        'GET_USER_ERROR',
        error instanceof Error ? error.message : 'Failed to get current user',
        { originalError: error }
      );
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });

      if (error) {
        throw new AuthenticationError(
          error.name,
          error.message,
          { status: error.status }
        );
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        'RESET_PASSWORD_ERROR',
        error instanceof Error ? error.message : 'Failed to reset password',
        { originalError: error }
      );
    }
  },
};
