import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ForgotPassword, ResetPassword } from '../password-reset';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      setSession: vi.fn(),
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

describe('ForgotPassword', () => {
  it('renders forgot password form', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it('handles successful password reset request', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
      data: {},
      error: null,
    });

    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it('handles failed password reset request', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid email', name: 'AuthError', status: 400 },
    });

    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'invalid@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });
});

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reset password form', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Set new password')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    });
  });

  it('validates password match', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const submitButton = screen.getByRole('button', {
        name: /update password/i,
      });

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password456' },
      });
      fireEvent.click(submitButton);

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('handles successful password update', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const submitButton = screen.getByRole('button', {
        name: /update password/i,
      });

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' },
      });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('displays error on failed password update', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid password', name: 'AuthError', status: 400 },
    });

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const submitButton = screen.getByRole('button', {
        name: /update password/i,
      });

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' },
      });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeInTheDocument();
    });
  });
});
