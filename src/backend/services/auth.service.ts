import { supabase } from '../../lib/supabase';
import {
  RateLimiter,
  rateLimitConfigs,
  RateLimitError,
} from './rate-limiter.service';
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

// Initialize rate limiters
const loginLimiter = new RateLimiter(rateLimitConfigs.login);
const registerLimiter = new RateLimiter(rateLimitConfigs.register);
const resetPasswordLimiter = new RateLimiter(rateLimitConfigs.resetPassword);

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<AuthResult> {
    try {
      // Check rate limit before attempting login
      await loginLimiter.checkLimit(`login:${email.toLowerCase()}`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new AuthenticationError(error.name, error.message, {
          status: error.status,
        });
      }

      if (!data.session) {
        throw new AuthenticationError('NoSession', 'No session data returned');
      }

      // Format token with Bearer scheme
      const token = `Bearer ${data.session.access_token}`;

      // Store token with proper format
      localStorage.setItem(
        'sb-terrarium-auth-token',
        JSON.stringify({
          ...data.session,
          token_type: 'bearer',
        })
      );

      return {
        user: data.user,
        access_token: token,
        refresh_token: data.session.refresh_token,
        expires_at:
          data.session.expires_at ?? Math.floor(Date.now() / 1000) + 3600, // Default to 1 hour if undefined
      };
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw new AuthenticationError(
        'LoginFailed',
        'Failed to authenticate user',
        { originalError: error }
      );
    }
  },

  async register(
    data: RegisterData
  ): Promise<{ needsEmailVerification: boolean }> {
    try {
      // Check rate limit before attempting registration
      await registerLimiter.checkLimit(`register:${data.email.toLowerCase()}`);

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'owner',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new AuthenticationError(error.name, error.message, {
          status: error.status,
        });
      }

      return { needsEmailVerification: true };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof RateLimitError) {
        throw new AuthenticationError('RATE_LIMIT_ERROR', error.message, {
          originalError: error,
        });
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
        throw new AuthenticationError(error.name, error.message, {
          status: error.status,
        });
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
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new AuthenticationError(sessionError.name, sessionError.message, {
          status: sessionError.status,
        });
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
      // Check rate limit before attempting password reset
      await resetPasswordLimiter.checkLimit(`reset:${email.toLowerCase()}`);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new AuthenticationError(error.name, error.message, {
          status: error.status,
        });
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof RateLimitError) {
        throw new AuthenticationError('RATE_LIMIT_ERROR', error.message, {
          originalError: error,
        });
      }
      throw new AuthenticationError(
        'RESET_PASSWORD_ERROR',
        error instanceof Error ? error.message : 'Failed to reset password',
        { originalError: error }
      );
    }
  },
};
