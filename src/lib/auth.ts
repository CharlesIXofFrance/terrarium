import { atom } from 'jotai';
import { supabase } from './supabase';
import type { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

// Initialize atoms with null/false
export const userAtom = atom<Profile | null>(null);
export const hasCompletedOnboardingAtom = atom<boolean>(false);

// Initialize the auth state
export const initAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        // We'll update these atoms from components using useSetAtom
        return {
          user: profile,
          hasCompletedOnboarding: profile.profile_complete > 0
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error initializing auth:', error);
    return null;
  }
};

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  // We'll handle the state updates in the App component using useSetAtom
  if (event === 'SIGNED_IN' && session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    return profile || null;
  }
  return null;
});

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}