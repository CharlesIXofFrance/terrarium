import { atom } from 'jotai';
import { Database } from '../types/database.types';

type Community = Database['public']['Tables']['communities']['Row'];

// Atom for the user's community (if they are a community admin)
export const communityAtom = atom<Community | null>(null);
