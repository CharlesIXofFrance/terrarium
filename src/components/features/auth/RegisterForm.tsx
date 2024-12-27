import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../lib/hooks/useAuth';
import { Button } from '../../ui/atoms/Button';
import { Input } from '../../ui/atoms/Input';
import { Link } from 'react-router-dom';
import { Alert } from '../../ui/atoms/Alert';
import { supabase } from '../../../lib/supabase';

interface RegisterFormProps {
  onSuccess: (data: { user: any; session: any }) => void;
  supabaseClient?: SupabaseClient;
}

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm({
  onSuccess,
  supabaseClient = supabase,
}: RegisterFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setErrorHook,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleRegister = async (data: RegisterFormData) => {
    setError(null);
    setIsLoading(true);

    if (data.password !== data.confirmPassword) {
      setErrorHook('confirmPassword', { message: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } =
        await supabaseClient!.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
            },
          },
        });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user && authData.session) {
        onSuccess({ user: authData.user, session: authData.session });
      } else {
        setIsConfirmationSent(true);
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

  return (
    <form
      onSubmit={handleSubmit(handleRegister)}
      className="space-y-6"
      data-testid="register-form"
    >
      {isConfirmationSent ? (
        <div
          data-testid="confirmation-sent"
          className="rounded-md bg-green-50 p-4"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Registration successful
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Please check your email to confirm your account.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div
              role="alert"
              className="rounded-md border p-4 bg-red-50 border-red-200"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="lucide lucide-xcircle h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6" />
                    <path d="m9 9 6 6" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}
          <div>
            <div className="relative">
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <Input
                id="full_name"
                {...register('fullName')}
                type="text"
                required
                data-testid="full-name-input"
              />
              {errors.fullName?.message && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <Input
                id="email"
                {...register('email')}
                type="email"
                required
                data-testid="email-input"
              />
              {errors.email?.message && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
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
                {...register('password')}
                type="password"
                required
                data-testid="password-input"
              />
              {errors.password?.message && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Must be at least 6 characters
              </p>
            </div>
          </div>

          <div>
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                {...register('confirmPassword')}
                type="password"
                required
                data-testid="confirm-password-input"
              />
              {errors.confirmPassword?.message && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
              data-testid="submit-button"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </span>
          </div>
        </>
      )}
    </form>
  );
}
