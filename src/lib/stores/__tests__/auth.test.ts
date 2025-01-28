import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../supabase';
import {
  initAuth,
  onAuthStateChange,
  userAtom,
  sessionAtom,
  profileAtom,
} from '../auth';
import { getDefaultStore } from 'jotai';

vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

describe('Auth Store', () => {
  const store = getDefaultStore();

  beforeEach(() => {
    vi.clearAllMocks();
    store.set(userAtom, null);
    store.set(sessionAtom, null);
    store.set(profileAtom, null);
  });

  describe('initAuth', () => {
    it('should initialize with session and profile', async () => {
      const mockSession = {
        user: { id: '123', email: 'test@example.com' },
        access_token: 'token',
      };

      const mockProfile = {
        id: '123',
        name: 'Test User',
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: mockProfile,
          error: null,
        }),
      });

      const result = await initAuth();

      expect(result).toEqual({
        user: mockSession.user,
        profile: mockProfile,
        session: mockSession,
      });
    });

    it('should initialize with session but no profile', async () => {
      const mockSession = {
        user: { id: '123', email: 'test@example.com' },
        access_token: 'token',
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'No rows found' },
        }),
      });

      const result = await initAuth();

      expect(result).toEqual({
        user: mockSession.user,
        profile: null,
        session: mockSession,
      });
    });

    it('should handle session error', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: new Error('Failed to get session'),
      });

      await expect(initAuth()).rejects.toThrow('Failed to get session');
    });

    it('should handle profile query error', async () => {
      const mockSession = {
        user: { id: '123', email: 'test@example.com' },
        access_token: 'token',
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: null,
          error: new Error('Database error'),
        }),
      });

      await expect(initAuth()).rejects.toThrow('Database error');
    });
  });

  describe('auth state change handler', () => {
    it('should update state on sign in', async () => {
      const mockSession = {
        user: { id: '123', email: 'test@example.com' },
        access_token: 'token',
      };

      const mockProfile = {
        id: '123',
        name: 'Test User',
      };

      const callback = vi.fn();
      const unsubscribe = onAuthStateChange(callback);

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: mockProfile,
          error: null,
        }),
      });

      const authChangeHandler = vi.mocked(supabase.auth.onAuthStateChange).mock
        .calls[0][0];
      const result = await authChangeHandler('SIGNED_IN', mockSession);

      expect(result).toEqual({
        user: mockSession.user,
        profile: mockProfile,
        session: mockSession,
      });
      expect(callback).toHaveBeenCalledWith('SIGNED_IN', mockSession);
    });

    it('should clear state on sign out', async () => {
      const callback = vi.fn();
      const unsubscribe = onAuthStateChange(callback);

      const authChangeHandler = vi.mocked(supabase.auth.onAuthStateChange).mock
        .calls[0][0];
      const result = await authChangeHandler('SIGNED_OUT', null);

      expect(result).toEqual({
        user: null,
        profile: null,
        session: null,
      });
      expect(callback).toHaveBeenCalledWith('SIGNED_OUT', null);
    });
  });
});
