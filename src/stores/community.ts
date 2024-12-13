import { atom } from 'jotai';

export interface Community {
  id: string;
  name: string;
  description: string;
  members: any[];
  employers: any[];
  settings: {
    branding: Record<string, any>;
    jobBoard: {
      requireApproval: boolean;
      categories: string[];
    };
  };
  createdAt: string;
  updatedAt: string;
}

export const currentCommunityAtom = atom<Community | null>(null);