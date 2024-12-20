import { atom } from 'jotai';
import type { Community } from '../../types/domain/auth';

// Base atoms
const _currentCommunityAtom = atom<Community | null>(null);
const _communityLoadingAtom = atom<boolean>(true);
const _communityErrorAtom = atom<string | null>(null);

// Derived read-write atoms with logging
export const currentCommunityAtom = atom(
  (get) => get(_currentCommunityAtom),
  (get, set, community: Community | null) => {
    console.log('Setting current community in store:', community);
    set(_currentCommunityAtom, community);
  }
);

export const communityLoadingAtom = atom(
  (get) => get(_communityLoadingAtom),
  (get, set, loading: boolean) => {
    console.log('Setting community loading state:', loading);
    set(_communityLoadingAtom, loading);
  }
);

export const communityErrorAtom = atom(
  (get) => get(_communityErrorAtom),
  (get, set, error: string | null) => {
    console.log('Setting community error:', error);
    set(_communityErrorAtom, error);
  }
);

// Combined community state atom with logging
export const communityStateAtom = atom((get) => {
  const state = {
    community: get(currentCommunityAtom),
    isLoading: get(communityLoadingAtom),
    error: get(communityErrorAtom),
  };
  console.log('Current community state:', state);
  return state;
});
