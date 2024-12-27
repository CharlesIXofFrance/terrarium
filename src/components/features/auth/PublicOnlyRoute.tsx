import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/stores/auth';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const [user] = useAtom(userAtom);

  // If user is logged in, redirect to their appropriate dashboard
  if (user) {
    // If user has a community, redirect to community dashboard
    if (user.community_id) {
      return <Navigate to={`/c/${user.community_id}/dashboard`} replace />;
    }
    // If user is in onboarding, redirect to onboarding
    if (!user.onboarding_completed) {
      return <Navigate to="/onboarding" replace />;
    }
    // Otherwise, redirect to member dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
