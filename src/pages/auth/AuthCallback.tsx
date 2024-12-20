import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile?.profile_complete) {
            // Get user's community
            const { data: community } = await supabase
              .from('communities')
              .select('*')
              .eq('owner_id', session.user.id)
              .single();

            if (community) {
              navigate(`/c/${community.slug}`);
            } else {
              navigate('/onboarding');
            }
          } else {
            navigate('/onboarding');
          }
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Signing you in...
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we redirect you.
        </p>
      </div>
    </div>
  );
}
