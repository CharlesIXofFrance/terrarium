import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Alert } from '@/components/ui/atoms/Alert';
import { Spinner } from '@/components/ui/atoms/Spinner';

export function ResetPasswordCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Get the access token and type from URL params
        const access_token = searchParams.get('access_token');
        const type = searchParams.get('type');

        if (!access_token || type !== 'recovery') {
          throw new Error('Invalid or missing recovery token');
        }

        // Set the session with the recovery token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token: searchParams.get('refresh_token') || '',
        });

        if (sessionError) {
          throw sessionError;
        }

        // Navigate to the reset password form
        navigate('/reset-password');
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
