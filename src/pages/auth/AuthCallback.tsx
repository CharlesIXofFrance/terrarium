/**
 * Auth Callback Page
 *
 * This page handles the callback after a user clicks a verification link.
 * The flow works as follows:
 * 1. User clicks magic link in email
 * 2. Link redirects to this page with token_hash
 * 3. We verify the token using Proof Key for Code Exchange
 * 4. We complete sign in and create community member if needed
 * 5. Redirect to appropriate page (onboarding or dashboard)
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { userAtom, userCommunityAtom, isLoadingAtom } from '@/lib/stores/auth';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { toast } from 'sonner';

const DEBUG = process.env.NODE_ENV === 'development';

interface DebugData {
  [key: string]: unknown;
}

function debugLog(area: string, message: string, data?: DebugData): void {
  if (DEBUG) {
    console.log(`[Auth Callback Debug] ${area}:`, message, data || '');
  }
}

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useSetAtom(userAtom);
  const setCommunity = useSetAtom(userCommunityAtom);
  const setIsLoading = useSetAtom(isLoadingAtom);

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);

        // Get token hash and type from URL
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const communitySlug = searchParams.get('subdomain');

        debugLog('handleCallback', 'URL parameters', {
          tokenHash,
          type,
          communitySlug,
          allParams: Object.fromEntries(searchParams.entries()),
        });

        if (!tokenHash || !type) {
          throw new Error('Invalid callback URL');
        }

        if (!communitySlug) {
          debugLog('handleCallback', 'No community slug found');
          throw new Error('Community not found in URL');
        }

        // Exchange token hash for session
        debugLog('handleCallback', 'Verifying OTP');
        const {
          data: { session },
          error: verifyError,
        } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'magiclink',
        });

        if (verifyError || !session) {
          debugLog('handleCallback', 'Verification failed', {
            error: verifyError,
          });
          throw new Error(verifyError?.message || 'Verification failed');
        }

        // Create user profile if needed
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              first_name: session.user.user_metadata?.firstName,
              last_name: session.user.user_metadata?.lastName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (profileError) {
            debugLog('handleCallback', 'Profile creation error', {
              error: profileError,
            });
            throw profileError;
          }
        }

        debugLog('handleCallback', 'Session obtained', {
          userId: session.user.id,
          email: session.user.email,
        });

        // Get community data
        debugLog('handleCallback', 'Fetching community data', {
          communitySlug,
        });
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .eq('slug', communitySlug)
          .single();

        if (communityError) {
          debugLog('handleCallback', 'Community fetch error', {
            error: communityError,
          });
          throw communityError;
        }
        if (!community) {
          debugLog('handleCallback', 'Community not found', { communitySlug });
          throw new Error('Community not found');
        }

        // Get or create community member
        debugLog('handleCallback', 'Creating/updating community member');
        const { data: member, error: memberError } = await supabase
          .from('community_members')
          .upsert(
            {
              profile_id: session.user.id,
              community_id: community.id,
              role: session.user.user_metadata?.role || 'member',
              status: 'active',
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'profile_id,community_id',
              ignoreDuplicates: false,
            }
          )
          .select('*, profile:profiles(*)')
          .single();

        if (memberError) {
          debugLog('handleCallback', 'Member upsert error', {
            error: memberError,
          });
          throw memberError;
        }

        debugLog('handleCallback', 'Member data', { member });

        // Set global state
        setUser(session.user);
        setCommunity(community);

        // Redirect based on onboarding status
        const redirectPath = member.onboarding_completed
          ? `/?subdomain=${communitySlug}&path=/dashboard`
          : `/?subdomain=${communitySlug}&path=/onboarding`;

        debugLog('handleCallback', 'Redirecting', { redirectPath });
        navigate(redirectPath, { replace: true });
      } catch (error) {
        debugLog('handleCallback', 'Error in callback', { error });
        console.error('Auth callback error:', error);
        toast.error(
          error instanceof Error ? error.message : 'Authentication failed'
        );
        navigate('/login');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, searchParams, setUser, setCommunity, setIsLoading]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
};
