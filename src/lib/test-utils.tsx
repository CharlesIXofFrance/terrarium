import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@radix-ui/react-toast';
import { Provider } from 'jotai';
import { createStore } from 'jotai';
import { userAtom } from './stores/auth';
import {
  communityMemberOnboardingAtom,
  onboardingFormDataAtom,
  onboardingRewardsAtom,
} from './stores/community-member';

// Create a test store
export const testStore = createStore();

// Initialize default atom values
testStore.set(userAtom, null);
testStore.set(communityMemberOnboardingAtom, {
  currentStep: 'welcome',
  completed: {
    welcome_completed: false,
    identity_pact_completed: false,
    profile_completed: false,
    rewards_claimed: false,
  },
  profile: {},
});
testStore.set(onboardingFormDataAtom, {});
testStore.set(onboardingRewardsAtom, {
  showWelcomeMeme: false,
  showCompletionAnimation: false,
});

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const mockCommunityConfig = {
  welcomeVideoUrl: 'https://example.com/welcome.mp4',
  rewardsConfig: {
    welcomeMeme: 'https://example.com/meme.jpg',
  },
};

interface WrapperProps {
  children: React.ReactNode;
}

// Separate wrapper components for better control
const JotaiWrapper: React.FC<WrapperProps> = ({ children }) => (
  <Provider store={testStore}>{children}</Provider>
);

const QueryWrapper: React.FC<WrapperProps> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const RouterWrapper: React.FC<WrapperProps> = ({ children }) => (
  <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
);

const TestWrapper: React.FC<WrapperProps> = ({ children }) => (
  <JotaiWrapper>
    <RouterWrapper>
      <QueryWrapper>
        <ToastProvider swipeDirection="right">{children}</ToastProvider>
      </QueryWrapper>
    </RouterWrapper>
  </JotaiWrapper>
);

export const createTestWrapper = () => ({
  Wrapper: TestWrapper,
});
