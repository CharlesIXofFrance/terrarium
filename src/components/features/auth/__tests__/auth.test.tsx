import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoginForm } from '../LoginForm';
import { RegisterForm } from '../RegisterForm';
import { Alert } from '@/components/ui/alert';

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
vi.mock('@/components/ui/alert', () => ({
  Alert: ({ message, variant = 'error' }) => (
    <div role="alert" data-variant={variant}>
      {message}
    </div>
  ),
}));

describe('Auth Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RegisterForm', () => {
    it('should handle successful registration', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: mockUser, session: null },
        error: null,
      });

      render(
        <MemoryRouter>
          <RegisterForm />
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
      render(
        <MemoryRouter>
          <RegisterForm />
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
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new Error('Registration failed'),
      });

      render(
        <MemoryRouter>
          <RegisterForm />
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
      const mockUser = { id: '123', email: 'test@example.com' };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockUser, session: null },
        error: null,
      });

      render(
        <MemoryRouter>
          <LoginForm />
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
          options: {
            redirectTo: expect.any(String),
          },
        });
      });
    });

    it('should handle login error', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new Error('Invalid credentials'),
      });

      render(
        <MemoryRouter>
          <LoginForm />
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
      render(
        <MemoryRouter>
          <LoginForm />
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
