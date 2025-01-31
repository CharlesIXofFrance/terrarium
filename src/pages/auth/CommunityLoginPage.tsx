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
import { UserRole } from '@/lib/utils/types';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const signupSchema = loginSchema.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get community slug from props or subdomain
  const params = new URLSearchParams(window.location.search);
  const slug = communitySlug || params.get('subdomain') || '';
  const path = params.get('path') || '/';

  const {
    customization,
    isLoading,
    error: customizationError,
  } = useCommunityCustomization(slug);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
  });

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

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Get community data first
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('id, name, slug')
        .eq('slug', slug)
        .single();

      if (communityError || !community) {
        throw new Error(communityError?.message || 'Community not found');
      }

      // Build clean callback URL
      const callbackUrl = new URL(
        `/auth/callback?subdomain=${encodeURIComponent(community.slug)}`,
        window.location.origin
      );

      // Add type and simple next path
      callbackUrl.searchParams.set('type', 'signup');
      if (path && path !== '/login') {
        callbackUrl.searchParams.set('next', encodeURIComponent(path));
      }

      console.log('Sending magic link with URL:', callbackUrl.toString());

      // Auth call with proper metadata
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: callbackUrl.toString(),
          data: {
            first_name: isSignup ? data.firstName : undefined,
            last_name: isSignup ? data.lastName : undefined,
            role: UserRole.MEMBER,
            community_id: community.id,
            community_slug: community.slug,
            community_name: community.name,
            is_new_user: isSignup,
          },
          shouldCreateUser: isSignup,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      setVerificationSent(true);
    } catch (err) {
      console.error('Authentication error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to send magic link'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <div className="text-center">
            <h2
              className="mt-6 text-3xl font-bold tracking-tight"
              style={{ color: customization?.textColor || '#000' }}
            >
              {verificationSent
                ? 'Check your email'
                : isSignup
                  ? 'Join the Community'
                  : customization?.title || 'Welcome Back'}
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: customization?.textColor || '#000' }}
            >
              {verificationSent
                ? 'We sent you a magic link to sign in'
                : isSignup
                  ? 'Create your account'
                  : customization?.subtitle || 'Sign in to your account'}
            </p>
          </div>

          {verificationSent ? (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Click the link in your email to sign in. If you don't see it,
                check your spam folder.
              </p>
              <button
                type="button"
                onClick={() => {
                  setVerificationSent(false);
                  setError(null);
                  reset();
                }}
                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Try again with a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {isSignup && (
                  <>
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
                      />
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
                      />
                    </div>
                  </>
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
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting}
              >
                {isSubmitting
                  ? 'Sending...'
                  : isSignup
                    ? 'Create Account'
                    : 'Sign In'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError(null);
                    reset();
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {isSignup
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
