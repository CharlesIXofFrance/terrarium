import { atomWithStorage } from 'jotai/utils';

export interface RecruitCRMSettings {
  enabled: boolean;
  apiKey: string;
  filters: {
    status: string[];
    jobTypes: string[];
    locations: string[];
  };
  syncInterval: number;
  lastSyncedAt?: string;
}

export interface CommunitySettings {
  recruitCRM: RecruitCRMSettings;
}

const defaultSettings: CommunitySettings = {
  recruitCRM: {
    enabled: false,
    apiKey: '',
    filters: {
      status: ['active'],
      jobTypes: [],
      locations: [],
    },
    syncInterval: 60,
  },
};

export const communitySettingsAtom = atomWithStorage<
  Record<string, CommunitySettings>
>('community_settings', {});
