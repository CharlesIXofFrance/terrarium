import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SupabaseClient } from '@supabase/supabase-js';
import { Input } from '../../ui/atoms/Input';
import { Button } from '../../ui/atoms/Button';
import { Alert } from '../../ui/atoms/Alert';
import { supabase } from '../../../lib/supabase';
import { parseDomain } from '@/lib/utils/subdomain';

interface LoginFormProps {
  onSuccess: (data: { user: any; session: any }) => void;
  supabaseClient?: SupabaseClient;
}

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  supabaseClient = supabase,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const handleLogin = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      // Get hostname and subdomain
      const { hostname } = window.location;
      const { subdomain } = parseDomain();

      // Get community slug - try different sources
      const communitySlug =
        hostname === 'localhost' || hostname === '127.0.0.1'
          ? searchParams.get('subdomain') || '' // Get from URL in localhost
          : hostname.includes('localhost')
            ? subdomain
            : hostname.split('.')[0];

      // Clean the slug - remove any path components
      const cleanSlug = communitySlug.split('/')[0];

      // Construct callback URL
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('subdomain', cleanSlug);

      const { data: authData, error: authError } =
        await supabaseClient!.auth.signInWithPassword({
          email: data.email,
          password: data.password,
          options: {
            redirectTo: callbackUrl.toString(),
          },
        });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user && authData.session) {
        onSuccess({ user: authData.user, session: authData.session });
      }
    } catch (err) {
      if (err instanceof Error) {
        // Handle rate limit errors
        if (
          err.name === 'AuthenticationError' &&
          err.message.includes('Too many requests')
        ) {
          setError('Too many login attempts. Please try again later.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            data-testid="email-input"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <Input
            id="password"
            name="password"
            type="password"
            data-testid="password-input"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          data-testid="submit-button"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
    </form>
  );
};
