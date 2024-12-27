import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SupabaseClient } from '@supabase/supabase-js';
import { Input } from '../../ui/atoms/Input';
import { Button } from '../../ui/atoms/Button';
import { Alert } from '../../ui/atoms/Alert';
import { supabase } from '../../../lib/supabase';

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

  const handleLogin = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabaseClient!.auth.signInWithPassword({
          email: data.email,
          password: data.password,
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
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin({ email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      data-testid="login-form"
    >
      {error && (
        <Alert
          message={error}
          onRetry={() => setError(null)}
          data-testid="error-message"
        />
      )}

      <div>
        <div className="relative">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="email-input"
          />
        </div>
      </div>

      <div>
        <div className="relative">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="password-input"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Forgot password?
        </Link>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-[6px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#0F4C75] text-white hover:bg-[#0D3D5F] focus-visible:ring-[#0F4C75] h-10 px-6 py-3 w-full"
          data-testid="submit-button"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>

      <div className="text-center">
        <span className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </span>
      </div>
    </form>
  );
};
