import { atom } from 'jotai';
import type { User, Community } from '../../types/domain/auth';
import { supabase } from '../supabase';

export const userAtom = atom<User | null>(null);
export const userCommunityAtom = atom<Community | null>(null);
export const isLoadingAtom = atom<boolean>(true);
export const authErrorAtom = atom<string | null>(null);

// Combined auth state atom
export const authStateAtom = atom((get) => ({
  user: get(userAtom),
  community: get(userCommunityAtom),
  isLoading: get(isLoadingAtom),
  error: get(authErrorAtom),
}));

export async function initAuth() {
  try {
    // Get initial session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (session) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        const user = {
          id: session.user.id,
          email: session.user.email!,
          name: profile.name,
          avatar: profile.avatar_url,
        };
        userAtom.set(user);
      }
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    authErrorAtom.set(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    isLoadingAtom.set(false);
  }
}
