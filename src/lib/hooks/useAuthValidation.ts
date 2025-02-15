import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { authLogger } from '@/lib/utils/logger';

type ValidationResult = {
  isLoading: boolean;
  error: string | null;
  isValid: boolean;
  role?: string | null;
};

type ValidationOptions = {
  requiredRole?: string[];
  maxRetries?: number;
  retryDelay?: number;
  allowNoProfile?: boolean;
};

/**
 * Custom hook for validating user authentication and role permissions.
 * Handles session management, role validation, and error handling with retries.
 */
export function useAuthValidation(options: ValidationOptions = {}): ValidationResult {
  const {
    requiredRole = ['admin', 'platform_admin'],
    maxRetries = 3,
    retryDelay = 1000,
    allowNoProfile = false,
  } = options;

  const [state, setState] = useState<ValidationResult>({
    isLoading: true,
    error: null,
    isValid: false,
    role: null,
  });

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;

    const validateSession = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          authLogger.error('Session validation failed:', {
            error: sessionError,
            attempt: retryCount + 1,
            maxRetries,
          });

          if (retryCount < maxRetries - 1) {
            retryCount++;
            setTimeout(validateSession, retryDelay * Math.pow(2, retryCount));
            return;
          }

          if (mounted) {
            setState({
              isLoading: false,
              error: 'Session validation failed. Please try logging in again.',
              isValid: false,
              role: null,
            });
          }
          return;
        }

        if (!session) {
          if (mounted) {
            setState({
              isLoading: false,
              error: 'No active session found',
              isValid: false,
              role: null,
            });
          }
          return;
        }

        // First check role from user metadata
        const metadataRole = session.user?.user_metadata?.role?.toLowerCase();
        if (metadataRole && requiredRole.includes(metadataRole)) {
          if (mounted) {
            setState({
              isLoading: false,
              error: null,
              isValid: true,
              role: metadataRole,
            });
          }
          return;
        }

        // Then check role from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          // Handle PGRST116 (no rows) differently if allowNoProfile is true
          if (profileError.code === 'PGRST116' && allowNoProfile) {
            if (mounted) {
              setState({
                isLoading: false,
                error: null,
                isValid: true,
                role: metadataRole,
              });
            }
            return;
          }

          authLogger.error('Profile fetch failed:', {
            error: profileError,
            userId: session.user.id,
            code: profileError.code,
          });

          if (mounted) {
            setState({
              isLoading: false,
              error: 'Failed to validate user profile',
              isValid: false,
              role: null,
            });
          }
          return;
        }

        const profileRole = profile?.role?.toLowerCase();
        if (!profileRole || !requiredRole.includes(profileRole)) {
          authLogger.error('Invalid role from profile:', {
            metadataRole,
            profileRole,
            userId: session.user.id,
            requiredRoles: requiredRole,
          });

          if (mounted) {
            setState({
              isLoading: false,
              error: 'Unauthorized: Invalid role for access',
              isValid: false,
              role: null,
            });
          }
          await supabase.auth.signOut();
          return;
        }

        // All validation passed
        if (mounted) {
          setState({
            isLoading: false,
            error: null,
            isValid: true,
            role: profileRole,
          });
        }
      } catch (error) {
        authLogger.error('Unexpected error during validation:', error);
        if (mounted) {
          setState({
            isLoading: false,
            error: 'An unexpected error occurred during validation',
            isValid: false,
            role: null,
          });
        }
      }
    };

    validateSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      authLogger.debug('Auth state changed during validation:', { 
        event, 
        sessionExists: !!session,
        userId: session?.user?.id,
      });
      validateSession();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [maxRetries, retryDelay, requiredRole.join(','), allowNoProfile]);

  return state;
}
