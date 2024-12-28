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

        if (!token || type !== 'recovery') {
          throw new Error('Invalid or missing recovery token');
        }

        // Exchange the token for a session
        const { data, error: exchangeError } = await supabase.auth.verifyOtp({
          token,
          type: 'recovery',
        });

        if (exchangeError) throw exchangeError;
        if (!data.session) throw new Error('No session returned from token exchange');

        // Store the access token for the reset password page
        sessionStorage.setItem('resetPasswordToken', data.session.access_token);
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
