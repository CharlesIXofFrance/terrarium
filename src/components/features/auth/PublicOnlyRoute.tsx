import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return null;
  }

  // Allow access to reset-password even if user is logged in
  if (window.location.pathname === '/reset-password') {
    return <>{children}</>;
  }

  // Redirect authenticated users
  if (user) {
    if (!user.onboardingComplete) {
      return <Navigate to="/onboarding" replace />;
    }
    if (user.community_slug) {
      return <Navigate to={`/c/${user.community_slug}/dashboard`} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
