import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { VerifyCallback } from '../VerifyCallback';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      verifyOtp: vi.fn(),
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
    useLocation: () => ({
      search:
        '?token=c89ec834c39cfa9c5c8fa6b6eb8a4bf5b51e8c9eb904c8cc9459faa6&type=recovery&redirect_to=http://localhost:3001/reset-password',
    }),
  };
});

describe('VerifyCallback Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('should handle successful token verification', async () => {
    vi.mocked(supabase.auth.verifyOtp).mockResolvedValueOnce({
      data: { session: { user: { id: '123' } } },
      error: null,
    });

    render(
      <BrowserRouter>
        <VerifyCallback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        token: 'c89ec834c39cfa9c5c8fa6b6eb8a4bf5b51e8c9eb904c8cc9459faa6',
        type: 'recovery',
        options: {
          redirectTo: 'http://localhost:3001/reset-password',
        },
      });
      expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
    });
  });

  it('should handle missing token parameter', async () => {
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({
          search:
            '?type=recovery&redirect_to=http://localhost:3001/reset-password',
        }),
      };
    });

    render(
      <BrowserRouter>
        <VerifyCallback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: {
          error: 'Invalid or expired verification link',
        },
      });
    });
  });

  it('should handle token verification error', async () => {
    vi.mocked(supabase.auth.verifyOtp).mockResolvedValueOnce({
      data: { session: null },
      error: new Error('Invalid token'),
    });

    render(
      <BrowserRouter>
        <VerifyCallback />
      </BrowserRouter>
    );

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
      data: { session: null },
      error: null,
    });

    render(
      <BrowserRouter>
        <VerifyCallback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
    });
  });
});
