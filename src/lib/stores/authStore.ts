import { atom } from 'jotai';
import { ExtendedUser } from '@/lib/utils/types';
import { Session } from '@supabase/supabase-js';

// Core auth atoms
export const userAtom = atom<ExtendedUser | null>(null);
export const sessionAtom = atom<Session | null>(null);
export const isLoadingAtom = atom<boolean>(true);

// Derived atoms
export const isAuthenticatedAtom = atom((get) => {
  const user = get(userAtom);
  const session = get(sessionAtom);
  return !!user && !!session;
});

export const isOwnerAtom = atom((get) => {
  const user = get(userAtom);
  return user?.role === 'owner';
});
