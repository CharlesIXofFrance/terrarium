import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Alert } from '@/components/ui/atoms/Alert';
import { supabase } from '@/lib/supabase';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/stores/auth';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for reset password token
    const token = sessionStorage.getItem('resetPasswordToken');
    const type = sessionStorage.getItem('resetPasswordType');

    if (!token || type !== 'recovery') {
      navigate('/login', {
        replace: true,
        state: { 
          message: 'Invalid or expired password reset link. Please request a new one.',
          type: 'error'
        }
      });
      return;
    }

    // Set up the session with the recovery token
    const setupSession = async () => {
      try {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: '',
        });

        if (sessionError) {
          throw sessionError;
        }
      } catch (err) {
        console.error('Session setup error:', err);
        navigate('/login', {
          replace: true,
          state: { 
            message: 'Failed to set up password reset session. Please try again.',
            type: 'error'
          }
        });
      }
    };

    setupSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      // Clear the reset password tokens
      sessionStorage.removeItem('resetPasswordToken');
      sessionStorage.removeItem('resetPasswordType');

      // Navigate based on user state
      if (user?.community_id) {
        navigate(`/c/${user.community_id}/dashboard`, { replace: true });
      } else if (!user?.onboarding_completed) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsLoading(false);
    }
  };

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
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
