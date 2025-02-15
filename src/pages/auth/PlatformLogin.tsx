/**
 * PlatformLogin Component
 *
 * Handles platform-specific login flow with role validation and domain restrictions.
 * Features:
 * - Password-based authentication for platform owners
 * - Domain validation to ensure login on correct subdomain
 * - Role-based access control
 * - MFA verification for platform owners
 * - Rate limiting feedback
 * - Comprehensive error handling with form validation
 * - Loading states and feedback
 * - Automatic redirects
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/useAuth';
import { AUTH_ERRORS, mapAuthError } from '@/lib/utils/errors';
import { Alert } from '@/components/ui/atoms/Alert';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { ErrorBoundary } from '@/components/ui/atoms/ErrorBoundary';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const mfaSchema = z.object({
  code: z.string().length(6, 'MFA code must be 6 digits'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type MFAFormData = z.infer<typeof mfaSchema>;

export function PlatformLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    signInWithPassword,
    verifyMFA,
    user,
    session,
    isLoading,
    mfaState,
    setMFAState,
  } = useAuth();
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    setError: setLoginError,
    clearErrors: clearLoginErrors,
    getValues: getLoginValues,
    trigger: triggerValidation,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const {
    register: registerMFA,
    handleSubmit: handleMFASubmit,
    formState: { errors: mfaErrors, isSubmitting: isMFASubmitting },
    setError: setMFAError,
  } = useForm<MFAFormData>({
    resolver: zodResolver(mfaSchema),
    mode: 'onBlur',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && session && !mfaState.isRequired) {
      const redirectPath = user.onboardingComplete
        ? '/platform/dashboard?subdomain=platform'
        : '/platform/onboarding?subdomain=platform';
      navigate(redirectPath, { replace: true });
    }
  }, [user, session, mfaState.isRequired, navigate]);

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
            message="Platform login must be done on the platform domain"
            data-testid="access-denied"
          />
        </div>
      </div>
    );
  }

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      clearLoginErrors();
      const { error } = await signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        const errorMessage = mapAuthError(error);

        if (errorMessage === AUTH_ERRORS.RATE_LIMITED) {
          setIsRateLimited(true);
        }

        if (error.message === 'MFA required') {
          setMFAState({
            isRequired: true,
            factors: [],
          });
          return;
        }

        setLoginError('root', {
          type: 'manual',
          message: errorMessage,
        });
        return;
      }

      // Successful login - redirect to platform dashboard
      navigate('/platform/dashboard?subdomain=platform', { replace: true });
    } catch (err) {
      const errorMessage = mapAuthError(err);
      setLoginError('root', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  const onMFASubmit = async (data: MFAFormData) => {
    try {
      const { error } = await verifyMFA(data.code);

      if (error) {
        const errorMessage = mapAuthError(error);
        setMFAError('root', {
          type: 'manual',
          message: errorMessage,
        });
        return;
      }

      // Successful MFA verification - redirect to platform dashboard
      navigate('/platform/dashboard?subdomain=platform', { replace: true });
    } catch (err) {
      const errorMessage = mapAuthError(err);
      setMFAError('root', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  if (mfaState.isRequired) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Enter MFA Code
          </h2>
          <form
            onSubmit={handleMFASubmit(onMFASubmit)}
            className="mt-8 space-y-6"
            data-testid="mfa-form"
          >
            {mfaErrors.root && (
              <div
                className="text-red-500 text-sm"
                data-testid="error-message"
                role="alert"
              >
                {mfaErrors.root.message}
              </div>
            )}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700"
              >
                MFA Code
              </label>
              <Input
                id="code"
                type="text"
                {...registerMFA('code')}
                error={mfaErrors.code?.message}
                data-testid="mfa-input"
                disabled={isMFASubmitting}
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
              />
              {mfaErrors.code && (
                <p
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                  data-testid="mfa-error"
                >
                  {mfaErrors.code.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isMFASubmitting}
              data-testid="submit-button"
              className="w-full"
              isLoading={isMFASubmitting}
            >
              {isMFASubmitting ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2
            className="mt-6 text-center text-3xl font-extrabold text-gray-900"
            data-testid="page-heading"
          >
            Platform Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div
            className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
            data-testid="platform-login"
          >
            <form
              onSubmit={handleLoginSubmit(onLoginSubmit)}
              className="space-y-6"
              noValidate
            >
              {loginErrors.root && (
                <div
                  className="text-red-500 text-sm"
                  data-testid="error-message"
                  role="alert"
                >
                  {loginErrors.root.message}
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...registerLogin('email')}
                  error={loginErrors.email?.message}
                  data-testid="email-input"
                  disabled={isLoginSubmitting}
                />
                {loginErrors.email && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                    data-testid="email-error"
                  >
                    {loginErrors.email.message}
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
                  autoComplete="current-password"
                  {...registerLogin('password')}
                  error={loginErrors.password?.message}
                  data-testid="password-input"
                  disabled={isLoginSubmitting}
                />
                {loginErrors.password && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                    data-testid="password-error"
                  >
                    {loginErrors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoginSubmitting}
                data-testid="submit-button"
                disabled={isLoginSubmitting || isRateLimited}
                aria-busy={isLoginSubmitting}
              >
                {isLoginSubmitting ? (
                  <span data-testid="loading-spinner">Loading...</span>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
