import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/useAuth';
import { AUTH_ERRORS, mapAuthError } from '@/lib/utils/errors';
import { Alert } from '@/components/ui/atoms/Alert';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { ErrorBoundary } from '@/components/ui/atoms/ErrorBoundary';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * PlatformRegister Component
 *
 * Handles platform owner registration with comprehensive validation and security.
 * Features:
 * - Strong password requirements
 * - Email verification
 * - Profile creation
 * - Role assignment
 * - Form validation with detailed feedback
 * - Loading states and error handling
 */
export function PlatformRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationSent, setVerificationSent] = useState(false);
  const { signUpWithPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  // Platform domain validation
  const isPlatformDomain =
    process.env.NODE_ENV === 'test' ||
    searchParams.get('subdomain') === 'platform';

  if (!isPlatformDomain) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Alert
            variant="error"
            title="Access Denied"
            message="Platform registration must be done on the platform domain"
            data-testid="access-denied"
          />
        </div>
      </div>
    );
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { error } = await signUpWithPassword({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'owner',
          },
        },
      });

      if (error) {
        if (
          (error as any).status === 422 ||
          error.message === AUTH_ERRORS.USER_EXISTS
        ) {
          setError('email', {
            type: 'manual',
            message: AUTH_ERRORS.USER_EXISTS,
          });
          return;
        }

        setError('root', {
          type: 'manual',
          message: mapAuthError(error),
        });
        return;
      }

      setVerificationSent(true);
      navigate('/platform/verify', { replace: true });
    } catch (err) {
      const errorMessage = mapAuthError(err as Error);
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Alert
            variant="success"
            title="Verification Email Sent"
            message="Please check your email to verify your account"
            data-testid="verification-sent"
          />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
        data-testid="platform-register"
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your platform account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              {errors.root && (
                <div
                  className="text-red-500 text-sm"
                  data-testid="error-message"
                  role="alert"
                >
                  {errors.root.message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    {...register('firstName')}
                    error={errors.firstName?.message}
                    data-testid="firstName-input"
                  />
                  {errors.firstName && (
                    <p
                      className="mt-1 text-sm text-red-600"
                      role="alert"
                      data-testid="firstName-error"
                    >
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    {...register('lastName')}
                    error={errors.lastName?.message}
                    data-testid="lastName-input"
                  />
                  {errors.lastName && (
                    <p
                      className="mt-1 text-sm text-red-600"
                      role="alert"
                      data-testid="lastName-error"
                    >
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  error={errors.email?.message}
                  data-testid="email-input"
                />
                {errors.email && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                    data-testid="email-error"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  error={errors.password?.message}
                  data-testid="password-input"
                />
                {errors.password && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                    data-testid="password-error"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  data-testid="confirmPassword-input"
                />
                {errors.confirmPassword && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                    data-testid="confirmPassword-error"
                  >
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="submit-button"
                className="w-full"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
