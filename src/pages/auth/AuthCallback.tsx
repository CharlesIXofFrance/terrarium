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

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { userAtom, userCommunityAtom, isLoadingAtom } from '@/lib/stores/auth';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { toast } from 'sonner';

const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(
  area: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (DEBUG) {
    console.log(`[Auth Callback Debug] ${area}:`, message, data || '');
  }
}

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const setUser = useSetAtom(userAtom);
  const setCommunity = useSetAtom(userCommunityAtom);
  const setIsLoadingGlobal = useSetAtom(isLoadingAtom);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const subdomain = searchParams.get('subdomain') || '';
        const next = searchParams.get('next');
        const redirectTo = searchParams.get('redirectTo');

        debugLog('handleCallback', 'Processing authentication callback', {
          subdomain,
          next,
          redirectTo,
        });

        // Add timeout for security
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Authentication timeout')), 10000);
        });

        // Race between auth and timeout
        const { data, error } = (await Promise.race([
          supabase.auth.getSessionFromUrl(),
          timeoutPromise,
        ])) as { data: any; error: any };

        if (error || !data.session) {
          debugLog('handleCallback', 'Failed to retrieve session from URL', {
            error,
          });
          throw new Error(
            error?.message || 'Failed to retrieve session from URL'
          );
        }
        const session = data.session;
        debugLog('handleCallback', 'Session retrieved successfully', {
          userId: session.user.id,
        });

        // Update auth state with retrieved user session
        setUser(session.user);

        // If subdomain exists, upsert community membership
        if (subdomain) {
          const { data: community, error: commErr } = await supabase
            .from('communities')
            .select('id, slug, owner_id')
            .eq('slug', subdomain)
            .maybeSingle();

          if (commErr) {
            debugLog('handleCallback', 'Failed to fetch community', {
              commErr,
            });
            console.error('Failed to fetch community:', commErr);
          } else if (community) {
            debugLog('handleCallback', 'Found community', {
              communityId: community.id,
              slug: community.slug,
            });
            const { error: memberErr } = await supabase
              .from('community_members')
              .upsert({
                profile_id: session.user.id,
                community_id: community.id,
                role: 'member',
                status: 'active',
              });
            if (memberErr) {
              debugLog(
                'handleCallback',
                'Failed to upsert community membership',
                { memberErr }
              );
              console.error(
                'Failed to upsert community membership:',
                memberErr
              );
            } else {
              debugLog(
                'handleCallback',
                'Community membership upserted successfully'
              );
              setCommunity(community);
            }
          }
        }

        const isPlatformLogin =
          window.location.pathname.startsWith('/platform/') ||
          subdomain === 'platform';
        navigate(
          redirectTo ||
            (isPlatformLogin ? '/platform/dashboard' : '/dashboard'),
          { replace: true }
        );
      } catch (err) {
        debugLog('handleCallback', 'Auth callback error', {
          error: err,
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Auth callback error');
        toast.error('Authentication failed');
      } finally {
        debugLog('handleCallback', 'Auth callback completed');
        setIsLoading(false);
        setIsLoadingGlobal(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams, setUser, setCommunity, setIsLoadingGlobal]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return null;
};
