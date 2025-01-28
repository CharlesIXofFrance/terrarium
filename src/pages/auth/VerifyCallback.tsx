import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/atoms/Spinner';

const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(area: string, message: string, data?: any) {
  if (DEBUG) {
    console.log(`[Verify Callback Debug] ${area}:`, message, data || '');
  }
}

export function VerifyCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters using URLSearchParams
        const urlParams = new URLSearchParams(location.search);
        const tokenHash = urlParams.get('token_hash');
        const type = urlParams.get('type');
        const communitySlug = urlParams.get('subdomain');

        debugLog('handleCallback', 'URL Parameters:', {
          tokenHash,
          type,
          communitySlug,
          fullUrl: window.location.href,
          searchParams: Object.fromEntries(urlParams.entries()),
        });

        // Always require community slug
        if (!communitySlug) {
          console.error('Community not found in URL');
          navigate('/?error=community-not-found');
          return;
        }

        // Redirect to community login if missing token or type
        if (!tokenHash || !type) {
          console.error('Invalid verification link');
          navigate(
            `/?subdomain=${communitySlug}&path=/login&error=invalid-link`
          );
          return;
        }

        // Get current session first
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        // If already signed in with a valid session, skip verification
        if (currentSession?.user) {
          debugLog(
            'handleCallback',
            'User already signed in, skipping verification'
          );
        } else {
          // Handle session verification
          const verifyResult = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any, // Using the type from URL directly
          });

          if (verifyResult.error || !verifyResult.data.session) {
            debugLog('handleCallback', 'Verification failed', {
              error: verifyResult.error,
            });
            navigate(
              `/?subdomain=${communitySlug}&path=/login&error=invalid-link`
            );
            return;
          }
        }

        // Get current session after verification
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('No session after verification');
        }

        // Get community data
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .eq('slug', communitySlug)
          .single();

        if (communityError || !community) {
          debugLog('handleCallback', 'Community fetch error', {
            error: communityError,
          });
          navigate(
            `/?subdomain=${communitySlug}&path=/login&error=community-not-found`
          );
          return;
        }

        // Get or create profile if it doesn't exist
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (
          profileError &&
          profileError.message.includes('Results contain 0 rows')
        ) {
          // Create profile
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
                role: session.user.user_metadata?.role || 'member',
                onboarding_step: 0,
                profile_complete: false,
              },
            ]);

          if (createProfileError) {
            console.error('Failed to create profile:', createProfileError);
            navigate(
              `/?subdomain=${communitySlug}&path=/login&error=profile-creation-failed`
            );
            return;
          }
        }

        // Get or create community member
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
          navigate(
            `/?subdomain=${communitySlug}&path=/login&error=membership-creation-failed`
          );
          return;
        }

        debugLog('handleCallback', 'Member created/updated:', member);

        // Check if this is a new user or existing user
        const isNewUser = session.user.user_metadata?.isNewUser;
        const isProfileComplete = member.profile?.profile_complete;

        // Determine redirect path:
        // 1. New users -> onboarding
        // 2. Existing users with incomplete profile -> onboarding
        // 3. Existing users with complete profile -> member hub
        const redirectPath =
          isNewUser || !isProfileComplete
            ? `/?subdomain=${communitySlug}&path=/onboarding`
            : `/?subdomain=${communitySlug}&path=/`;

        debugLog('handleCallback', 'Redirecting to:', {
          redirectPath,
          isNewUser,
          isProfileComplete,
          metadata: session.user.user_metadata,
        });

        navigate(redirectPath, { replace: true });
      } catch (error) {
        console.error('Error in verification callback:', error);
        const communitySlug = new URLSearchParams(location.search).get(
          'subdomain'
        );
        navigate(
          communitySlug
            ? `/?subdomain=${communitySlug}&path=/login&error=verification-failed`
            : '/?error=verification-failed'
        );
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
