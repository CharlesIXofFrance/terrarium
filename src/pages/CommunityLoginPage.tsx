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

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCommunityCustomization } from '../hooks/useCommunityCustomization';
import { supabase } from '../lib/supabase';
import type { Community } from '../lib/utils/community';
import { parseDomain } from '../lib/utils/subdomain';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type LoginCustomization = NonNullable<Community['settings']['login_customization']>;

interface CommunityLoginPageProps {
  communitySlug?: string;
}

export function CommunityLoginPage({ communitySlug }: CommunityLoginPageProps) {
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
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setError('root', {
          message: error.message,
        });
      }
    } catch (error) {
      setError('root', {
        message: 'An unexpected error occurred',
      });
    }
  };

  if (!slug) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (customizationError) {
    console.error('Error loading community customization:', customizationError);
  }

  const {
    logoUrl,
    colorScheme,
    customText,
  } = customization;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
      style={{ backgroundColor: colorScheme.background }}
    >
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src={logoUrl}
            alt="Community Logo"
            className="mx-auto h-12 w-auto"
          />
          <h2
            className="mt-6 text-3xl font-bold tracking-tight"
            style={{ color: colorScheme.primary }}
          >
            {customText.headline}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{customText.subHeadline}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{errors.root.message}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: colorScheme.secondary,
              }}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
