import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { supabase } from '@/lib/supabase';
import { Alert } from '@/components/ui/atoms/Alert';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { userAtom } from '@/lib/stores/auth';

export function ResetPasswordCallback() {
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [, setUser] = useAtom(userAtom);

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Parse the hash parameters
        const hashParams = new URLSearchParams(location.hash.substring(1));
        
        // Get the access token and type from hash params
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (!access_token || type !== 'recovery') {
          throw new Error('Invalid or missing recovery token');
        }

        // Set the session with the recovery token
        const { data: { session, user }, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || '',
        });

        if (sessionError) {
          throw sessionError;
        }

        if (!session || !user) {
          throw new Error('Failed to establish session');
        }

        // Set the user in our global state
        setUser(user);

        // Get user's profile and community info
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        // Navigate to the reset password form
        navigate('/reset-password', { replace: true });
      } catch (err) {
        console.error('Password reset error:', err);
        setError(err instanceof Error ? err.message : 'Failed to process password reset');
      }
    };

    handlePasswordReset();
  }, [location.hash, navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Alert type="error" message={error} />
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">Processing your password reset...</p>
    </div>
  );
}
