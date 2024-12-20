import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from '../auth';
import { authService } from '../../services/auth';
import type { LoginCredentials, RegisterData } from '../types/auth';
import { AuthError } from '@supabase/supabase-js';
import { atom } from 'jotai';
import { supabase } from '../supabase';

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

      if (user.role === 'community_admin') {
        // For community admins, check if they have a community
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (communityError && communityError.code !== 'PGRST116') {
          console.error('Error fetching community:', communityError);
        }

        setUserCommunity(community);

        if (!community || !user.profile_complete) {
          navigate('/onboarding');
        } else {
          navigate(`/c/${community.slug}`);
        }
      } else {
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

  return {
    user,
    isCheckingAuth,
    isLoggingIn: loginMutation.isLoading,
    isRegistering,
    registerError,
    loginError: loginMutation.error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
  };
}
