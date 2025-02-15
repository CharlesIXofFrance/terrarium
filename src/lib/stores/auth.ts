import { atom } from 'jotai';
import { ExtendedUser } from '@/lib/utils/types';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { Community, Profile } from '../../backend/types/auth.types';

// Core auth atoms
export const userAtom = atom<ExtendedUser | null>(null);
export const sessionAtom = atom<Session | null>(null);
export const isLoadingAtom = atom<boolean>(true);

// Atoms for auth state
export const profileAtom = atom<Profile | null>(null);
export const userCommunityAtom = atom<any | null>(null);
export const currentCommunityAtom = atom<Community | null>(null);

// Derived atoms
const isAuthenticatedAtom = atom((get) => !!get(userAtom));
const userRoleAtom = atom((get) => get(userAtom)?.user_metadata?.role || null);
const userEmailAtom = atom((get) => get(userAtom)?.email || null);

// Setter functions using Jotai primitives
export const setUser = (get: any, set: any, user: ExtendedUser | null) =>
  set(userAtom, user);
export const setSession = (get: any, set: any, session: Session | null) =>
  set(sessionAtom, session);
export const setProfile = (get: any, set: any, profile: Profile | null) =>
  set(profileAtom, profile);
const setUserCommunity = (get: any, set: any, community: any | null) =>
  set(userCommunityAtom, community);
const setCurrentCommunity = (get: any, set: any, community: Community | null) =>
  set(currentCommunityAtom, community);
export const setIsLoading = (get: any, set: any, loading: boolean) =>
  set(isLoadingAtom, loading);

import { authLogger } from '../utils/logger';

// Error handling utility
const handleAuthError = (
  error: any,
  context: string,
  setIsLoading: (loading: boolean) => void
) => {
  authLogger.error(`Auth error in ${context}:`, error);
  setIsLoading(false);
  throw error;
};

// Profile management utility
const createUserProfile = async (session: Session) => {
  try {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        email: session.user.email,
        first_name: session.user.user_metadata?.first_name || '',
        last_name: session.user.user_metadata?.last_name || '',
        role: session.user.user_metadata?.role || 'member',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) throw createError;
    return newProfile;
  } catch (error) {
    handleAuthError(error, 'createUserProfile');
  }
};

// Initialize auth state
export async function initAuth(setters: {
  setUser: (user: ExtendedUser | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (loading: boolean) => void;
  setUserCommunity: (community: any | null) => void;
  setCurrentCommunity: (community: Community | null) => void;
}) {
  const { setUser, setSession, setProfile, setIsLoading } = setters;

  authLogger.debug('Initializing auth state');
  setIsLoading(true);

  try {
    // Get initial session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      authLogger.error('Failed to get session:', sessionError);
      setIsLoading(false);
      return { user: null, profile: null, session: null };
    }

    // Set initial state
    setSession(session);
    setUser(session?.user || null);

    // If no session, we're done
    if (!session) {
      authLogger.info('No session found');
      setIsLoading(false);
      return { user: null, profile: null, session: null };
    }

    // Get profile if we have a session
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Create profile if it doesn't exist
        const newProfile = await createUserProfile(session);
        setProfile(newProfile);
        setIsLoading(false);
        return { user: session.user, profile: newProfile, session };
      }

      if (profileError) {
        throw profileError;
      }

      setProfile(profile);
      setIsLoading(false);
      return { user: session.user, profile, session };
    } catch (error) {
      authLogger.error('Profile error:', error);
      setProfile(null);
      setIsLoading(false);
      return { user: session.user, profile: null, session };
    }
  } catch (error) {
    authLogger.error('Auth initialization error:', error);
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
    return { user: null, profile: null, session: null };
  }
}

// Type for auth state change callback
type AuthStateCallback = (event: string, session: Session) => void;

// Subscribe to auth changes
// Track active subscriptions
const activeSubscriptions = new Map<string, () => void>();

export function onAuthStateChange(callback: AuthStateCallback) {
  // Generate a unique ID for this subscription
  const subscriptionId = Math.random().toString(36).substring(2);

  authLogger.debug('Setting up auth state change listener', { subscriptionId });
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      authLogger.info('Auth state changed', {
        event,
        email: session?.user?.email,
      });

      // Always update session state first
      sessionAtom.write(session);

      if (event === 'SIGNED_OUT' || !session) {
        userAtom.write(null);
        sessionAtom.write(null);
        profileAtom.write(null);
        isLoadingAtom.write(false);
        if (callback) callback(event, session);
        return;
      }

      // For both SIGNED_IN and INITIAL_SESSION, we want to ensure profile exists
      if (
        event === 'SIGNED_IN' ||
        event === 'INITIAL_SESSION' ||
        event === 'USER_UPDATED'
      ) {
        authLogger.info('Processing auth event', {
          event,
          email: session?.user?.email,
        });

        // Ensure we have a valid session
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) {
          authLogger.error('Failed to get current session', sessionError);
          throw sessionError;
        }

        // Use the most recent session
        session = currentSession || session;
        if (!session) {
          authLogger.warn('No valid session found after auth event');
          // Try to sign in again
          const {
            data: { session: refreshedSession },
            error: refreshError,
          } = await supabase.auth.refreshSession();
          if (refreshError) {
            authLogger.error('Failed to refresh session', refreshError);
            return;
          }
          session = refreshedSession;
          if (!session) {
            authLogger.warn('Still no valid session after refresh');
            return;
          }
          authLogger.info('Successfully refreshed session', {
            email: session.user.email,
          });
        }
        // Set both session and user
        sessionAtom.write(session);
        userAtom.write(session.user);
        authLogger.info('Set session and user', {
          email: session.user.email,
          expiresAt: new Date(session.expires_at * 1000).toISOString(),
        });

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Handle missing profile
        if (profileError?.code === 'PGRST116') {
          authLogger.info('Profile not found, creating new profile', {
            email: session.user.email,
          });
          // Create default profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              first_name: session.user.user_metadata?.first_name || '',
              last_name: session.user.user_metadata?.last_name || '',
              role: session.user.user_metadata?.role || 'member',
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            authLogger.error('Failed to create profile', createError);
            throw createError;
          }
          authLogger.info('Created new profile', { profile: newProfile });

          // Set state
          profileAtom.write(newProfile);
          isLoadingAtom.write(false);

          // Redirect to onboarding if needed
          if (!newProfile.onboarding_complete && newProfile.role === 'owner') {
            window.location.href = '/onboarding';
          }

          if (callback) callback(event, session);
          return;
        }

        // If other error, throw it
        if (profileError) throw profileError;

        // Set state
        profileAtom.write(profile);
        isLoadingAtom.write(false);

        // Redirect to onboarding if needed
        if (!profile.onboarding_complete && profile.role === 'owner') {
          window.location.href = '/onboarding';
        }

        if (callback) callback(event, session);
      }
    } catch (error) {
      authLogger.error('Error handling auth state change:', error);
      isLoadingAtom.write(false);
      throw error;
    }
  });

  // Store unsubscribe function
  activeSubscriptions.set(subscriptionId, subscription.unsubscribe);

  // Return unsubscribe function
  return () => {
    const unsubscribe = activeSubscriptions.get(subscriptionId);
    if (unsubscribe) {
      unsubscribe();
      activeSubscriptions.delete(subscriptionId);
      authLogger.debug('Removed auth state change listener', {
        subscriptionId,
      });
    }
  };
}
