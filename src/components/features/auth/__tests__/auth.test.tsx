import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';
import { Alert } from '@/components/ui/atoms/Alert';
import { AuthError, Session, User } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
}));

// Mock Alert component
vi.mock('@/components/ui/atoms/Alert', () => ({
  Alert: React.forwardRef<
    HTMLDivElement,
    { message?: string; variant?: string }
  >(({ message, variant = 'error' }, ref) => (
    <div role="alert" data-variant={variant} ref={ref}>
      {message}
    </div>
  )),
}));

describe('Auth Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RegisterForm', () => {
    it('should handle successful registration', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: mockUser, session: null },
        error: null,
      });

      const onSuccess = vi.fn();
      render(
        <MemoryRouter>
          <RegisterForm onSuccess={onSuccess} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByTestId('confirm-password-input'), {
        target: { value: 'password123' },
      });

      fireEvent.submit(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should show error for password mismatch', async () => {
      const onSuccess = vi.fn();
      render(
        <MemoryRouter>
          <RegisterForm onSuccess={onSuccess} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByTestId('confirm-password-input'), {
        target: { value: 'different-password' },
      });

      fireEvent.submit(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Passwords do not match'
        );
      });
    });

    it('should handle registration error', async () => {
      const mockAuthError = new AuthError('Registration failed', 400);

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockAuthError,
      });

      const onSuccess = vi.fn();
      render(
        <MemoryRouter>
          <RegisterForm onSuccess={onSuccess} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByTestId('confirm-password-input'), {
        target: { value: 'password123' },
      });

      fireEvent.submit(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Registration failed'
        );
      });
    });
  });

  describe('LoginForm', () => {
    it('should handle successful login', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      };

      const mockSession: Session = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        expires_at: 3600,
        token_type: 'bearer',
        user: mockUser,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const onSuccess = vi.fn();
      render(
        <MemoryRouter>
          <LoginForm onSuccess={onSuccess} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' },
      });

      fireEvent.submit(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(onSuccess).toHaveBeenCalledWith({
          user: mockUser,
          session: mockSession,
        });
      });
    });

    it('should handle login error', async () => {
      const mockAuthError = new AuthError('Invalid credentials', 400);

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockAuthError,
      });

      const onSuccess = vi.fn();
      render(
        <MemoryRouter>
          <LoginForm onSuccess={onSuccess} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'wrong-password' },
      });

      fireEvent.submit(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Invalid credentials'
        );
      });
    });

    it('should validate required fields', async () => {
      const onSuccess = vi.fn();
      render(
        <MemoryRouter>
          <LoginForm onSuccess={onSuccess} />
        </MemoryRouter>
      );

      fireEvent.submit(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('email-input')).toBeRequired();
        expect(screen.getByTestId('password-input')).toBeRequired();
      });
    });
  });
});
