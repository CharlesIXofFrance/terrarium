import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Alert } from '@/components/ui/atoms/Alert';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { supabase } from '@/lib/supabase';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const setupRecovery = async () => {
      try {
        console.log('Reset Password - Full URL:', window.location.href);

        // Get recovery token from URL hash
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const token = hashParams.get('access_token');
        const type = hashParams.get('type');

        console.log(
          'Reset Password - Hash Params:',
          Object.fromEntries(hashParams.entries())
        );

        if (!token || type !== 'recovery') {
          throw new Error('Invalid reset password link');
        }

        setRecoveryToken(token);
      } catch (error) {
        console.error('Reset Password - Setup error:', error);
        navigate('/login', {
          replace: true,
          state: {
            message: 'Please use the password reset link from your email.',
            type: 'error',
          },
        });
      }
    };

    setupRecovery();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!recoveryToken) {
      setError('Reset session expired. Please request a new reset link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Exchange the recovery token for a session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(recoveryToken);

      if (sessionError) throw sessionError;

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      // Sign out after password update
      await supabase.auth.signOut();

      // After successful password update, redirect to login
      navigate('/login', {
        replace: true,
        state: {
          message:
            'Password updated successfully. Please log in with your new password.',
          type: 'success',
        },
      });
    } catch (error) {
      console.error('Reset Password - Update error:', error);
      setError('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!recoveryToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Setting up your password reset...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Globe2 className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} />
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="password-input"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm new password
              </label>
              <div className="mt-1">
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="confirm-password-input"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                data-testid="submit-button"
              >
                Update password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
