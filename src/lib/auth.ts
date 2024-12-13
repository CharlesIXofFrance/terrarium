import { atom } from 'jotai';
import type { User } from './types';

// Initialize user atom with stored value if it exists
const storedUser = localStorage.getItem('user');
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const userAtom = atom<User | null>(initialUser);
export const hasCompletedOnboardingAtom = atom<boolean>(!!localStorage.getItem('onboarding_completed'));

export async function logout(): Promise<void> {
  localStorage.removeItem('user');
  localStorage.removeItem('onboarding_completed');
  userAtom.set(null);
  hasCompletedOnboardingAtom.set(false);
}