import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { AuthError } from '@supabase/supabase-js';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthResponse {
  user: Profile | null;
  session: {
    access_token: string;
    refresh_token: string;
  } | null;
  needsEmailVerification: boolean;
}

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      user: profile,
      session: {
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
      },
      needsEmailVerification: false
    };
  },

  async register({ email, password, name }: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Starting registration process for:', email);
      
      // First, check if the user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        console.log('User already exists:', email);
        throw new Error('User already registered');
      }

      // Attempt to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log('Sign up response:', {
        success: !!authData,
        hasUser: !!authData?.user,
        hasSession: !!authData?.session,
        error: authError?.message
      });

      if (authError) {
        console.error('Auth Error:', authError);
        throw authError;
      }

      if (!authData.user) {
        console.error('No user data returned from sign up');
        throw new Error('User creation failed');
      }

      // Check if email confirmation is required
      const needsEmailVerification = !authData.user.email_confirmed_at;
      console.log('Email verification needed:', needsEmailVerification);

      // If we have a user ID, try to get or create the profile
      if (authData.user.id) {
        console.log('Creating profile for user:', authData.user.id);
        
        // Create the profile directly instead of waiting for the trigger
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              name: name,
              profile_complete: 0,
            }
          ])
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
        } else {
          console.log('Profile created successfully:', profile);
        }

        return {
          user: profile || null,
          session: {
            access_token: authData.session?.access_token || '',
            refresh_token: authData.session?.refresh_token || '',
          },
          needsEmailVerification: true
        };
      }

      // If we get here, something went wrong
      console.error('Registration failed at final step');
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<Profile | null> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.session.user.id)
      .single();

    if (error) throw error;
    return profile;
  },

  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  },
};
