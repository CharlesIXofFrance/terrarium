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
        // Get token and type from URL params (email link format)
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const redirectTo = searchParams.get('redirect_to');

        // Log the values for debugging
        console.log('Token:', token);
        console.log('Type:', type);
        console.log('Redirect To:', redirectTo);

        if (!token) {
          throw new Error('No recovery token found in URL');
        }

        // Exchange the token for a session
        const { data, error: exchangeError } = await supabase.auth.verifyOtp({
          token,
          type: 'recovery',
        });

        if (exchangeError) {
          console.error('Token exchange error:', exchangeError);
          throw exchangeError;
        }

        if (!data.session) {
          console.error('No session returned');
          throw new Error('No session returned from token exchange');
        }

        // Store the access token for the reset password page
        sessionStorage.setItem('resetPasswordToken', data.session.access_token);
        sessionStorage.setItem('resetPasswordType', 'recovery');

        // Navigate to the reset password form
        navigate('/reset-password', { replace: true });
      } catch (err) {
        console.error('Password reset error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to process password reset'
        );
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
              onClick={() => navigate('/forgot-password', { replace: true })}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Try requesting a new reset link
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
