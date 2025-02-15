import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/atoms/Spinner';

const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(area: string, message: string, data?: Record<string, unknown>) {
  if (DEBUG) {
    console.log(`[Verify Callback Debug] ${area}:`, message, data || '');
  }
}

export function VerifyCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const communitySlug = urlParams.get('subdomain');
        if (!communitySlug) {
          console.error('Community not found in URL');
          navigate('/?error=community-not-found');
          return;
        }

        // Use getSessionFromUrl to handle the PKCE flow
        const { data, error } = await supabase.auth.getSessionFromUrl();
        if (error || !data.session) {
          debugLog('handleCallback', 'Failed to retrieve session from URL', { error });
          navigate(`/?subdomain=${communitySlug}&path=/login&error=invalid-link`);
          return;
        }
        const session = data.session;

        // Retrieve community data
        const { data: community, error: commErr } = await supabase
          .from('communities')
          .select('*')
          .eq('slug', communitySlug)
          .single();
        if (commErr || !community) {
          const errorMessage = commErr?.message || 'Community not found';
          debugLog('handleCallback', 'Community fetch error', { error: errorMessage });
          setError(errorMessage);
          navigate(`/?subdomain=${communitySlug}&path=/login&error=community-not-found`);
          return;
        }

        // Upsert community membership
        const { data: member, error: memberErr } = await supabase
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

        if (memberErr) {
          debugLog('handleCallback', 'Member upsert error', { error: memberErr });
          navigate(`/?subdomain=${communitySlug}&path=/login&error=membership-creation-failed`);
          return;
        }

        debugLog('handleCallback', 'Member upserted', { member });

        // Determine redirect path based on profile completeness
        const isNewUser = session.user.user_metadata?.isNewUser;
        const isProfileComplete = member.profile?.profile_complete;
        const redirectPath =
          isNewUser || !isProfileComplete
            ? `/?subdomain=${communitySlug}&path=/onboarding`
            : `/?subdomain=${communitySlug}&path=/`;

        debugLog('handleCallback', 'Redirecting to', { redirectPath, isNewUser, isProfileComplete });
        navigate(redirectPath, { replace: true });
      } catch (error) {
        console.error('Error in verification callback:', error);
        const commSlug = new URLSearchParams(location.search).get('subdomain');
        if (!commSlug) throw new Error('No community slug found');
        navigate(`/?subdomain=${commSlug}&error=verification-failed`);
      }
    };

    handleCallback();
  }, [navigate, location]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Spinner size="lg" />
      <div className="mt-4">Verifying your email...</div>
    </div>
  );
}