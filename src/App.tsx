import { lazy, Suspense, useEffect } from 'react';
import { AuthDebug } from '@/components/auth/AuthDebug';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { SubdomainRouter } from '@/components/routing/SubdomainRouter';
import { Toaster } from '@/components/ui/atoms/Toaster';
import { ErrorBoundary } from '@/components/layout/molecules/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/atoms/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/atoms/ErrorDisplay';
import { VerifyCallback } from '@/pages/auth/VerifyCallback';
import { authLogger } from '@/lib/utils/logger';

export default function App() {
  const { user, isLoading, session } = useAuth();

  useEffect(() => {
    // Only log when auth state actually changes
    authLogger.debug('[App] Auth state updated:', {
      isLoading,
      hasUser: !!user,
      hasSession: !!session,
    });
  }, [user, isLoading, session]);

  // Enable development tools
  const isDevelopment = import.meta.env.DEV;
  const DevTools = isDevelopment
    ? lazy(() =>
        import('@/components/development/DevTools').then((m) => ({
          default: m.DevTools,
        }))
      )
    : () => null;

  // Return the main app structure with routing
  return (
    <Router>
      <div data-testid="app-root" className="app-container" role="main">
        {isDevelopment && <AuthDebug />}
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading application...</p>
                </div>
              </div>
            }
          >
            <Routes>
              {/* Public routes that don't require authentication */}
              <Route path="/auth/callback" element={<VerifyCallback />} />

              {/* All routes are handled by SubdomainRouter which has its own auth logic */}
              <Route
                path="/*"
                element={isLoading ? <LoadingSpinner /> : <SubdomainRouter />}
              />
            </Routes>
            {isDevelopment && <DevTools />}
          </Suspense>
        </ErrorBoundary>
        <Toaster />
      </div>
    </Router>
  );
}
