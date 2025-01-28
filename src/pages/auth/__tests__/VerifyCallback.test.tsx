import type { ReactNode } from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VerifyCallback } from '../VerifyCallback';
import { supabase } from '@/lib/supabase';
import type { AuthError, User, Session } from '@supabase/supabase-js';

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams({
  token: 'c89ec834c39cfa9c5c8fa6b6eb8a4bf5b51e8c9eb904c8cc9459faa6',
  type: 'recovery',
  redirect_to: 'http://localhost:3001/reset-password',
});

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      verifyOtp: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    search: mockSearchParams.toString(),
    pathname: '/',
    hash: '',
    state: null,
    key: 'default',
  }),
  BrowserRouter: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('VerifyCallback Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams({
      token: 'c89ec834c39cfa9c5c8fa6b6eb8a4bf5b51e8c9eb904c8cc9459faa6',
      type: 'recovery',
      redirect_to: 'http://localhost:3001/reset-password',
    });
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('should handle successful token verification', async () => {
    const mockUser: User = {
      id: '123',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'test@example.com',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    };

    const mockSession: Session = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: mockUser,
      token_type: 'bearer',
    };

    vi.mocked(supabase.auth.verifyOtp).mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    render(<VerifyCallback />);

    await waitFor(() => {
      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        token: mockSearchParams.get('token'),
        type: 'recovery',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
    });
  });

  it('should handle missing token parameter', async () => {
    mockSearchParams = new URLSearchParams({
      type: 'recovery',
      redirect_to: 'http://localhost:3001/reset-password',
    });

    render(<VerifyCallback />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: {
          error: 'Invalid or expired verification link',
        },
      });
    });
  });

  it('should handle token verification error', async () => {
    const mockError = {
      name: 'AuthError',
      message: 'Invalid token',
      status: 400,
      code: 'invalid_token',
    } as AuthError;

    vi.mocked(supabase.auth.verifyOtp).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: mockError,
    });

    render(<VerifyCallback />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: {
          error: 'Invalid or expired verification link',
        },
      });
    });
  });

  it('should handle missing session after verification', async () => {
    vi.mocked(supabase.auth.verifyOtp).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: null,
    });

    render(<VerifyCallback />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { error: 'No active session found' },
      });
    });
  });
});
