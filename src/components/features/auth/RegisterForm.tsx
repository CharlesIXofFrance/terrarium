import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/atoms/Alert';
import { supabase } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

interface RegisterFormProps {
  onSuccess: (data: { user: any; session: any }) => void;
}

interface RegisterFormComponentProps extends RegisterFormProps {
  supabaseClient?: SupabaseClient;
}

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = ({
  onSuccess,
  supabaseClient,
}: RegisterFormComponentProps) => {
  const client = supabaseClient || supabase;
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

  const handleRegister = async (formData: RegisterFormData) => {
    setError(null);
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setErrorHook('confirmPassword', { message: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    try {
      // Attempt signUp with Supabase
      const { data, error } = await client.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: 'owner',
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        setError(error.message || 'Failed to create user account');
        return;
      }

      if (data?.user) {
        // Create profile if we have a user
        const { error: profileError } = await client.from('profiles').insert([
          {
            id: data.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: 'owner',
          },
        ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          setError('Failed to create user profile');
          return;
        }

        // Call onSuccess with the user and session data
        onSuccess({ user: data.user, session: data.session });
        setIsConfirmationSent(true);
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
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
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <Input
                id="first_name"
                {...register('firstName')}
                type="text"
                placeholder="John"
                required
                data-testid="first-name-input"
              />
              {errors.firstName && (
                <p
                  className="mt-1 text-sm text-red-600"
                  data-testid="first-name-error"
                >
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="relative">
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <Input
                id="last_name"
                {...register('lastName')}
                type="text"
                placeholder="Doe"
                required
                data-testid="last-name-input"
              />
              {errors.lastName && (
                <p
                  className="mt-1 text-sm text-red-600"
                  data-testid="last-name-error"
                >
                  {errors.lastName.message}
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
              {errors.email && (
                <p
                  className="mt-1 text-sm text-red-600"
                  data-testid="email-error"
                >
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
              {errors.password && (
                <p
                  className="mt-1 text-sm text-red-600"
                  data-testid="password-error"
                >
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
              {errors.confirmPassword && (
                <p
                  className="mt-1 text-sm text-red-600"
                  data-testid="confirm-password-error"
                >
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
};

export default RegisterForm;
