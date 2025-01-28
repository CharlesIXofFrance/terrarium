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
   * Creates a temporary profile for a new user during signup
   */
  private async createTempProfile({
    email,
    firstName,
    lastName,
    role,
    communityId,
  }: TempProfileData) {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert([
        {
          email,
          first_name: firstName,
          last_name: lastName,
          role,
          community_id: communityId,
          onboarding_step: 0,
          profile_complete: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create temporary profile');

    return data;
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
      // Validate role is owner or admin
      if (role !== UserRole.OWNER && role !== UserRole.ADMIN) {
        throw new Error(
          'Password signup is only available for owners and admins'
        );
      }

      // Create temporary profile
      const tempProfile = await this.createTempProfile({
        email,
        firstName,
        lastName,
        role,
        communityId,
      });

      // Sign up with Supabase Auth
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            community_slug: communitySlug,
            temp_profile_id: tempProfile.id,
            is_signup: true,
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from signup');

      return { success: true };
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
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from signin');

      // Validate user role
      const role = data.user.user_metadata.role;
      if (role !== UserRole.OWNER && role !== UserRole.ADMIN) {
        throw new Error(
          'Password signin is only available for owners and admins'
        );
      }

      return { success: true };
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
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
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
export const passwordAuthService = new PasswordAuthService(supabase);
