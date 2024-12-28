import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '@/components/ui/atoms/Alert';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { supabase } from '@/lib/supabase';

export function ResetPasswordCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Log URL parameters for debugging
        console.log('URL Parameters:', Object.fromEntries(searchParams.entries()));
        console.log('Full URL:', window.location.href);

        // Get token from various possible locations
        let token = searchParams.get('token') || searchParams.get('access_token');
        let type = searchParams.get('type') || 'recovery';

        if (!token) {
          // Try to get from hash if not in search params
          const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
          token = hashParams.get('access_token');
          type = hashParams.get('type') || type;
        }

        if (!token) {
          throw new Error('Invalid or missing recovery token');
        }

        // Exchange the token for a session if it's not an access token
        if (type === 'recovery' && !token.startsWith('ey')) {
          const { data, error: exchangeError } = await supabase.auth.verifyOtp({
            token,
            type: 'recovery',
          });

          if (exchangeError) throw exchangeError;
          if (!data.session) throw new Error('No session returned from token exchange');

          // Use the session token
          token = data.session.access_token;
        }

        // Store the access token for the reset password page
        sessionStorage.setItem('resetPasswordToken', token);
        sessionStorage.setItem('resetPasswordType', 'recovery');

        // Navigate to the reset password form
        navigate('/reset-password', { replace: true });
      } catch (err) {
        console.error('Password reset error:', err);
        setError(err instanceof Error ? err.message : 'Failed to process password reset');
      }
    };

    handlePasswordReset();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Alert type="error" message={error} />
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
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
