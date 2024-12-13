import { atom } from 'jotai';
import type { User } from '../lib/types';

export const userAtom = atom<User | null>(null);