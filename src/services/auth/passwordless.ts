/**
 * Passwordless authentication service for members and employers.
 * Uses magic links for a seamless sign-in experience.
 */

import { supabase } from '@/lib/supabase';
import { AuthResult, BaseAuthService } from './base';
import { User, UserRole } from '@/lib/utils/types';

interface PasswordlessSignUpData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  communityId?: string;
}

interface PasswordlessSignInData {
  email: string;
  role: UserRole;
  communityId?: string;
}

export class PasswordlessAuthService extends BaseAuthService {
  async signUp(data: PasswordlessSignUpData): Promise<AuthResult> {
    try {
      const email = data.email.toLowerCase().trim();
      console.log('Signing up with data:', { ...data, email });

      // Get the current community from the hostname
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      const communitySlug = isLocalhost
        ? new URLSearchParams(window.location.search).get('subdomain') || '' // Get from URL in localhost
        : hostname.includes('localhost')
          ? subdomain
          : hostname.split('.')[0];

      // Create user with email confirmation enabled
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password: crypto.randomUUID(), // Random password since we're using OTP
          options: {
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
              role: data.role,
              communitySlug: communitySlug, // Store the slug in metadata
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?subdomain=${communitySlug}`,
          },
        }
      );

      console.log('Auth response:', { data: authData, error: signUpError });

      if (signUpError) {
        console.error('Auth error details:', {
          name: signUpError.name,
          message: signUpError.message,
          status: signUpError.status,
          stack: signUpError.stack,
        });
        throw signUpError;
      }

      // Check if user was created
      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      return {
        success: true,
        message: 'Check your email for the confirmation link',
        data: {
          id: authData.user.id,
          email: authData.user.email,
        },
      };
    } catch (error) {
      console.error('Error in passwordless signUp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sign up',
        error,
      };
    }
  }

  async signIn(data: PasswordlessSignInData): Promise<AuthResult> {
    try {
      const email = data.email.toLowerCase().trim();
      console.log('Signing in with data:', { ...data, email });

      // Get the current community from the hostname
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      const communitySlug = isLocalhost
        ? new URLSearchParams(window.location.search).get('subdomain') || '' // Get from URL in localhost
        : hostname.includes('localhost')
          ? subdomain
          : hostname.split('.')[0];

      // Send magic link
      const { data: authData, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?subdomain=${communitySlug}`,
        },
      });

      console.log('Auth response:', { data: authData, error });

      if (error) {
        console.error('Auth error details:', {
          name: error.name,
          message: error.message,
          status: error.status,
          stack: error.stack,
        });
        throw error;
      }

      return {
        success: true,
        message: 'Check your email for the magic link',
      };
    } catch (error) {
      console.error('Error in passwordless signIn:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to send magic link',
        error,
      };
    }
  }

  async completeSignIn(user: User): Promise<AuthResult> {
    try {
      console.log('Completing sign in for user:', user.id);

      // First try to get community from user metadata
      let communitySlug = user.user_metadata?.communitySlug;

      // If not in metadata, try URL params
      if (!communitySlug) {
        const params = new URLSearchParams(window.location.search);
        communitySlug = params.get('subdomain');
      }

      if (!communitySlug) {
        throw new Error(
          'No community specified in user metadata or redirect URL'
        );
      }

      // Clean the slug - remove any path components
      communitySlug = communitySlug.split('/')[0];
      console.log('Using community slug:', communitySlug);

      // Get community
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('id, name, slug, description, logo_url')
        .eq('slug', communitySlug)
        .maybeSingle();

      if (communityError) {
        console.error('Error finding community:', communityError);
        throw communityError;
      }

      if (!community) {
        throw new Error(`Community not found with slug: ${communitySlug}`);
      }

      console.log('Found community:', community);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error finding profile:', profileError);
        throw profileError;
      }

      if (!profile) {
        throw new Error(`Profile not found for user: ${user.id}`);
      }

      console.log('Found profile:', profile);

      // First check if membership exists
      const { data: existingMembership, error: checkError } = await supabase
        .from('community_members')
        .select(
          `
          *,
          community:communities!inner (
            id,
            name,
            slug,
            description,
            logo_url
          )
        `
        )
        .eq('profile_id', user.id)
        .eq('community_id', community.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking membership:', checkError);
        throw checkError;
      }

      let membership;

      if (!existingMembership) {
        console.log('Creating new membership for user:', user.id);
        // Use upsert with onConflict to handle race conditions
        const { data: newMembership, error: createError } = await supabase
          .from('community_members')
          .upsert(
            {
              profile_id: user.id,
              community_id: community.id,
              role: user.user_metadata?.role || 'member',
              status: 'active',
              onboarding_completed: false,
            },
            {
              onConflict: 'profile_id,community_id',
              ignoreDuplicates: false, // We want to get the data back
            }
          )
          .select(
            `
            *,
            community:communities!inner (
              id,
              name,
              slug,
              description,
              logo_url
            )
          `
          )
          .single();

        if (createError) {
          console.error('Error creating membership:', createError);
          throw createError;
        }

        if (!newMembership) {
          throw new Error('Failed to create or retrieve membership');
        }

        membership = newMembership;
        console.log('Created/Retrieved membership:', membership);
      } else {
        membership = existingMembership;
        console.log('Using existing membership:', membership);
      }

      // Count total memberships for this user
      const { count, error: countError } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id);

      if (countError) {
        console.error('Error counting memberships:', countError);
        throw countError;
      }

      const isNewUser = count === 1;
      console.log('Is new user:', isNewUser);

      return {
        success: true,
        message: isNewUser ? 'Welcome to Terrarium!' : 'Welcome back!',
        data: {
          ...profile,
          communitySlug,
          isNewUser,
        },
      };
    } catch (error) {
      console.error('Error in completeSignIn:', error);
      throw error;
    }
  }
}

export const memberAuth = new PasswordlessAuthService();
export type { AuthResult };
