import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

describe('ForgotPassword', () => {
  it('renders forgot password form', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('handles successful password reset request', async () => {
    const mockResetPassword = vi.fn().mockResolvedValue({ error: null });
    supabase.auth.resetPasswordForEmail = mockResetPassword;

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    expect(mockResetPassword).toHaveBeenCalledWith('test@example.com', {
      redirectTo: expect.any(String),
    });
  });

  it('displays error message on failed request', async () => {
    const mockResetPassword = vi.fn().mockResolvedValue({
      error: new Error('Invalid email'),
    });
    supabase.auth.resetPasswordForEmail = mockResetPassword;

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.change(emailInput, { target: { value: 'invalid@email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('ResetPassword', () => {
  it('renders reset password form', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Set new password')).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('validates password match', async () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('password-input');
    const confirmInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('handles successful password update', async () => {
    const mockUpdateUser = vi.fn().mockResolvedValue({ error: null });
    supabase.auth.updateUser = mockUpdateUser;

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('password-input');
    const confirmInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
    });
  });

  it('displays error on failed password update', async () => {
    const mockUpdateUser = vi.fn().mockResolvedValue({
      error: new Error('Invalid password'),
    });
    supabase.auth.updateUser = mockUpdateUser;

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('password-input');
    const confirmInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be at least 6 characters/i)).toBeInTheDocument();
    });
  });
});
