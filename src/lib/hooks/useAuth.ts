import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, hasCompletedOnboardingAtom } from '../auth';
import { login, logout, register } from '../api/auth';
import type { LoginCredentials, RegisterData } from '../types/auth';

const USER_QUERY_KEY = ['auth', 'user'];

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [hasCompletedOnboarding] = useAtom(hasCompletedOnboardingAtom);
  const navigate = useNavigate();

  const { isLoading: isCheckingAuth } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: () => {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    },
    initialData: user,
    staleTime: Infinity, // Only refetch on explicit invalidation
    cacheTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      if (user.role === 'admin') {
        navigate(hasCompletedOnboarding ? '/c/default' : '/onboarding');
      } else {
        navigate('/m/women-in-fintech');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (user) => {
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/onboarding');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('onboarding_completed');
      navigate('/login');
    },
  });

  return {
    user,
    isCheckingAuth,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error instanceof Error ? loginMutation.error.message : null,
    registerError: registerMutation.error instanceof Error ? registerMutation.error.message : null,
  };
}