import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../lib/stores/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user] = useAtom(userAtom);
  const location = useLocation();

  console.log('ProtectedRoute - Debug:', {
    user,
    pathname: location.pathname,
    localStorage: {
      authToken: localStorage.getItem('sb-terrarium-auth-token'),
    },
  });

  // If there's a token but no user, we're still loading
  const hasToken = Boolean(localStorage.getItem('sb-terrarium-auth-token'));
  if (hasToken && !user) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute - No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user should be redirected to onboarding
  if (!user.profile_complete && location.pathname !== '/onboarding') {
    console.log(
      'ProtectedRoute - Profile not complete, redirecting to onboarding'
    );
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
