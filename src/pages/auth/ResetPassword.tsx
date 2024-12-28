import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Alert } from '@/components/ui/atoms/Alert';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { supabase } from '@/lib/supabase';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/stores/auth';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const setupSession = async () => {
      try {
        // Try to get token from URL search params first
        let token = searchParams.get('token');
        let type = searchParams.get('type');
        let refreshToken = '';

        // If not found, try to get from URL hash
        let hashParams: URLSearchParams | null = null;
        if (!token && location.hash) {
          hashParams = new URLSearchParams(location.hash.substring(1));
          token = hashParams.get('access_token');
          type = hashParams.get('type');
          refreshToken = hashParams.get('refresh_token') || '';
        }

        console.log('Reset Password - URL Parameters:', {
          token,
          type,
          fullUrl: window.location.href,
          searchParams: Object.fromEntries(searchParams.entries()),
          hash: location.hash,
        });

        if (!token) {
          throw new Error('No recovery token found in URL');
        }

        // If we got the token from hash, we already have a session
        if (hashParams) {
          console.log('Reset Password - Using hash token directly');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Reset Password - Session setup error:', sessionError);
            throw sessionError;
          }
        } else {
          // Exchange the token for a session
          console.log('Reset Password - Exchanging token...');
          const { data, error: exchangeError } = await supabase.auth.verifyOtp({
            token,
            type: 'recovery',
          });

          if (exchangeError) {
            console.error('Reset Password - Token exchange error:', exchangeError);
            throw exchangeError;
          }

          if (!data.session) {
            console.error('Reset Password - No session returned');
            throw new Error('No session returned from token exchange');
          }

          console.log('Reset Password - Token exchanged successfully');

          // Set up the session
          console.log('Reset Password - Setting up session...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          if (sessionError) {
            console.error('Reset Password - Session setup error:', sessionError);
            throw sessionError;
          }
        }

        console.log('Reset Password - Session setup complete');
        setIsProcessing(false);
      } catch (err) {
        console.error('Reset Password - Setup error:', err);
        navigate('/login', {
          replace: true,
          state: { 
            message: 'Invalid or expired password reset link. Please request a new one.',
            type: 'error'
          }
        });
      }
    };

    setupSession();
  }, [navigate, searchParams, location.hash]);

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

      if (updateError) throw updateError;

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

  if (isProcessing) {
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
