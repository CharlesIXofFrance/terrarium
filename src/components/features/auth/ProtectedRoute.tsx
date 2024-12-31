import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../../lib/stores/auth';
import { supabase } from '../../../lib/supabase';
import { parseDomain } from '../../../lib/utils/subdomain';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useAtom(userAtom);
  const location = useLocation();
  const { subdomain } = parseDomain();

  // Effect to check and refresh session if needed
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && user) {
        // Session is invalid but we have a user, try to refresh
        const { data: { session: newSession } } = await supabase.auth.refreshSession();
        
        if (!newSession) {
          // If refresh failed, clear user state
          setUser(null);
        }
      }
    };

    checkSession();
  }, [user, setUser]);

  console.log('ProtectedRoute - Debug:', {
    user,
    pathname: location.pathname,
    subdomain,
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
    // Let the SubdomainRouter handle the login redirect
    const loginUrl = location.search ? `${location.search.split('/')[0]}/login` : '/login';
    return <Navigate to={loginUrl} state={{ from: location }} replace />;
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
