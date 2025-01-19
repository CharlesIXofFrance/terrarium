/**
 * State management for community member onboarding
 */

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type {
  OnboardingStatus,
  CommunityMemberProfile,
} from '@/lib/types/community-member';

export const onboardingSteps = [
  'welcome',
  'identity',
  'profile',
  'community',
] as const;
export type OnboardingStep = (typeof onboardingSteps)[number];

interface OnboardingState {
  currentStep: OnboardingStep;
  completed: OnboardingStatus;
  profile: Partial<CommunityMemberProfile>;
  identityPactResponse?: string;
}

// Persist onboarding progress in localStorage
export const communityMemberOnboardingAtom = atomWithStorage<OnboardingState>(
  'community-member-onboarding',
  {
    currentStep: 'welcome',
    completed: {
      welcome_completed: false,
      identity_pact_completed: false,
      profile_completed: false,
      rewards_claimed: false,
    },
    profile: {},
  }
);

// Temporary form data that shouldn't persist
export const onboardingFormDataAtom = atom<Partial<CommunityMemberProfile>>({});

// Track animations and rewards
export const onboardingRewardsAtom = atom({
  showWelcomeMeme: false,
  showCompletionAnimation: false,
});
