import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Alert } from '@/components/ui/atoms/Alert';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { AuthErrorBoundary } from '@/components/features/auth/AuthErrorBoundary';

export function ResetPasswordCallbackContent() {
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        console.log('Hash:', location.hash);
        // Parse the hash parameters
        const hashParams = new URLSearchParams(location.hash.replace('#', '?'));
        
        // Get the access token and type from hash params
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Parsed params:', { access_token, refresh_token, type });

        if (!access_token || type !== 'recovery') {
          throw new Error('Invalid or missing recovery token');
        }

        // Set the session with the recovery token
        console.log('Setting session...');
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || '',
        });

        console.log('Session response:', { data, error: sessionError });

        if (sessionError) {
          throw sessionError;
        }

        // Navigate to the reset password form
        console.log('Navigating to reset password form...');
        navigate('/reset-password', { replace: true });
      } catch (err) {
        console.error('Password reset error:', err);
        setError(err instanceof Error ? err.message : 'Failed to process password reset');
      } finally {
        setIsLoading(false);
      }
    };

    if (location.hash) {
      handlePasswordReset();
    } else {
      setError('No reset token found. Please request a new password reset link.');
      setIsLoading(false);
    }
  }, [location.hash, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Alert type="error" message={error} />
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Request new reset link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Processing your password reset...</p>
      </div>
    );
  }

  return null;
}

export function ResetPasswordCallback() {
  return (
    <AuthErrorBoundary>
      <ResetPasswordCallbackContent />
    </AuthErrorBoundary>
  );
}
