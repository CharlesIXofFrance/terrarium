import { atom } from 'jotai';
import { User } from '@supabase/supabase-js';
import type { Community, Profile } from '../../backend/types/auth.types';
import { supabase } from '../supabase';

// Atoms for auth state
export const userAtom = atom<User | null>(null);
export const sessionAtom = atom<any>(null);
export const profileAtom = atom<Profile | null>(null);
export const userCommunityAtom = atom<any | null>(null);
export const currentCommunityAtom = atom<Community | null>(null);
export const isLoadingAtom = atom<boolean>(true);

// Derived atoms
export const isAuthenticatedAtom = atom((get) => !!get(userAtom));
export const userRoleAtom = atom(
  (get) => get(userAtom)?.user_metadata?.role || null
);
export const userEmailAtom = atom((get) => get(userAtom)?.email || null);

// Initialize auth state
export async function initAuth() {
  try {
    // Get initial session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    // If no session, return early
    if (!session) {
      return { user: null, profile: null, session: null };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // If profile error (other than not found), throw it
    if (profileError && !profileError.message?.includes('No rows found')) {
      throw profileError;
    }

    return {
      user: session.user,
      profile: profile || null,
      session,
    };
  } catch (error) {
    console.error('Error initializing auth:', error);
    throw error;
  }
}

// Type for auth state change callback
type AuthStateCallback = (event: string, session: any) => void;

// Subscribe to auth changes
export function onAuthStateChange(callback: AuthStateCallback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      console.log('Auth state change:', { event, hasSession: !!session });

      if (event === 'SIGNED_OUT' || !session) {
        return {
          user: null,
          profile: null,
          session: null,
        };
      }

      // Get user profile on sign in
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // If profile error (other than not found), throw it
      if (profileError && !profileError.message?.includes('No rows found')) {
        throw profileError;
      }

      // Call provided callback
      if (callback) {
        callback(event, session);
      }

      return {
        user: session.user,
        profile: profile || null,
        session,
      };
    } catch (error) {
      console.error('Error handling auth state change:', error);
      throw error;
    }
  });
}
