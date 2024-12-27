import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { RegisterForm } from '../RegisterForm';
import { LoginForm } from '../LoginForm';
import userEvent from '@testing-library/user-event';

const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
  },
};

describe('Auth Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RegisterForm', () => {
    const mockOnSuccess = vi.fn();

    it('should handle successful registration', async () => {
      const user = userEvent.setup();
      
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: null, // This indicates email confirmation is required
        },
        error: null,
      });

      render(
        <BrowserRouter>
          <RegisterForm onSuccess={mockOnSuccess} supabaseClient={mockSupabaseClient} />
        </BrowserRouter>
      );

      await act(async () => {
        await user.type(screen.getByTestId('full-name-input'), 'John Doe');
        await user.type(screen.getByTestId('email-input'), 'test@example.com');
        await user.type(screen.getByTestId('password-input'), 'password123');
        await user.type(screen.getByTestId('confirm-password-input'), 'password123');
        await user.click(screen.getByTestId('submit-button'));
      });

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            data: {
              full_name: 'John Doe',
            },
          },
        });
      });

      await waitFor(() => {
        const confirmationMessage = screen.getByTestId('confirmation-sent');
        expect(confirmationMessage).toBeInTheDocument();
        expect(confirmationMessage).toHaveTextContent('Please check your email to confirm your account');
      });
    });

    it('should show error for password mismatch', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <RegisterForm onSuccess={mockOnSuccess} supabaseClient={mockSupabaseClient} />
        </BrowserRouter>
      );

      await act(async () => {
        await user.type(screen.getByTestId('full-name-input'), 'John Doe');
        await user.type(screen.getByTestId('email-input'), 'test@example.com');
        await user.type(screen.getByTestId('password-input'), 'password123');
        await user.type(screen.getByTestId('confirm-password-input'), 'password456');
        await user.click(screen.getByTestId('submit-button'));
      });

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
      });
    });

    it('should handle registration error', async () => {
      const user = userEvent.setup();
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      render(
        <BrowserRouter>
          <RegisterForm onSuccess={mockOnSuccess} supabaseClient={mockSupabaseClient} />
        </BrowserRouter>
      );

      await act(async () => {
        await user.type(screen.getByTestId('full-name-input'), 'John Doe');
        await user.type(screen.getByTestId('email-input'), 'test@example.com');
        await user.type(screen.getByTestId('password-input'), 'password123');
        await user.type(screen.getByTestId('confirm-password-input'), 'password123');
        await user.click(screen.getByTestId('submit-button'));
      });

      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument();
      });
    });
  });

  describe('LoginForm', () => {
    const mockOnSuccess = vi.fn();

    it('should handle successful login', async () => {
      const user = userEvent.setup();
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: '123' },
          session: { access_token: 'token' },
        },
        error: null,
      });

      render(
        <BrowserRouter>
          <LoginForm onSuccess={mockOnSuccess} supabaseClient={mockSupabaseClient} />
        </BrowserRouter>
      );

      await act(async () => {
        await user.type(screen.getByTestId('email-input'), 'test@example.com');
        await user.type(screen.getByTestId('password-input'), 'password123');
        await user.click(screen.getByTestId('submit-button'));
      });

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({
          user: { id: '123' },
          session: { access_token: 'token' },
        });
      });
    });

    it('should handle login error', async () => {
      const user = userEvent.setup();
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      render(
        <BrowserRouter>
          <LoginForm onSuccess={mockOnSuccess} supabaseClient={mockSupabaseClient} />
        </BrowserRouter>
      );

      await act(async () => {
        await user.type(screen.getByTestId('email-input'), 'test@example.com');
        await user.type(screen.getByTestId('password-input'), 'password123');
        await user.click(screen.getByTestId('submit-button'));
      });

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });
  });
});
