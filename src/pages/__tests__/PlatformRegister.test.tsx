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
import { PlatformRegister } from '../auth/PlatformRegister';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/utils/types';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({
        select: vi.fn(),
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

describe('PlatformRegister', () => {
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
          <PlatformRegister />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form on platform domain', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    expect(screen.getByTestId('platform-register')).toBeInTheDocument();
    expect(screen.getByTestId('firstName-input')).toBeInTheDocument();
    expect(screen.getByTestId('lastName-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirmPassword-input')).toBeInTheDocument();
  });

  it('shows access denied on non-platform domain', () => {
    renderComponent();
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
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
      expect(screen.getByTestId('firstName-error')).toBeInTheDocument();
      expect(screen.getByTestId('lastName-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });
  });

  it('validates password requirements', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    const passwordInput = screen.getByTestId('password-input');
    await act(async () => {
      await userEvent.type(passwordInput, 'weak');
      fireEvent.blur(passwordInput);
    });

    await waitFor(() => {
      const error = screen.getByTestId('password-error');
      expect(error).toBeInTheDocument();
      expect(error.textContent).toContain('at least 8 characters');
    });
  });

  it('validates password confirmation', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirmPassword-input');

    await act(async () => {
      await userEvent.type(passwordInput, 'StrongP@ss1');
      await userEvent.type(confirmPasswordInput, 'DifferentP@ss1');
      fireEvent.blur(confirmPasswordInput);
    });

    await waitFor(() => {
      const error = screen.getByTestId('confirmPassword-error');
      expect(error).toBeInTheDocument();
      expect(error.textContent).toContain("Passwords don't match");
    });
  });

  it('handles successful registration', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
    };

    (supabase.auth.signUp as any).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as any)().upsert.mockResolvedValueOnce({
      error: null,
    });

    await act(async () => {
      await userEvent.type(screen.getByTestId('firstName-input'), 'John');
      await userEvent.type(screen.getByTestId('lastName-input'), 'Doe');
      await userEvent.type(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      await userEvent.type(screen.getByTestId('password-input'), 'StrongP@ss1');
      await userEvent.type(
        screen.getByTestId('confirmPassword-input'),
        'StrongP@ss1'
      );
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'StrongP@ss1',
        options: {
          data: {
            role: UserRole.OWNER,
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      });

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(screen.getByText('Check your email')).toBeInTheDocument();
    });
  });

  it('handles registration errors', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    (supabase.auth.signUp as any).mockRejectedValueOnce(
      new Error('Email already registered')
    );

    await act(async () => {
      await userEvent.type(screen.getByTestId('firstName-input'), 'John');
      await userEvent.type(screen.getByTestId('lastName-input'), 'Doe');
      await userEvent.type(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      await userEvent.type(screen.getByTestId('password-input'), 'StrongP@ss1');
      await userEvent.type(
        screen.getByTestId('confirmPassword-input'),
        'StrongP@ss1'
      );
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('shows loading state during registration', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('subdomain', 'platform');
    renderComponent(searchParams);

    // Mock a delayed response
    (supabase.auth.signUp as any).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: { user: { id: 'test-id' } },
              error: null,
            });
          }, 100);
        })
    );

    await act(async () => {
      await userEvent.type(screen.getByTestId('firstName-input'), 'John');
      await userEvent.type(screen.getByTestId('lastName-input'), 'Doe');
      await userEvent.type(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      await userEvent.type(screen.getByTestId('password-input'), 'StrongP@ss1');
      await userEvent.type(
        screen.getByTestId('confirmPassword-input'),
        'StrongP@ss1'
      );
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
