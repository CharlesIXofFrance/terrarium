import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/atoms/Spinner';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the next route from query params
        const next = searchParams.get('next');

        // Get the session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // Check if user is a community owner
          const { data: community } = await supabase
            .from('communities')
            .select('id, onboarding_completed, slug')
            .eq('owner_id', session.user.id)
            .single();

          if (community) {
            // Community owner flow
            if (!community.onboarding_completed) {
              // Redirect to community owner onboarding
              navigate('/onboarding');
            } else {
              // Redirect to community dashboard
              const isLocalhost =
                window.location.hostname.includes('localhost');
              const path = '/settings/dashboard';

              if (isLocalhost) {
                navigate(`/?subdomain=${community.slug}${path}`);
              } else {
                window.location.href = `${window.location.protocol}//${community.slug}.${import.meta.env.VITE_APP_DOMAIN}${path}`;
              }
            }
          } else {
            // Member flow
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single();

            if (!profile?.onboarding_completed) {
              // Redirect to member onboarding
              navigate('/onboarding');
            } else {
              // Redirect to member dashboard
              navigate('/dashboard');
            }
          }
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">Setting up your session...</p>
    </div>
  );
}
