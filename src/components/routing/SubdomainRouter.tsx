import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { parseDomain } from '@/lib/utils/subdomain';
import { LandingPage } from '@/pages/LandingPage';
import { CommunityRoutes } from './CommunityRoutes';
import { PlatformRoutes } from './PlatformRoutes';
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute';
import { useAuth } from '@/lib/hooks/useAuth';
import { CommunityLoginPage } from '@/pages/CommunityLoginPage';

export const SubdomainRouter: React.FC = () => {
  const { type, subdomain } = parseDomain();
  const { user } = useAuth();
  const location = useLocation();

  // Get the path from the subdomain parameter
  const params = new URLSearchParams(window.location.search);
  const subdomainParam = params.get('subdomain') || '';
  const [community, ...pathParts] = subdomainParam.split('/');
  const path = pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';

  console.log('SubdomainRouter - Debug:', {
    type,
    subdomain: community,
    pathname: location.pathname,
    path,
    user,
  });

  // Community subdomain routes
  if (type === 'community' && community) {
    // Handle community login separately
    if (path === '/login') {
      return (
        <Routes>
          <Route path="*" element={<CommunityLoginPage />} />
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

  // Main domain routes
  return (
    <Routes>
      <Route
        path="*"
        element={
          location.pathname === '/' && !subdomainParam ? (
            <LandingPage />
          ) : user ? (
            <Navigate
              to={`/?subdomain=${community}${path}`}
              replace
              state={{ from: location }}
            />
          ) : (
            <LandingPage />
          )
        }
      />
    </Routes>
  );
};
