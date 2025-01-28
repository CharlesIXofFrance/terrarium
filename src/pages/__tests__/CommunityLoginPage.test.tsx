/**
 * AI Context:
 * This file contains tests for the CommunityLoginPage component. It's located in __tests__
 * directory next to the component it tests, following Jest conventions.
 *
 * Tests cover:
 * 1. Component rendering with different customization states
 * 2. Form validation and submission
 * 3. Error handling and auth checks
 * 4. Loading states
 */

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
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommunityLoginPage } from '../auth/CommunityLoginPage';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
    },
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

const mockCustomization = {
  logoUrl: '/test-logo.png',
  backgroundColor: '#FFFFFF',
  sideImageUrl: '/test-side-image.png',
  colorScheme: {
    primary: '#123456',
    secondary: '#654321',
  },
  customText: {
    headline: 'Test Headline',
    subHeadline: 'Test Subheadline',
  },
};

describe('CommunityLoginPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderWithProviders = (communitySlug: string = 'test-community') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<CommunityLoginPage communitySlug={communitySlug} />}
            />
            <Route path="/login" element={<div>Default Login Page</div>} />
            <Route path="/c/:slug/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default successful responses
    (supabase.from as vi.Mock).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { customization: mockCustomization },
            error: null,
          }),
        }),
      }),
    });

    // Mock no active session by default
    (supabase.auth.getSession as vi.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner while fetching customization', async () => {
      // Mock a delayed response to ensure loading state is visible
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockImplementation(() => new Promise(() => {})),
          }),
        }),
      });

      renderWithProviders();
      expect(await screen.findByTestId('spinner')).toBeInTheDocument();
    });

    it('shows loading state during login attempt', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Email address')
        ).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.type(
        screen.getByPlaceholderText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByPlaceholderText('Password'), 'password123');

      // Mock a delayed auth response
      (supabase.auth.signInWithPassword as vi.Mock).mockReturnValue(
        new Promise(() => {})
      );

      await user.click(screen.getByRole('button', { name: /sign in/i }));
      expect(await screen.findByTestId('spinner')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('redirects to default login page when community not found', async () => {
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Community not found' },
            }),
          }),
        }),
      });

      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByText('Default Login Page')).toBeInTheDocument();
      });
    });

    it('shows server error message', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Email address')
        ).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.type(
        screen.getByPlaceholderText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByPlaceholderText('Password'), 'password123');

      (supabase.auth.signInWithPassword as vi.Mock).mockResolvedValue({
        data: null,
        error: { message: 'An unexpected error occurred' },
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: /sign in/i }));
      });
      expect(
        await screen.findByText('An unexpected error occurred')
      ).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for invalid email', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Email address')
        ).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.type(
        screen.getByPlaceholderText('Email address'),
        'invalid-email'
      );
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(
        await screen.findByText('Invalid email address')
      ).toBeInTheDocument();
    });

    it('shows validation errors for short password', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText('Password'), '12345');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(
        await screen.findByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('handles successful login and redirects to dashboard', async () => {
      const communitySlug = 'test-community';
      renderWithProviders(communitySlug);
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Email address')
        ).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.type(
        screen.getByPlaceholderText('Email address'),
        validCredentials.email
      );
      await user.type(
        screen.getByPlaceholderText('Password'),
        validCredentials.password
      );

      (supabase.auth.signInWithPassword as vi.Mock).mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: /sign in/i }));
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          `/c/${communitySlug}/dashboard`
        );
      });
    });

    it('prevents multiple submissions while loading', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Email address')
        ).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.type(
        screen.getByPlaceholderText('Email address'),
        validCredentials.email
      );
      await user.type(
        screen.getByPlaceholderText('Password'),
        validCredentials.password
      );

      // Mock a delayed auth response
      (supabase.auth.signInWithPassword as vi.Mock).mockReturnValue(
        new Promise(() => {})
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Verify loading state and button disabled
      expect(submitButton).toBeDisabled();
      expect(screen.getByTestId('spinner')).toBeInTheDocument();

      // Verify form inputs are disabled during submission
      expect(screen.getByPlaceholderText('Email address')).toBeDisabled();
      expect(screen.getByPlaceholderText('Password')).toBeDisabled();
    });
  });

  describe('Customization', () => {
    it('applies community customization to UI elements', async () => {
      renderWithProviders();

      // Wait for customization to load
      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      // Verify logo
      const logo = screen.getByAltText('Community logo');
      expect(logo).toHaveAttribute('src', mockCustomization.logoUrl);

      // Verify side image
      const sideImage = screen.getByAltText('Login side image');
      expect(sideImage).toHaveAttribute('src', mockCustomization.sideImageUrl);

      // Verify custom text
      expect(
        screen.getByText(mockCustomization.customText.headline)
      ).toBeInTheDocument();
      expect(
        screen.getByText(mockCustomization.customText.subHeadline)
      ).toBeInTheDocument();
    });
  });

  describe('Redirections and Access Control', () => {
    it('redirects to dashboard if user is already logged in and is a member', async () => {
      // Mock active session
      (supabase.auth.getSession as vi.Mock).mockResolvedValue({
        data: {
          session: {
            user: { id: '123', email: 'test@example.com' },
          },
        },
        error: null,
      });

      // Mock existing community member
      (supabase.from as vi.Mock)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  customization: mockCustomization,
                  id: '456',
                },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { role: 'member' },
                error: null,
              }),
            }),
          }),
        });

      renderWithProviders();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/c/test-community/dashboard'
        );
      });
    });

    it('shows access denied message for banned users', async () => {
      // Mock active session
      (supabase.auth.getSession as vi.Mock).mockResolvedValue({
        data: {
          session: {
            user: { id: '123', email: 'test@example.com' },
          },
        },
        error: null,
      });

      // Mock community query
      (supabase.from as vi.Mock)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  customization: mockCustomization,
                  id: '456',
                },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { role: 'banned' },
                error: null,
              }),
            }),
          }),
        });

      renderWithProviders();

      expect(await screen.findByText(/access denied/i)).toBeInTheDocument();
      expect(
        await screen.findByText(/you have been banned/i)
      ).toBeInTheDocument();
    });

    it('preserves redirect URL after successful login', async () => {
      const redirectUrl = '/c/test-community/events/123';

      // Mock no active session initially
      (supabase.auth.getSession as vi.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      // Mock successful login
      (supabase.auth.signInWithPassword as vi.Mock).mockResolvedValueOnce({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'test-token' },
        },
        error: null,
      });

      // Mock community member role check
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
          }),
        }),
      });

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <CommunityLoginPage
                    communitySlug="test-community"
                    redirectTo={redirectUrl}
                  />
                }
              />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Fill and submit login form
      const user = userEvent.setup();
      await user.type(
        screen.getByPlaceholderText(/email/i),
        'test@example.com'
      );
      await user.type(screen.getByPlaceholderText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(redirectUrl);
      });
    });

    it('handles pending invitations', async () => {
      // Mock no active session
      (supabase.auth.getSession as vi.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Mock community with invitation required
      (supabase.from as vi.Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                customization: mockCustomization,
                id: '456',
                settings: {
                  requireInvitation: true,
                },
              },
              error: null,
            }),
          }),
        }),
      });

      // Mock pending invitation check
      (supabase.from as vi.Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                status: 'pending',
                email: 'test@example.com',
              },
              error: null,
            }),
          }),
        }),
      });

      renderWithProviders();

      expect(
        await screen.findByText(/invitation pending/i)
      ).toBeInTheDocument();
      expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
    });
  });
});
