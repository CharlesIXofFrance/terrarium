/**
 * Auth Callback Page
 *
 * This page handles the callback after a user clicks a verification link (either signup or login).
 * The flow works as follows:
 * 1. User clicks email verification link
 * 2. Supabase verifies the token and redirects to this page
 * 3. We check for an existing session or tokens in the URL hash
 * 4. We complete the sign-in process and redirect to the proper community
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/lib/stores/auth';
import { supabase } from '@/lib/supabase';
import { memberAuth } from '@/services/auth';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { Alert } from '@/components/ui/atoms/Alert';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useSetAtom(userAtom);
  const [error, setError] = useState<Error | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      if (isProcessing) return; // Prevent re-entry
      setIsProcessing(true);

      try {
        if (!mounted) return;

        // Get the subdomain from URL params
        const params = new URLSearchParams(window.location.search);
        const subdomain = params.get('subdomain');

        if (!subdomain) {
          throw new Error('No subdomain specified in redirect URL');
        }

        // Clean the subdomain - remove any trailing paths like /login
        const cleanSubdomain = subdomain.split('/')[0];
        console.log('Using cleaned subdomain:', cleanSubdomain);

        // Check if we have tokens in the URL hash
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // If we have tokens, set the session
        if (accessToken && refreshToken) {
          const {
            data: { session },
            error: setSessionError,
          } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            console.error('Error setting session:', setSessionError);
            throw setSessionError;
          }

          if (!session) {
            throw new Error('Failed to create session from tokens');
          }
        }

        // Get the current session (either existing or newly set)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        if (!session || !cleanSubdomain) return;

        // Set the user in global state
        setUser(session.user);

        // Complete the auth process
        try {
          console.log('Starting completeSignIn with user:', session.user);
          const result = await memberAuth.completeSignIn(session.user);
          console.log('Auth callback - Complete sign in result:', result);

          const { isNewUser } = result.data;

          // Ensure session is persisted before redirecting
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });

          // Wait for session to be fully persisted
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Get the session again to verify it's persisted
          const {
            data: { session: verifySession },
          } = await supabase.auth.getSession();
          if (!verifySession) {
            throw new Error('Session verification failed after setting');
          }

          console.log('Session successfully persisted');

          // Build the redirect URL
          const isLocalhost =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';
          const path = isNewUser ? '/onboarding' : '/dashboard';

          const redirectTo = isLocalhost
            ? `/?subdomain=${cleanSubdomain}${path}`
            : `${window.location.protocol}//${cleanSubdomain}.${window.location.host}${path}`;

          console.log('Auth callback - Redirecting to:', redirectTo);

          // Force navigation with window.location
          window.location.replace(redirectTo);
        } catch (error) {
          console.error('Error completing sign in:', error);
          // Don't throw if it's just a duplicate key error - the membership was still created
          if (error.code !== '23505') {
            throw new Error('Failed to complete sign in');
          } else {
            console.log('Ignoring duplicate key error - membership exists');
            // Continue with redirect
            const redirectTo = isLocalhost
              ? `/?subdomain=${cleanSubdomain}/onboarding`
              : `${window.location.protocol}//${cleanSubdomain}.${window.location.host}/onboarding`;

            // Force navigation with window.location
            window.location.replace(redirectTo);
          }
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Auth callback error:', err);
        setError(err as Error);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate, setUser, searchParams, isProcessing]); // Include all dependencies

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="error" title="Authentication Failed">
          {error.message}
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">Completing authentication...</p>
    </div>
  );
}
