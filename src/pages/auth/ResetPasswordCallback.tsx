import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert } from '@/components/ui/atoms/Alert';
import { Spinner } from '@/components/ui/atoms/Spinner';

export function ResetPasswordCallback() {
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Parse the hash parameters
        const hashParams = new URLSearchParams(location.hash.substring(1));
        
        // Get the access token and type from hash params
        const access_token = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (!access_token || type !== 'recovery') {
          throw new Error('Invalid or missing recovery token');
        }

        // Store the tokens in sessionStorage for the reset password page
        sessionStorage.setItem('resetPasswordToken', access_token);
        sessionStorage.setItem('resetPasswordType', type);

        // Navigate to the reset password form
        navigate('/reset-password', { replace: true });
      } catch (err) {
        console.error('Password reset error:', err);
        setError(err instanceof Error ? err.message : 'Failed to process password reset');
      }
    };

    handlePasswordReset();
  }, [location.hash, navigate]);

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
