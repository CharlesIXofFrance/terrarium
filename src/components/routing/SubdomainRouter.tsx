import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { parseDomain } from '@/lib/utils/subdomain';
import { LandingPage } from '@/pages/LandingPage';
import { CommunityRoutes } from './CommunityRoutes';
import { PlatformRoutes } from './PlatformRoutes';
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute';
import { useAuth } from '@/lib/hooks/useAuth';
import { CommunityLoginPage } from '@/pages/auth/CommunityLoginPage';
import { VerifyCallback } from '@/pages/auth/VerifyCallback';
import { PlatformRegister } from '@/pages/auth/PlatformRegister';
import { PlatformLogin } from '@/pages/auth/PlatformLogin';

export const SubdomainRouter: React.FC = () => {
  const { type, subdomain } = parseDomain();
  const { user } = useAuth();
  const location = useLocation();

  // Get the path from the subdomain parameter
  const params = new URLSearchParams(window.location.search);
  const community = params.get('subdomain') || '';
  const pathParam = params.get('path');

  // Normalize the path by removing any trailing slashes and ensuring it starts with /
  const path =
    pathParam?.endsWith('/') && pathParam !== '/'
      ? pathParam.slice(0, -1)
      : pathParam || '/';

  console.log('SubdomainRouter - Debug:', {
    type,
    subdomain: community,
    pathname: location.pathname,
    search: location.search,
    pathParam,
    path,
    user,
  });

  // Handle auth confirmation route for all domains
  if (location.pathname === '/auth/confirm' || path === '/auth/confirm') {
    return (
      <Routes>
        <Route path="*" element={<VerifyCallback />} />
      </Routes>
    );
  }

  // Community subdomain routes
  if (type === 'community' && community) {
    // If not logged in, show login page
    if (!user) {
      return (
        <Routes>
          <Route
            path="*"
            element={<CommunityLoginPage communitySlug={community} />}
          />
        </Routes>
      );
    }

    return (
      <Routes>
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <CommunityRoutes />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  // Platform subdomain routes
  if (type === 'platform') {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <PlatformRoutes />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  // Main domain routes - show landing page if no subdomain
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
