import { atom } from 'jotai';
import { User } from '../types/auth';

const STORAGE_KEY = 'terrarium_user';

const loadStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load stored user:', error);
    return null;
  }
};

export const userAtom = atom<User | null>(loadStoredUser());

export const saveUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};