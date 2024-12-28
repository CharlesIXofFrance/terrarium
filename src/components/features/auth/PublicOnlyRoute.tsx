import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/stores/auth';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const [user] = useAtom(userAtom);

  // Allow access to reset-password even if user is logged in
  if (window.location.pathname === '/reset-password') {
    return <>{children}</>;
  }

  // Redirect authenticated users
  if (user) {
    if (user.community_id) {
      return <Navigate to={`/c/${user.community_id}/dashboard`} replace />;
    }
    if (!user.onboarding_completed) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
