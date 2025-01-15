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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface CommunityLoginPageProps {
  communitySlug?: string;
}

export function CommunityLoginPage({ communitySlug }: CommunityLoginPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setError('root', {
          message: error.message,
        });
      } else {
        // Navigate to dashboard on successful login
        navigate(`/c/${slug}/dashboard`);
      }
    } catch (error) {
      setError('root', {
        message: 'An unexpected error occurred',
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

      {/* Login Form */}
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
              {customization?.title || 'Welcome Back'}
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: customization?.textColor || '#000' }}
            >
              {customization?.subtitle || 'Sign in to your account'}
            </p>
            {customization?.welcomeMessage && (
              <p
                className="mt-4 text-sm"
                style={{ color: customization?.textColor || '#000' }}
              >
                {customization.welcomeMessage}
              </p>
            )}
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errors.root && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{errors.root.message}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="sr-only"
                  style={{ color: customization?.textColor || '#000' }}
                >
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  disabled={isSubmitting}
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="sr-only"
                  style={{ color: customization?.textColor || '#000' }}
                >
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  disabled={isSubmitting}
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {isSubmitting ? (
                  <Spinner data-testid="spinner" className="h-5 w-5" />
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
