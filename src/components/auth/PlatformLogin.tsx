import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { mapAuthError } from '@/lib/utils/errors';
import MFAForm from '@/components/auth/MFAForm';

const PlatformLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithPassword, mfaState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [showMFA, setShowMFA] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Too many attempts')) {
          setIsRateLimited(true);
        }

        // Check if MFA is required - simplified check
        if (error.message === 'MFA required') {
          setShowMFA(true);
          setIsLoading(false);
          return;
        }

        setError(mapAuthError(error));
        setIsLoading(false);
        return;
      }

      // If MFA is not required, redirect to dashboard
      if (!mfaState.isRequired) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? mapAuthError(err)
          : 'An unexpected error occurred'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {showMFA ? (
        <div data-testid="mfa-form" className="space-y-4">
          <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
          <p className="text-sm text-gray-600">
            Please enter your authentication code to continue.
          </p>
          <MFAForm onSuccess={() => navigate('/dashboard')} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {error && (
            <div
              role="alert"
              data-testid="error-message"
              className="text-red-500 text-sm"
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            data-testid="submit-button"
            disabled={isLoading || isRateLimited}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              (isLoading || isRateLimited) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PlatformLogin;
