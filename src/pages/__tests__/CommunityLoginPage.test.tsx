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
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommunityLoginPage } from '../CommunityLoginPage';
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
  colorScheme: {
    primary: '#123456',
    secondary: '#654321',
    background: '#FFFFFF',
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

  const renderWithProviders = (slug: string = 'test-community') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/c/:slug/login" element={<CommunityLoginPage />} />
            <Route path="/login" element={<div>Default Login</div>} />
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
            data: { login_customization: mockCustomization },
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
    it('shows loading spinner while fetching customization', () => {
      renderWithProviders();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows loading state during login attempt', async () => {
      (supabase.auth.signInWithPassword as vi.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithProviders();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByText('Sign in'));

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Error States', () => {
    it('redirects to default login page when community not found', async () => {
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'Not found' },
            }),
          }),
        }),
      });

      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByText('Default Login')).toBeInTheDocument();
      });
    });

    it('shows server error message', async () => {
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Server error' },
            }),
          }),
        }),
      });

      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
      });
    });
  });

  describe('Customization', () => {
    it('renders with custom branding', async () => {
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByAltText('Community Logo')).toHaveAttribute(
          'src',
          mockCustomization.logoUrl
        );
        expect(screen.getByText(mockCustomization.customText.headline)).toBeInTheDocument();
        expect(screen.getByText(mockCustomization.customText.subHeadline)).toBeInTheDocument();
      });

      const signInButton = screen.getByText('Sign in');
      expect(signInButton).toHaveStyle({
        backgroundColor: mockCustomization.colorScheme.secondary,
      });
    });

    it('renders with default branding when customization is null', async () => {
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { login_customization: null },
              error: null,
            }),
          }),
        }),
      });

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByAltText('Community Logo')).toHaveAttribute(
          'src',
          '/default-logo.png'
        );
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for invalid email', async () => {
      renderWithProviders();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Email address'), 'invalid-email');
      await user.click(screen.getByText('Sign in'));

      expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    });

    it('shows validation errors for short password', async () => {
      renderWithProviders();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Password'), '12345');
      await user.click(screen.getByText('Sign in'));

      expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    it('requires both email and password', async () => {
      renderWithProviders();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText('Sign in')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Sign in'));

      expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
      expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('handles successful login', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: { id: '123' }, session: {} },
        error: null,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<CommunityLoginPage />} />
              <Route path="/dashboard" element={<div>Dashboard</div>} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      );

      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText(/email/i), {
          target: { value: validCredentials.email },
        });
        fireEvent.change(screen.getByPlaceholderText(/password/i), {
          target: { value: validCredentials.password },
        });
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('handles invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      renderWithProviders();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText('Email address'), {
          target: { value: validCredentials.email },
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
          target: { value: validCredentials.password },
        });
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Sign in'));
      });

      expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument();
    });

    it('handles network errors', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValueOnce(
        new Error('Network error')
      );

      renderWithProviders();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText('Email address'), {
          target: { value: validCredentials.email },
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
          target: { value: validCredentials.password },
        });
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Sign in'));
      });

      expect(await screen.findByText('An unexpected error occurred')).toBeInTheDocument();
    });

    it('prevents multiple submissions while loading', async () => {
      const signInPromise = new Promise(() => {}); // Never resolves
      vi.mocked(supabase.auth.signInWithPassword).mockImplementationOnce(() => signInPromise as any);

      renderWithProviders();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText('Email address'), {
          target: { value: validCredentials.email },
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
          target: { value: validCredentials.password },
        });
      });

      await act(async () => {
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);
        fireEvent.click(submitButton);
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(1);
    });
  });
});
