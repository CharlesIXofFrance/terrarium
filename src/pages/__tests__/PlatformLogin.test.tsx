import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlatformLogin } from '../auth/PlatformLogin';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/utils/types';
import { AUTH_ERRORS } from '@/lib/utils/errors';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PlatformLogin', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderComponent = (searchParams = new URLSearchParams()) => {
    // Mock window.location for domain validation
    Object.defineProperty(window, 'location', {
      value: {
        search: searchParams.toString(),
      },
      writable: true,
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlatformLogin />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form on platform domain', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    expect(screen.getByTestId('platform-login')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
  });

  it('shows access denied on non-platform domain', () => {
    renderComponent();
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {
        role: UserRole.OWNER,
      },
    };

    const mockSession = {
      user: mockUser,
      access_token: 'test-token',
    };

    (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    await act(async () => {
      await userEvent.type(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      await userEvent.type(screen.getByTestId('password-input'), 'password123');
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockNavigate).toHaveBeenCalledWith('/platform/dashboard', {
        replace: true,
      });
    });
  });

  it('handles invalid credentials', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    (supabase.auth.signInWithPassword as any).mockRejectedValueOnce(
      new Error(AUTH_ERRORS.INVALID_CREDENTIALS)
    );

    await act(async () => {
      await userEvent.type(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      await userEvent.type(
        screen.getByTestId('password-input'),
        'wrongpassword'
      );
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(
        screen.getByText(AUTH_ERRORS.INVALID_CREDENTIALS)
      ).toBeInTheDocument();
    });
  });

  it('handles server errors', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    (supabase.auth.signInWithPassword as any).mockRejectedValueOnce(
      new Error('Network error')
    );

    await act(async () => {
      await userEvent.type(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      await userEvent.type(screen.getByTestId('password-input'), 'password123');
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    // Mock a delayed response
    (supabase.auth.signInWithPassword as any).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                user: {
                  id: 'test-id',
                  user_metadata: { role: UserRole.OWNER },
                },
                session: { access_token: 'test-token' },
              },
              error: null,
            });
          }, 100);
        })
    );

    await act(async () => {
      await userEvent.type(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      await userEvent.type(screen.getByTestId('password-input'), 'password123');
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    const submitButton = screen.getByTestId('submit-button');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('redirects if already authenticated as owner', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');

    (supabase.auth.getSession as any).mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: 'test-id',
            user_metadata: { role: UserRole.OWNER },
          },
        },
      },
    });

    renderComponent(searchParams);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/platform/dashboard', {
        replace: true,
      });
    });
  });
});
