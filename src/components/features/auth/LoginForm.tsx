import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Session, User, AuthResponse } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Input } from '@/components/ui/atoms/Input';
import { Button } from '@/components/ui/atoms/Button';
import { Alert } from '@/components/ui/atoms/Alert';
import { supabase } from '../../../lib/supabase';
import { parseDomain } from '@/lib/utils/subdomain';
import { authLogger } from '@/lib/utils/logger';
import type { Database } from '@/lib/database.types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type DbClient = SupabaseClient<Database>;

interface LoginFormProps {
  onSuccess: (data: { user: User; session: Session }) => void;
  supabaseClient?: DbClient;
  type?: 'platform' | 'community';
}

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  supabaseClient = supabase,
  type = 'community',
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Helper function to safely extract error message
  const getErrorMessage = (error: unknown): string => {
    if (!error) return 'An unexpected error occurred';

    if (error instanceof Error) {
      return error.message || 'An unexpected error occurred';
    }

    if (typeof error === 'object' && error !== null) {
      const msg = (error as { message?: unknown }).message;
      if (typeof msg === 'string') return msg;
      if (msg) return JSON.stringify(msg);
    }

    return typeof error === 'string' ? error : 'An unexpected error occurred';
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const { data: authData, error } =
        await supabaseClient.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (error) {
        if (error.message.includes('Too many attempts')) {
          setError('Too many attempts. Please try again later.');
        } else if (error.message === 'MFA required') {
          // Handle MFA if needed
          setError('MFA authentication required');
        } else {
          setError(error.message);
        }
        return;
      }

      // Successful login - handle navigation in parent component
      if (onSuccess && authData?.user && authData?.session) {
        onSuccess({ user: authData.user, session: authData.session });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      data-testid="login-form"
    >
      {error && (
        <Alert variant="error" message={error} data-testid="error-message" />
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
            {...register('email')}
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            data-testid="email-input"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.email && (
            <p
              id="email-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
              data-testid="email-error"
            >
              {errors.email.message}
            </p>
          )}
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
            {...register('password')}
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            data-testid="password-input"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.password && (
            <p
              id="password-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
              data-testid="password-error"
            >
              {errors.password.message}
            </p>
          )}
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
          isLoading={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
