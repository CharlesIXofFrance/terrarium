import { atom } from 'jotai';
import { Community as BaseCommunity } from '../lib/stores/auth';

export interface Community extends BaseCommunity {
  members?: any[];
  employers?: any[];
  settings?: {
    branding?: Record<string, any>;
    jobBoard?: {
      requireApproval: boolean;
      categories: string[];
    };
  };
}

export const currentCommunityAtom = atom<Community | null>(null);
