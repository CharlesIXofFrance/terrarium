import { atom } from 'jotai';
import type { User } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Atom for the Supabase User object
export const userAtom = atom<User | null>(null);

// Atom for the user's profile from our profiles table
export const userProfileAtom = atom<Profile | null>(null);

// Derived atom that combines user and profile information
export const userInfoAtom = atom((get) => {
  const user = get(userAtom);
  const profile = get(userProfileAtom);

  if (!user || !profile) return null;

  return {
    ...user,
    ...profile,
  };
});
