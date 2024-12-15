import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, hasCompletedOnboardingAtom } from '../auth';
import { authService } from '../../services/auth';
import type { LoginCredentials, RegisterData } from '../types/auth';
import { AuthError } from '@supabase/supabase-js';

const USER_QUERY_KEY = ['auth', 'user'];

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [hasCompletedOnboarding] = useAtom(hasCompletedOnboardingAtom);
  const navigate = useNavigate();

  const { isLoading: isCheckingAuth } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: authService.getCurrentUser,
    initialData: user,
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, needsEmailVerification }) => {
      if (needsEmailVerification) {
        // Don't set user or redirect if email needs verification
        return;
      }
      
      setUser(user);
      if (user?.role === 'admin') {
        navigate(hasCompletedOnboarding ? '/c/default' : '/onboarding');
      } else {
        navigate('/m/women-in-fintech');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: ({ user, needsEmailVerification }) => {
      if (needsEmailVerification) {
        // Don't set user or redirect if email needs verification
        return;
      }
      
      if (user) {
        setUser(user);
        navigate('/onboarding');
      }
    },
    onError: (error) => {
      console.error('Registration error:', error);
      if (error instanceof AuthError) {
        switch (error.message) {
          case 'Email rate limit exceeded':
            return 'Too many attempts. Please try again later.';
          case 'User already registered':
            return 'This email is already registered.';
          default:
            return error.message;
        }
      }
      return 'An unexpected error occurred. Please try again.';
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      setUser(null);
      navigate('/login');
    },
  });

  return {
    user,
    isCheckingAuth,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error instanceof Error ? registerMutation.error.message : 'Registration failed',
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
  };
}