import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from '../stores/auth';
import { authService } from '../../backend/services/auth.service';
import type { LoginCredentials, RegisterData } from '../../backend/types/auth.types';
import { AuthError } from '@supabase/supabase-js';
import { atom } from 'jotai';
import { supabase } from '../supabase';
import { useCallback } from 'react';

const USER_QUERY_KEY = ['auth', 'user'];
const isRegisteringAtom = atom(false);
const registerErrorAtom = atom('');

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [userCommunity, setUserCommunity] = useAtom(userCommunityAtom);
  const [isRegistering, setIsRegistering] = useAtom(isRegisteringAtom);
  const [registerError, setRegisterError] = useAtom(registerErrorAtom);
  const navigate = useNavigate();

  const { isLoading: isCheckingAuth } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: authService.getCurrentUser,
    initialData: user,
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async ({ user, session, needsEmailVerification }) => {
      if (needsEmailVerification) {
        // Show email verification message
        return;
      }

      if (!user || !session) {
        throw new Error('No user or session after login');
      }

      setUser(user);

      // For community admins and owners, check their community
      if (user.role === 'community_admin' || user.role === 'community_owner') {
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (communityError && communityError.code !== 'PGRST116') {
          console.error('Error fetching community:', communityError);
        }

        if (community) {
          setUserCommunity(community);
          navigate(`/?subdomain=${community.slug}/dashboard`);
        } else {
          navigate('/onboarding');
        }
      } else {
        // Regular member flow
        navigate('/m/women-in-fintech');
      }
    },
    onError: (error: AuthError) => {
      console.error('Login error:', error);
      if (error.message.includes('Email not confirmed')) {
        return { needsEmailVerification: true };
      }
      throw error;
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
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

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      setUser(null);
      setUserCommunity(null);
      navigate('/');
    },
  });

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Get user's community
          const { data: communityData } = await supabase
            .from('communities')
            .select('*')
            .eq('owner_id', data.user.id)
            .single();

          setUser(data.user);
          if (communityData) {
            setUserCommunity(communityData);
            navigate(`/m/${communityData.slug}`);
          }
        }
      } catch (error) {
        console.error('Error signing in:', error);
        throw error;
      }
    },
    [navigate, setUser, setUserCommunity]
  );

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
    user,
    userCommunity,
    isCheckingAuth,
    isLoggingIn: loginMutation.isLoading,
    isRegistering,
    registerError,
    loginError: loginMutation.error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    signIn,
    signOut,
  };
}
