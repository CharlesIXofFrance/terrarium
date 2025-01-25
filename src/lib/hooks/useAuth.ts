/**
 * AI Context:
 * This hook provides React components with access to Terrarium's auth system.
 * It handles both password-based (owners/admins) and passwordless (members/employers)
 * authentication flows.
 *
 * Features:
 * 1. Role-based auth flows
 * 2. Community context management
 * 3. Automatic redirects
 * 4. Loading and error states
 *
 * Usage:
 * const { user, signIn, signUp } = useAuth();
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from '../stores/auth';
import { ownerAuth, memberAuth, type AuthResult } from '@/services/auth';
import { UserRole } from '@/lib/utils/types';
import type { AuthError } from '@supabase/supabase-js';
import { atom } from 'jotai';
import { supabase } from '../supabase';
import { useCallback } from 'react';

// Query keys
const USER_QUERY_KEY = ['auth', 'user'];
const COMMUNITY_QUERY_KEY = ['auth', 'community'];

// Local state atoms
const isRegisteringAtom = atom(false);
const registerErrorAtom = atom('');

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [userCommunity, setUserCommunity] = useAtom(userCommunityAtom);
  const [isRegistering, setIsRegistering] = useAtom(isRegisteringAtom);
  const [registerError, setRegisterError] = useAtom(registerErrorAtom);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check current auth state
  const { isLoading: isCheckingAuth } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUser(user);
      return user;
    },
    initialData: user,
  });

  // Fetch community data if user is owner/admin
  const { data: community } = useQuery({
    queryKey: COMMUNITY_QUERY_KEY,
    queryFn: async () => {
      if (
        !user ||
        (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN)
      ) {
        return null;
      }

      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching community:', error);
      }

      if (data) setUserCommunity(data);
      return data;
    },
    enabled:
      !!user && (user.role === UserRole.OWNER || user.role === UserRole.ADMIN),
  });

  // Password-based auth for owners/admins
  const passwordSignIn = useMutation({
    mutationFn: ownerAuth.signIn,
    onSuccess: ({ user, error }: AuthResult) => {
      if (error) throw error;
      if (!user) throw new Error('No user after sign in');

      setUser(user);

      if (community) {
        navigate(`/?subdomain=${community.slug}/dashboard`);
      } else {
        navigate('/onboarding');
      }
    },
  });

  const passwordSignUp = useMutation({
    mutationFn: ownerAuth.signUp,
    onSuccess: () => {
      setIsRegistering(false);
      navigate('/login?verification=pending');
    },
    onError: (error: AuthError) => {
      console.error('Registration error:', error);
      setRegisterError(error.message);
      setIsRegistering(false);
    },
  });

  // Passwordless auth for members/employers
  const magicLinkSignIn = useMutation({
    mutationFn: memberAuth.signIn,
    onSuccess: () => {
      // Magic link sent, show message
      navigate('/check-email');
    },
  });

  const magicLinkSignUp = useMutation({
    mutationFn: memberAuth.signUp,
    onSuccess: () => {
      navigate('/check-email');
    },
  });

  // Shared logout
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setUserCommunity(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, [navigate, setUser, setUserCommunity]);

  return {
    // State
    user,
    userCommunity,
    isCheckingAuth,
    isRegistering,
    registerError,

    // Password auth (owners/admins)
    passwordSignIn: passwordSignIn.mutate,
    passwordSignUp: passwordSignUp.mutate,
    isPasswordSigningIn: passwordSignIn.isLoading,
    isPasswordSigningUp: passwordSignUp.isLoading,
    passwordSignInError: passwordSignIn.error,
    passwordSignUpError: passwordSignUp.error,

    // Passwordless auth (members/employers)
    magicLinkSignIn: magicLinkSignIn.mutate,
    magicLinkSignUp: magicLinkSignUp.mutate,
    isMagicLinkSigningIn: magicLinkSignIn.isLoading,
    isMagicLinkSigningUp: magicLinkSignUp.isLoading,
    magicLinkSignInError: magicLinkSignIn.error,
    magicLinkSignUpError: magicLinkSignUp.error,

    // Shared
    signOut,
    isSigningOut: false,
  };
}
