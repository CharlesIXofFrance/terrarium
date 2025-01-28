import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCallback } from '../AuthCallback';
import { AuthService } from '@/services/auth';
import { atom, useSetAtom } from 'jotai';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('jotai', () => ({
  atom: (initialValue: any) => ({
    init: initialValue,
  }),
  useSetAtom: vi.fn(),
}));

vi.mock('@/services/auth', () => ({
  AuthService: {
    getInstance: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('AuthCallback', () => {
  const mockNavigate = vi.fn();
  const mockSetUser = vi.fn();
  const mockSetCommunity = vi.fn();
  const mockSetIsLoading = vi.fn();
  const mockAuthService = {
    getCurrentSession: vi.fn(),
    handleAuthCallback: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useSetAtom as jest.Mock).mockImplementation((atom) => {
      switch (atom.init) {
        case null:
          return mockSetUser;
        case undefined:
          return mockSetCommunity;
        case false:
          return mockSetIsLoading;
        default:
          return vi.fn();
      }
    });
    (AuthService.getInstance as jest.Mock).mockReturnValue(mockAuthService);
  });

  it('should handle successful auth callback for existing user', async () => {
    const mockSession = { user: { id: '123' } };
    const mockProfile = { id: '123', name: 'Test User' };
    const mockCommunity = { id: '456', name: 'Test Community' };

    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams({ code: 'valid-code' }),
    ]);

    mockAuthService.handleAuthCallback.mockResolvedValueOnce({
      success: true,
      data: {
        session: mockSession,
        profile: mockProfile,
        community: mockCommunity,
        isNewUser: false,
      },
    });

    render(
      <BrowserRouter>
        <AuthCallback />
      </BrowserRouter>
    );

    // Verify loading state is set initially
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);

    await waitFor(
      () => {
        expect(mockSetIsLoading).toHaveBeenCalledWith(false);
        expect(mockSetUser).toHaveBeenCalledWith(mockSession.user);
        expect(mockSetCommunity).toHaveBeenCalledWith(mockCommunity);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      },
      { timeout: 3000 }
    );
  });

  it('should handle successful auth callback for new user', async () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams({ code: 'valid-code' }),
    ]);

    mockAuthService.handleAuthCallback.mockResolvedValueOnce({
      success: true,
      data: {
        session: { user: { id: '123' } },
        profile: null,
        community: null,
        isNewUser: true,
      },
    });

    render(
      <BrowserRouter>
        <AuthCallback />
      </BrowserRouter>
    );

    expect(mockSetIsLoading).toHaveBeenCalledWith(true);

    await waitFor(
      () => {
        expect(mockSetIsLoading).toHaveBeenCalledWith(false);
        expect(mockSetUser).toHaveBeenCalledWith({ id: '123' });
        expect(mockSetCommunity).toHaveBeenCalledWith(null);
        expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
      },
      { timeout: 3000 }
    );
  });

  it('should handle missing auth code with existing session', async () => {
    (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams({})]);

    mockAuthService.getCurrentSession.mockResolvedValueOnce({
      success: true,
      session: { user: { id: '123' } },
    });

    render(
      <BrowserRouter>
        <AuthCallback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should handle missing auth code with no session', async () => {
    (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams({})]);

    mockAuthService.getCurrentSession.mockResolvedValueOnce({
      success: true,
      session: null,
    });

    render(
      <BrowserRouter>
        <AuthCallback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/error', {
        state: { error: 'No authentication code found' },
      });
    });
  });

  it('should handle auth error from URL', async () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams({
        error: 'access_denied',
        error_description: 'User denied access',
      }),
    ]);

    render(
      <BrowserRouter>
        <AuthCallback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/error', {
        state: { error: 'User denied access' },
      });
    });
  });

  it('should handle auth service errors', async () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams({ code: 'valid-code' }),
    ]);

    mockAuthService.handleAuthCallback.mockResolvedValueOnce({
      success: false,
      error: 'Failed to authenticate',
    });

    render(
      <BrowserRouter>
        <AuthCallback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/error', {
        state: { error: 'Failed to authenticate' },
      });
    });
  });

  it('should clean up loading state after completion', async () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams({ code: 'valid-code' }),
    ]);

    mockAuthService.handleAuthCallback.mockResolvedValueOnce({
      success: true,
      data: {
        session: { user: { id: '123' } },
        profile: { name: 'Test' },
        community: null,
        isNewUser: false,
      },
    });

    render(
      <BrowserRouter>
        <AuthCallback />
      </BrowserRouter>
    );

    expect(mockSetIsLoading).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });
});
