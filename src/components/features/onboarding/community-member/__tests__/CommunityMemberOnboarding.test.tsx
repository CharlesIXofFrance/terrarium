import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { vi } from 'vitest';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/lib/hooks/useToast';
import { CommunityMemberOnboarding } from '../CommunityMemberOnboarding';
import { createTestWrapper, testStore } from '@/lib/test-utils';
import { userAtom } from '@/lib/stores/auth';
import {
  communityMemberOnboardingAtom,
  onboardingFormDataAtom,
  onboardingRewardsAtom,
  type OnboardingStep,
} from '@/lib/stores/community-member';
import type {
  OnboardingStatus,
  CommunityMemberProfile,
} from '@/lib/types/community-member';
import { supabase } from '@/lib/supabase';

// Mock functions
const mockNavigate = vi.fn();
const mockToast = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useToast
vi.mock('@/lib/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  },
}));

// Mock step components
vi.mock('../steps/CommunityMemberWelcomeStep', () => ({
  __esModule: true,
  CommunityMemberWelcomeStep: ({ onSubmit }: { onSubmit: () => void }) => (
    <div data-testid="welcome-step">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        data-testid="welcome-form"
      >
        <button type="submit" data-testid="welcome-next">Next</button>
      </form>
    </div>
  ),
}));

vi.mock('../steps/CommunityMemberIdentityStep', () => ({
  __esModule: true,
  CommunityMemberIdentityStep: ({ onSubmit }: { onSubmit: () => void }) => (
    <div data-testid="identity-step">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        data-testid="identity-form"
      >
        <button type="submit" data-testid="identity-next">Next</button>
      </form>
    </div>
  ),
}));

vi.mock('../steps/CommunityMemberProfileStep', () => ({
  __esModule: true,
  CommunityMemberProfileStep: ({ onSubmit }: { onSubmit: () => void }) => (
    <div data-testid="profile-step">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        data-testid="profile-form"
      >
        <button type="submit" data-testid="profile-next">Next</button>
      </form>
    </div>
  ),
}));

vi.mock('../steps/CommunityFieldsStep', () => ({
  __esModule: true,
  CommunityFieldsStep: ({ onSubmit }: { onSubmit: () => void }) => (
    <div data-testid="fields-step">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        data-testid="fields-form"
      >
        <button type="submit" data-testid="fields-next">Next</button>
      </form>
    </div>
  ),
}));

describe('CommunityMemberOnboarding', () => {
  const setupTest = async () => {
    const { Wrapper } = createTestWrapper();
    render(
      <Wrapper>
        <CommunityMemberOnboarding />
      </Wrapper>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    testStore.set(userAtom, { id: '123', email: 'test@example.com' });
    testStore.set(communityMemberOnboardingAtom, {
      currentStep: 'welcome',
      completed: {},
    });
    testStore.set(onboardingFormDataAtom, {});
    testStore.set(onboardingRewardsAtom, {});

    // Default successful API response
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
      }),
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders welcome step first', async () => {
    await setupTest();
    expect(screen.getByTestId('welcome-step')).toBeInTheDocument();
  });

  it('shows error toast when form submission fails', async () => {
    // Mock API failure for this test only
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: new Error('API Error') }),
      }),
    } as any);

    await setupTest();

    // Welcome step
    const welcomeForm = screen
      .getByTestId('welcome-step')
      .querySelector('form');
    await act(async () => {
      fireEvent.submit(welcomeForm!);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Check for error toast
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to save progress',
      type: 'error',
    });
  });

  it('progresses through all steps', async () => {
    await setupTest();

    // Welcome step
    const welcomeForm = screen
      .getByTestId('welcome-step')
      .querySelector('form');
    await act(async () => {
      fireEvent.submit(welcomeForm!);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Identity step
    await waitFor(() => {
      testStore.set(communityMemberOnboardingAtom, {
        currentStep: 'identity',
        completed: { welcome_completed: true },
      });
      expect(screen.getByTestId('identity-form')).toBeInTheDocument();
    });

    const identityForm = screen
      .getByTestId('identity-form')
      .querySelector('form');
    await act(async () => {
      fireEvent.submit(identityForm!);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Profile step
    await waitFor(() => {
      testStore.set(communityMemberOnboardingAtom, {
        currentStep: 'profile',
        completed: { welcome_completed: true, identity_completed: true },
      });
      expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    });

    const profileForm = screen
      .getByTestId('profile-form')
      .querySelector('form');
    await act(async () => {
      fireEvent.submit(profileForm!);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Community step
    await waitFor(() => {
      testStore.set(communityMemberOnboardingAtom, {
        currentStep: 'community',
        completed: {
          welcome_completed: true,
          identity_completed: true,
          profile_completed: true,
        },
      });
      expect(screen.getByTestId('community-form')).toBeInTheDocument();
    });

    const communityForm = screen
      .getByTestId('community-form')
      .querySelector('form');
    await act(async () => {
      fireEvent.submit(communityForm!);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Longer wait for final step
    });

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/m/profile');
  });
});
