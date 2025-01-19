import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Provider as JotaiProvider } from 'jotai';
import { userAtom } from '@/lib/stores/auth';
import {
  communityMemberOnboardingAtom,
  onboardingFormDataAtom,
  onboardingRewardsAtom,
} from '@/lib/stores/community-member';

// Mock test user
export const TEST_USER = {
  id: 'test-user-id',
  community_id: 'test-community-id',
  email: 'test@example.com',
  full_name: 'Test User',
};

// Create a wrapper with all required providers
export function createTestWrapper(
  initialRoute = '/onboarding/community-member'
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialRoute]}>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider
          initialValues={[
            [userAtom, TEST_USER],
            [
              communityMemberOnboardingAtom,
              {
                currentStep: 'welcome',
                completed: {
                  welcome_completed: false,
                  identity_pact_completed: false,
                  profile_completed: false,
                  rewards_claimed: false,
                },
                profile: {},
              },
            ],
            [onboardingFormDataAtom, {}],
            [
              onboardingRewardsAtom,
              {
                showWelcomeMeme: false,
                showCompletionAnimation: false,
              },
            ],
          ]}
        >
          {children}
        </JotaiProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

// Mock component props
export const mockOnboardingProps = {
  communityId: TEST_USER.community_id,
  defaultValues: {},
  onComplete: vi.fn(),
  onBack: vi.fn(),
};

// Mock community config
export const mockCommunityConfig = {
  welcomeVideoUrl: 'https://example.com/welcome.mp4',
  identityPactTemplate: 'Welcome to our community!',
  customFields: [],
  requiresApproval: false,
  rewardsConfig: {
    welcomeMeme: 'https://example.com/meme.jpg',
    completionAnimation: 'confetti',
  },
};
