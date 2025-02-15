/**
 * AI Context:
 * This service handles password-based authentication for community owners
 * and platform administrators. It enforces strict role checks to ensure
 * that only appropriate users can use password auth.
 *
 * Features:
 * 1. Password-based signup for owners/admins
 *    - Creates temporary profile
 *    - Signs up with Supabase Auth
 *    - Stores user metadata
 * 2. Password-based signin for owners/admins
 *    - Validates credentials
 *    - Enforces role checks
 * 3. Password reset functionality
 *    - Sends reset email
 *    - Handles reset confirmation
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthResult, BaseAuthService } from './base';
import { User, UserRole } from '@/lib/utils/types';

interface TempProfileData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  communityId?: string;
}

interface PasswordSignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  communityId?: string;
  communitySlug?: string;
}

interface PasswordSignInData {
  email: string;
  password: string;
}

/**
 * Handles password-based authentication for community owners and admins
 */
class PasswordAuthService extends BaseAuthService {
  constructor(private readonly supabase: SupabaseClient) {
    super();
  }

  /**
   * Creates or updates a profile row for an owner or admin user.
   */
  private async ensureProfile(
    email: string,
    role: UserRole,
    firstName?: string,
    lastName?: string
  ) {
    // We only create or update if not existing
    const { data: existing, error: fetchErr } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      throw new Error(fetchErr.message);
    }

    if (!existing) {
      // Insert
      const { data: newProfile, error: createErr } = await this.supabase
        .from('profiles')
        .insert({
          email,
          first_name: firstName || '',
          last_name: lastName || '',
          role: role,
          profile_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createErr) throw new Error(createErr.message);
      return newProfile;
    } else {
      // Possibly update
      const { data: updated, error: updateErr } = await this.supabase
        .from('profiles')
        .update({
          role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateErr) throw new Error(updateErr.message);
      return updated;
    }
  }

  /**
   * Signs up a new community owner or admin with password
   */
  async signUp({
    email,
    password,
    firstName,
    lastName,
    role,
    communityId,
    communitySlug,
  }: PasswordSignUpData): Promise<AuthResult> {
    try {
      if (role !== UserRole.OWNER && role !== UserRole.ADMIN) {
        throw new Error(
          'Password-based signup is only available for owners/admins'
        );
      }

      // signUp user in Supabase Auth with proper metadata
      const { data: authData, error: authError } =
        await this.supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              role,
              firstName,
              lastName,
              onboardingComplete: false,
              emailVerified: false,
              communityId,
              communitySlug,
              is_platform_user: true,
            },
          },
        });

      if (authError) throw new Error(authError.message);
      if (!authData?.user) {
        throw new Error('No user returned from supabase.auth.signUp');
      }

      // Create or update profile
      const { error: profileError } = await this.supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          role,
          onboarding_complete: false,
          email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          community_id: communityId,
          community_slug: communitySlug,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create user profile');
      }

      // If this is a community owner, create the community
      if (role === UserRole.OWNER && !communityId && communitySlug) {
        const { error: communityError } = await this.supabase
          .from('communities')
          .insert([
            {
              name: communitySlug, // We'll let them customize this in onboarding
              slug: communitySlug,
              owner_id: authData.user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (communityError) {
          console.error('Community creation error:', communityError);
          throw new Error('Failed to create community');
        }
      }

      return { success: true, data: authData.user };
    } catch (error) {
      console.error('Password signup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Signup failed'),
      };
    }
  }

  /**
   * Signs in an existing owner or admin with password
   */
  async signIn({ email, password }: PasswordSignInData): Promise<AuthResult> {
    try {
      const { data: authData, error: signInError } =
        await this.supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        throw new Error(signInError.message);
      }
      if (!authData?.user) {
        throw new Error('No user returned from signInWithPassword');
      }

      // Check role from user_metadata or from profile
      const userRole = authData.user?.user_metadata?.role || '';
      if (userRole !== UserRole.OWNER && userRole !== UserRole.ADMIN) {
        throw new Error('This login is only for owners or admins');
      }

      return { success: true, data: authData.user };
    } catch (error) {
      console.error('Password signin error:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Signin failed'),
      };
    }
  }

  /**
   * Sends a password reset email
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        throw new Error(error.message);
      }
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error : new Error('Password reset failed'),
      };
    }
  }
}

// Export singleton instance
const passwordAuthService = new PasswordAuthService(supabase);
