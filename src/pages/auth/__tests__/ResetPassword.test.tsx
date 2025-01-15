import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ResetPassword } from '../ResetPassword';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: vi.fn(),
      updateUser: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Mock react-router-dom's useNavigate and useLocation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      hash: '#access_token=test-token&type=recovery',
      pathname: '/reset-password',
    }),
  };
});

describe('ResetPassword Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#access_token=test-token&type=recovery',
        href: 'http://localhost:3001/reset-password#access_token=test-token&type=recovery',
      },
      writable: true,
    });

    // Mock successful token exchange
    vi.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValue({
      data: {
        user: { id: 'test-user' },
        session: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
        },
      },
      error: null,
    });

    // Mock successful sign out
    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null,
    });
  });

  describe('Password Reset Form', () => {
    it('should show password mismatch error', async () => {
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await act(async () => {
        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId(
          'confirm-password-input'
        );
        const submitButton = screen.getByTestId('submit-button');

        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, {
          target: { value: 'password456' },
        });
        fireEvent.click(submitButton);
      });

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('should show password length error', async () => {
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await act(async () => {
        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId(
          'confirm-password-input'
        );
        const submitButton = screen.getByTestId('submit-button');

        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
        fireEvent.click(submitButton);
      });

      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
    });

    it('should handle successful password reset', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await act(async () => {
        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId(
          'confirm-password-input'
        );
        const submitButton = screen.getByTestId('submit-button');

        fireEvent.change(passwordInput, {
          target: { value: 'newpassword123' },
        });
        fireEvent.change(confirmPasswordInput, {
          target: { value: 'newpassword123' },
        });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(supabase.auth.updateUser).toHaveBeenCalledWith({
          password: 'newpassword123',
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          replace: true,
          state: {
            message:
              'Password updated successfully. Please log in with your new password.',
            type: 'success',
          },
        });
      });
    });

    it('should handle password update error', async () => {
      vi.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValueOnce({
        data: { user: { id: 'test-user' }, session: null },
        error: null,
      });

      vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Update failed'),
      });

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await act(async () => {
        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId(
          'confirm-password-input'
        );
        const submitButton = screen.getByTestId('submit-button');

        fireEvent.change(passwordInput, {
          target: { value: 'newpassword123' },
        });
        fireEvent.change(confirmPasswordInput, {
          target: { value: 'newpassword123' },
        });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText('Failed to update password. Please try again.')
        ).toBeInTheDocument();
      });
    });
  });
});
