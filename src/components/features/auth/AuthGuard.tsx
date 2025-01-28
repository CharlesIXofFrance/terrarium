import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { parseDomain } from '@/lib/utils/subdomain';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { subdomain } = parseDomain();

  // Helper function to build URL with subdomain and path
  const buildUrl = (path: string) => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    params.set('path', path);
    return `${url.pathname}?${params.toString()}`;
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    // If we're on a community subdomain, redirect to community login
    if (subdomain) {
      return (
        <Navigate to={buildUrl('/login')} replace state={{ from: location }} />
      );
    }
    // Otherwise, redirect to platform login
    return (
      <Navigate
        to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // If role is required, check user's role
  if (requiredRole) {
    const userRole = user.user_metadata?.role;
    if (!userRole || userRole !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
