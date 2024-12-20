import { supabase } from '../lib/supabase';
import type { LoginCredentials, RegisterData } from '../lib/types/auth';

export const authService = {
  async login({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // If we have a session but no user profile yet, wait briefly for it
    if (data.session) {
      let profile = null;
      for (let i = 0; i < 3; i++) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profileData) {
          profile = profileData;
          break;
        }

        if (i < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return {
        user: profile,
        session: data.session,
        needsEmailVerification: false,
      };
    }

    return {
      user: null,
      session: null,
      needsEmailVerification: true,
    };
  },

  async register(data: RegisterData) {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: 'community_admin',
        },
      },
    });

    if (error) throw error;

    return { needsEmailVerification: true };
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return profile;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/#/reset-password',
    });
    if (error) throw error;
  },
};
