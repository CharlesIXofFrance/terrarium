import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../supabase';
import {
  initAuth,
  onAuthStateChange,
  userAtom,
  sessionAtom,
  profileAtom,
  isLoadingAtom,
  setUser,
  setSession,
  setProfile,
  setIsLoading
} from '../auth';
import { atom, createStore } from 'jotai';

// Create a real Jotai store for integration tests
const store = createStore();

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store with real Jotai primitives
    store.set(userAtom, null);
    store.set(sessionAtom, null);
    store.set(profileAtom, null);
    store.set(isLoadingAtom, true);
  });

  describe('Jotai Primitive Tests', () => {
    const get = store.get;
    const set = store.set;

    beforeEach(() => {
      // Reset atoms before each test
      set(userAtom, null);
      set(sessionAtom, null);
      set(profileAtom, null);
      set(isLoadingAtom, true);
    });

    it('should handle null values correctly', () => {
      setUser(get, set, null);
      setSession(get, set, null);
      setProfile(get, set, null);
      
      expect(store.get(userAtom)).toBeNull();
      expect(store.get(sessionAtom)).toBeNull();
      expect(store.get(profileAtom)).toBeNull();
    });

    it('should update user state atomically', () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      setUser(get, set, mockUser);
      expect(store.get(userAtom)).toEqual(mockUser);

      // Update with new user
      const newUser = { id: '456', email: 'new@example.com' };
      setUser(get, set, newUser);
      expect(store.get(userAtom)).toEqual(newUser);
    });

    it('should update session state atomically', () => {
      const mockSession = { user: { id: '123' }, access_token: 'token1' };
      setSession(get, set, mockSession);
      expect(store.get(sessionAtom)).toEqual(mockSession);

      // Update with new session
      const newSession = { user: { id: '123' }, access_token: 'token2' };
      setSession(get, set, newSession);
      expect(store.get(sessionAtom)).toEqual(newSession);
    });

    it('should update profile state atomically', () => {
      const mockProfile = { id: '123', name: 'Test' };
      setProfile(get, set, mockProfile);
      expect(store.get(profileAtom)).toEqual(mockProfile);

      // Update with new profile
      const newProfile = { id: '123', name: 'Updated' };
      setProfile(get, set, newProfile);
      expect(store.get(profileAtom)).toEqual(newProfile);
    });

    it('should handle loading state transitions', () => {
      expect(store.get(isLoadingAtom)).toBe(true); // Initial state
      
      setIsLoading(get, set, false);
      expect(store.get(isLoadingAtom)).toBe(false);
      
      setIsLoading(get, set, true);
      expect(store.get(isLoadingAtom)).toBe(true);
    });

    it('should maintain consistency across multiple updates', () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token' };
      const mockProfile = { id: '123', name: 'Test' };

      // Update all states
      setUser(get, set, mockUser);
      setSession(get, set, mockSession);
      setProfile(get, set, mockProfile);
      setIsLoading(get, set, false);

      // Verify all states
      expect(store.get(userAtom)).toEqual(mockUser);
      expect(store.get(sessionAtom)).toEqual(mockSession);
      expect(store.get(profileAtom)).toEqual(mockProfile);
      expect(store.get(isLoadingAtom)).toBe(false);

      // Clear all states
      setUser(get, set, null);
      setSession(get, set, null);
      setProfile(get, set, null);
      setIsLoading(get, set, true);

      // Verify cleared states
      expect(store.get(userAtom)).toBeNull();
      expect(store.get(sessionAtom)).toBeNull();
      expect(store.get(profileAtom)).toBeNull();
      expect(store.get(isLoadingAtom)).toBe(true);
    });
  });

  describe('Auth State Change Integration', () => {
    it('should handle token refresh correctly', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token1' };
      const mockNewSession = { user: mockUser, access_token: 'token2' };
      
      // Initial session
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      // Mock profile queries for both initial and refresh calls
      vi.mocked(supabase.from)
        .mockImplementationOnce(() => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { id: '123', name: 'Test' }, 
                error: null 
              }),
            }),
          }),
        }) as any))
        .mockImplementationOnce(() => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { id: '123', name: 'Test' }, 
                error: null 
              }),
            }),
          }),
        }) as any));

      // Initialize auth
      await initAuth(store.get, store.set);

      // Verify initial state
      expect(store.get(sessionAtom)).toEqual(mockSession);

      // Simulate token refresh
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockNewSession },
        error: null,
      });

      // Refresh session
      await initAuth(store.get, store.set);

      // Verify refreshed state
      expect(store.get(sessionAtom)).toEqual(mockNewSession);
      expect(store.get(userAtom)).toEqual(mockUser);
    });

    it('should handle INITIAL_SESSION event correctly', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token' };
      const mockProfile = { id: '123', name: 'Test User' };

      // Mock Supabase responses
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: mockProfile, error: null }),
          }),
        }),
      } as any));

      // Initialize auth with real Jotai store
      await initAuth(store.get, store.set);

      // Verify state updates
      expect(store.get(sessionAtom)).toEqual(mockSession);
      expect(store.get(userAtom)).toEqual(mockUser);
      expect(store.get(profileAtom)).toEqual(mockProfile);
      expect(store.get(isLoadingAtom)).toBe(false);
    });

    it('should handle missing profile creation', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token' };
      const mockProfile = { id: '123', email: 'test@example.com', role: 'member' };

      // Mock getSession
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      // Mock profile not found error
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      } as any));

      // Mock profile creation
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: mockProfile, error: null }),
          }),
        }),
      } as any));

      // Initialize auth
      await initAuth(store.get, store.set);

      // Verify profile creation and state updates
      expect(store.get(sessionAtom)).toEqual(mockSession);
      expect(store.get(userAtom)).toEqual(mockUser);
      expect(store.get(profileAtom)).toEqual(mockProfile);
      expect(store.get(isLoadingAtom)).toBe(false);
    });
  });

  describe('Async State Updates', () => {
    it('should handle race conditions correctly', async () => {
      const mockUser1 = { id: '123', email: 'test1@example.com' };
      const mockUser2 = { id: '456', email: 'test2@example.com' };
      
      // Start both updates simultaneously
      const update1 = new Promise<void>((resolve) => {
        setTimeout(() => {
          setUser(store.get, store.set, mockUser1);
          resolve();
        }, 10);
      });
      
      const update2 = new Promise<void>((resolve) => {
        setTimeout(() => {
          setUser(store.get, store.set, mockUser2);
          resolve();
        }, 5); // This one finishes first
      });
      
      // Wait for both updates
      await Promise.all([update1, update2]);
      
      // The last update (mockUser1) should win
      expect(store.get(userAtom)).toEqual(mockUser1);
    });

    it('should handle multiple async state updates correctly', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token' };
      const mockProfile = { id: '123', name: 'Test User' };

      // Create promises for async operations
      const sessionPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          setSession(store.get, store.set, mockSession);
          resolve();
        }, 10);
      });

      const userPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          setUser(store.get, store.set, mockUser);
          resolve();
        }, 20);
      });

      const profilePromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          setProfile(store.get, store.set, mockProfile);
          resolve();
        }, 30);
      });

      // Execute all updates
      await Promise.all([sessionPromise, userPromise, profilePromise]);

      // Verify final state
      expect(store.get(sessionAtom)).toEqual(mockSession);
      expect(store.get(userAtom)).toEqual(mockUser);
      expect(store.get(profileAtom)).toEqual(mockProfile);
    });
  });
});
