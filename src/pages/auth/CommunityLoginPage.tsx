/**
 * Community Login/Signup Page
 *
 * This page handles authentication for community members and employers:
 * 1. Public Signup: New users can join a community
 * 2. Member Login: Existing members can log in
 *
 * Features:
 * - Magic link authentication (passwordless)
 * - Community branding/customization
 * - Access control
 * - Rate limiting
 * - Error handling
 */

import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCommunityCustomization } from '@/hooks/useCommunityCustomization';
import { supabase } from '@/lib/supabase';
import { memberAuth } from '@/services/auth';
import { UserRole } from '@/lib/utils/types';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { Button } from '@/components/ui/atoms/Button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const signupSchema = loginSchema.extend({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface CommunityLoginPageProps {
  communitySlug?: string;
}

export function CommunityLoginPage({ communitySlug }: CommunityLoginPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  // Get community slug from props or subdomain
  const params = new URLSearchParams(window.location.search);
  const subdomainParam = params.get('subdomain') || '';
  const [community] = subdomainParam.split('/');
  const slug = communitySlug || community;

  const {
    customization,
    isLoading,
    error: customizationError,
  } = useCommunityCustomization(slug);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      // Get community ID
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('id, name')
        .eq('slug', slug)
        .single();

      if (communityError || !community) {
        throw new Error('Community not found');
      }

      if (isSignup) {
        const result = await memberAuth.signUp({
          email: data.email.toLowerCase().trim(),
          firstName: data.first_name,
          lastName: data.last_name,
          role: UserRole.MEMBER,
          communityId: community.id,
        });

        if (!result.success) {
          throw result.error || new Error('Failed to sign up');
        }
      } else {
        const result = await memberAuth.signIn({
          email: data.email.toLowerCase().trim(),
          role: UserRole.MEMBER,
          communityId: community.id,
        });

        if (!result.success) {
          throw result.error || new Error('Failed to sign in');
        }
      }

      setVerificationSent(true);
      reset(); // Clear form after successful submission
    } catch (error) {
      console.error('Auth error:', error);
      setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!slug) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
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

  return (
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

          {verificationSent ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
              <p className="text-gray-600">
                We've sent you a verification link. Please check your email to{' '}
                {isSignup ? 'complete your registration' : 'sign in'}.
              </p>
            </div>
          ) : (
            <>
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

              <form
                className="mt-8 space-y-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                {errors.root && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-700">
                      {errors.root.message}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {isSignup && (
                    <>
                      <div>
                        <label
                          htmlFor="first_name"
                          className="block text-sm font-medium"
                          style={{ color: customization?.textColor || '#000' }}
                        >
                          First Name
                        </label>
                        <input
                          {...register('first_name')}
                          type="text"
                          id="first_name"
                          disabled={isSubmitting}
                          className="mt-1 relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="First Name"
                        />
                        {errors.first_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="last_name"
                          className="block text-sm font-medium"
                          style={{ color: customization?.textColor || '#000' }}
                        >
                          Last Name
                        </label>
                        <input
                          {...register('last_name')}
                          type="text"
                          id="last_name"
                          disabled={isSubmitting}
                          className="mt-1 relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="Last Name"
                        />
                        {errors.last_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium"
                      style={{ color: customization?.textColor || '#000' }}
                    >
                      Email address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      disabled={isSubmitting}
                      className="mt-1 relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="Email address"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Spinner className="h-5 w-5" />
                    ) : isSignup ? (
                      'Sign Up'
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </div>
              </form>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    reset(); // Clear form when switching modes
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {isSignup
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
