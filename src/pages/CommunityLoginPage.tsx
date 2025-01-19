/**
 * AI Context:
 * This component implements the community-specific login page feature. It's located in the pages directory
 * because it represents a full page that's directly tied to a route (/c/:slug/login).
 *
 * The page:
 * 1. Loads community-specific branding (logo, colors, text) using the useCommunityCustomization hook
 * 2. Provides a login form with email/password fields and proper validation
 * 3. Handles authentication through Supabase
 * 4. Shows appropriate loading and error states
 *
 * It's placed in pages/ rather than features/ because it's a complete, routable page rather than
 * a reusable feature component. The actual login form could potentially be extracted into a
 * separate component in features/ if it needs to be reused.
 */

import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCommunityCustomization } from '../hooks/useCommunityCustomization';
import { supabase } from '../lib/supabase';
import { Spinner } from '../components/ui/atoms/Spinner';
import { Button } from '../components/ui/atoms/Button';
import type { Role } from '@/backend/types/rbac.types';

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
  } = useForm<SignupFormData>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      if (isSignup) {
        // Sign up with email verification
        const { error } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            emailRedirectTo: `${window.location.origin}/?subdomain=${slug}/onboarding`,
            data: {
              first_name: data.first_name,
              last_name: data.last_name,
              role: 'member' as Role, // Explicitly type as Role
              email: data.email,
              profile_complete: false,
            },
          },
        });

        if (error) {
          setError('root', { message: error.message });
        } else {
          setVerificationSent(true);
        }
      } else {
        // For login, first check if the user exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.email)
          .single();

        if (existingUser) {
          // User exists, send magic link
          const { error } = await supabase.auth.signInWithOtp({
            email: data.email,
            options: {
              emailRedirectTo: `${window.location.origin}/?subdomain=${slug}`,
            },
          });

          if (error) {
            setError('root', { message: error.message });
          }
        }

        // Always show verification sent message for privacy
        setVerificationSent(true);
      }
    } catch (error) {
      setError('root', { message: 'An unexpected error occurred' });
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
                We've sent you a verification code. Please check your email and
                enter the code to{' '}
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
                  onClick={() => setIsSignup(!isSignup)}
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
