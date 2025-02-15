/**
 * Community Login/Signup Page
 *
 * This page handles authentication for community members and employers:
 * 1. Public Signup: New users can join a community
 * 2. Member Login: Existing members can log in
 *
 * Features:
 * - Email/Password and Magic link authentication
 * - Community branding/customization
 * - Access control
 * - Rate limiting
 * - Error handling
 */

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCommunityCustomization } from '@/hooks/useCommunityCustomization';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/lib/utils/types';

import { Spinner } from '@/components/ui/atoms/Spinner';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { ErrorBoundary } from '@/components/ui/atoms/ErrorBoundary';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signupSchema = loginSchema.extend({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must contain at least one special character'
    ),
  confirmPassword: z.string(),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

interface CommunityLoginPageProps {
  communitySlug?: string;
}

export function CommunityLoginPage({ communitySlug }: CommunityLoginPageProps) {
  const navigate = useNavigate();
  const {
    signInWithPassword,
    signUpWithPassword,
    isLoading: authLoading,
  } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get community slug from props or subdomain
  const params = new URLSearchParams(window.location.search);
  const slug = communitySlug || params.get('subdomain') || '';
  const path = params.get('path') || '/';

  const {
    customization,
    isLoading: customizationLoading,
    error: customizationError,
  } = useCommunityCustomization(slug);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
    mode: 'onChange',
  });

  if (!slug) {
    return <Navigate to="/login" replace />;
  }

  if (customizationLoading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner data-testid="spinner" />
      </div>
    );
  }

  if (customizationError) {
    console.error('Error loading community customization:', customizationError);
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async (data: SignupFormData | LoginFormData) => {
    try {
      setError(null);

      if (!customization) {
        throw new Error('Community not found');
      }

      if (isSignup) {
        const signupData = data as SignupFormData;
        if (signupData.password !== signupData.confirmPassword) {
          setError("Passwords don't match");
          return;
        }

        const { error: signupError } = await signUpWithPassword({
          email: signupData.email,
          password: signupData.password,
          options: {
            data: {
              firstName: signupData.firstName,
              lastName: signupData.lastName,
              role: UserRole.MEMBER,
              communitySlug: slug,
            },
          },
        });

        if (signupError) throw signupError;
        navigate('/auth/verify');
      } else {
        const loginData = data as LoginFormData;
        const { error: loginError } = await signInWithPassword({
          email: loginData.email,
          password: loginData.password,
        });

        if (loginError) throw loginError;
        navigate(path);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <ErrorBoundary>
      <div
        className="flex min-h-screen flex-col md:flex-row items-center justify-center"
        style={{ backgroundColor: customization?.backgroundColor || '#fff' }}
      >
        {/* Side Image */}
        {customization?.sideImageUrl && (
          <div className="hidden md:block w-1/2 h-screen">
            <img
              src={customization.sideImageUrl}
              alt="Login side image"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Login/Signup Form */}
        <div
          className={`w-full ${
            customization?.sideImageUrl ? 'md:w-1/2' : ''
          } h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8`}
        >
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            {customization?.logoUrl && (
              <div className="flex justify-center">
                <img
                  src={customization.logoUrl}
                  alt="Community logo"
                  className="h-12 w-auto"
                />
              </div>
            )}

            <div className="text-center">
              <h2
                className="mt-6 text-3xl font-bold tracking-tight"
                style={{ color: customization?.textColor || '#000' }}
              >
                {isSignup
                  ? 'Join the Community'
                  : customization?.title || 'Welcome Back'}
              </h2>
              <p
                className="mt-2 text-sm"
                style={{ color: customization?.textColor || '#000' }}
              >
                {isSignup
                  ? 'Create your account'
                  : customization?.subtitle || 'Sign in to your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {isSignup && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="First Name"
                      {...register('firstName')}
                      error={errors.firstName?.message}
                      data-testid="firstName-input"
                    />
                  </div>
                  <div>
                    <Input
                      label="Last Name"
                      {...register('lastName')}
                      error={errors.lastName?.message}
                      data-testid="lastName-input"
                    />
                  </div>
                </div>
              )}

              <div>
                <Input
                  label="Email"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  data-testid="email-input"
                />
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  {...register('password')}
                  error={errors.password?.message}
                  data-testid="password-input"
                />
              </div>

              {isSignup && (
                <div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                    data-testid="confirmPassword-input"
                  />
                </div>
              )}

              {error && (
                <div
                  className="text-red-500 text-sm text-center"
                  data-testid="error-message"
                >
                  {error}
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  data-testid="submit-button"
                  isLoading={authLoading}
                >
                  {isSignup ? 'Create Account' : 'Sign In'}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError(null);
                    reset();
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {isSignup
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
