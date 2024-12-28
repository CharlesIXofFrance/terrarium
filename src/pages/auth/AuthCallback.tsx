import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../../components/ui/atoms/Spinner';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the next route from query params
        const next = searchParams.get('next');
        
        // Get the token and type from URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        // If this is a recovery flow, store the token and redirect
        if (token && type === 'recovery') {
          sessionStorage.setItem('resetPasswordToken', token);
          sessionStorage.setItem('resetPasswordType', type);
          navigate('/reset-password', { replace: true });
          return;
        }

        // For other auth flows, get the session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session?.user) {
          // If we have a next route, use it
          if (next) {
            navigate(next, { replace: true });
            return;
          }

          // Otherwise, redirect based on user state
          if (session.user.user_metadata?.community_id) {
            navigate(`/c/${session.user.user_metadata.community_id}/dashboard`, { replace: true });
          } else if (!session.user.user_metadata?.onboarding_completed) {
            navigate('/onboarding', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
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
