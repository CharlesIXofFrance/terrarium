import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { parseDomain } from '@/lib/utils/subdomain';

interface AuthGuardProps {
  children?: ReactNode;
  allowedRoles?: string[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { type, subdomain } = parseDomain();

  // Helper function to build URL with subdomain and path
  const buildUrl = (path: string, queryParams: Record<string, string> = {}) => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // Keep existing subdomain
    if (subdomain && !params.has('subdomain')) {
      params.set('subdomain', subdomain);
    }

    // Add path and any additional query params
    params.set('path', path);
    Object.entries(queryParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    return `/?${params.toString()}`;
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
    // Preserve the current URL for redirect after login
    const currentPath = location.pathname + location.search;

    // If we're on a community subdomain, redirect to community login
    if (subdomain && subdomain !== 'platform') {
      return (
        <Navigate
          to={buildUrl('/login', { redirectTo: currentPath })}
          replace
          state={{ from: location }}
        />
      );
    }

    // For platform subdomain or no subdomain, redirect to platform login
    return (
      <Navigate
        to={buildUrl('/login', {
          subdomain: 'platform',
          redirectTo: currentPath,
        })}
        replace
        state={{ from: location }}
      />
    );
  }

  // If roles are required, check user's role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role;

    // For platform domain, only allow owner role
    if (type === 'platform' && !allowedRoles.includes('owner')) {
      console.warn('Unauthorized platform access attempt:', {
        userRole,
        allowedRoles,
        path: location.pathname,
      });
      return <Navigate to="/unauthorized" replace />;
    }

    // For other domains, check allowed roles
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn('Unauthorized access attempt:', {
        userRole,
        allowedRoles,
        path: location.pathname,
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
