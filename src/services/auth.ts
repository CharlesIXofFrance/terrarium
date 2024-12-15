import { supabase } from '../lib/supabase';
import { LoginCredentials, RegisterData, User } from '../lib/types/auth';
import { DEFAULT_ROLE } from '../lib/types/rbac';
import { logError } from '../lib/utils';

class AuthService {
  async login({ email, password }: LoginCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: profile.name,
        role: profile.role || DEFAULT_ROLE,
        emailVerified: data.user.email_confirmed_at != null,
        createdAt: data.user.created_at,
        updatedAt: profile.updated_at,
      };

      return { user, session: data.session };
    } catch (error) {
      logError('Login error:', error);
      throw error;
    }
  }

  async register({ email, password, name, role = DEFAULT_ROLE }: RegisterData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create profile with role
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user!.id,
        email,
        name,
        role,
      });

      if (profileError) throw profileError;

      const user: User = {
        id: authData.user!.id,
        email,
        name,
        role,
        emailVerified: false,
        createdAt: authData.user!.created_at,
        updatedAt: new Date().toISOString(),
      };

      return { user, session: authData.session };
    } catch (error) {
      logError('Registration error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      logError('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.user) {
        return null;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (!profile) return null;

      return {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email!,
        name: profile.name,
        role: profile.role || DEFAULT_ROLE,
        emailVerified: sessionData.session.user.email_confirmed_at != null,
        createdAt: sessionData.session.user.created_at,
        updatedAt: profile.updated_at,
      };
    } catch (error) {
      logError('Get current user error:', error);
      return null;
    }
  }

  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  }
}

export const authService = new AuthService();
