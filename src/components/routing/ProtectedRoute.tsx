import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { authLogger } from '@/lib/utils/logger';
import { LoadingSpinner } from '@/components/ui/atoms/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/atoms/ErrorDisplay';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, error, session } = useAuth();
  const location = useLocation();

  useEffect(() => {
    authLogger.debug('[ProtectedRoute] State updated:', {
      path: location.pathname,
      isLoading,
      hasUser: !!user,
      hasError: !!error,
      hasSession: !!session
    });
  }, [location.pathname, isLoading, user, error, session]);

  // If auth is still initializing, show loading spinner
  if (isLoading) {
    authLogger.debug('[ProtectedRoute] Loading auth state...');
    return <LoadingSpinner />;
  }

  // If there's an error, show error display
  if (error) {
    authLogger.error('[ProtectedRoute] Auth error:', error);
    return (
      <ErrorDisplay 
        error={error}
        onRetry={() => {
          authLogger.debug('[ProtectedRoute] Retry requested, reloading page');
          window.location.reload();
        }}
      />
    );
  }

  // If not authenticated, redirect to login with return path
  if (!user || !session) {
    authLogger.debug('[ProtectedRoute] No authenticated user, redirecting to login', {
      returnPath: location.pathname
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render children
  authLogger.debug('[ProtectedRoute] User authenticated, rendering protected content');
  return <>{children}</>;
}
