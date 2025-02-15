import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { parseDomain } from '@/lib/utils/subdomain';
import { LandingPage } from '@/pages/LandingPage';
import { CommunityRoutes } from './CommunityRoutes';
import { PlatformRoutes } from './PlatformRoutes';
import { AuthGuard } from '@/components/features/auth/AuthGuard';
import { useAuth } from '@/lib/hooks/useAuth';
import { CommunityLoginPage } from '@/pages/auth/CommunityLoginPage';
import { VerifyCallback } from '@/pages/auth/VerifyCallback';
import { PlatformRegister } from '@/pages/auth/PlatformRegister';
import { PlatformLogin } from '@/pages/auth/PlatformLogin';
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage';
import { OwnerOnboarding } from '@/components/features/onboarding/OwnerOnboarding';

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
      : pathParam || location.pathname;

  console.log('SubdomainRouter - Debug:', {
    type,
    subdomain: community,
    pathname: location.pathname,
    search: location.search,
    pathParam,
    path,
    user,
    env: process.env.NODE_ENV,
    url: window.location.href,
    fullPath: window.location.pathname + window.location.search,
  });

  // Handle auth confirmation route for all domains
  if (path === '/auth/confirm') {
    console.log('Rendering VerifyCallback');
    return (
      <Routes>
        <Route path="*" element={<VerifyCallback />} />
      </Routes>
    );
  }

  // Community subdomain routes
  if (type === 'community' && community) {
    console.log('Rendering community routes');
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
        <Route element={<AuthGuard allowedRoles={['owner', 'member']} />}>
          <Route path="*" element={<CommunityRoutes />} />
        </Route>
      </Routes>
    );
  }

  // Platform subdomain routes
  if (
    type === 'platform' ||
    community === 'platform' ||
    (user?.role === 'owner' && !community)
  ) {
    console.log('Rendering platform routes');
    // Show login/register pages if not logged in
    if (!user) {
      console.log('User not logged in, showing platform auth routes');
      return (
        <Routes>
          <Route path="/platform/register" element={<PlatformRegister />} />
          <Route path="/register" element={<PlatformRegister />} />
          <Route path="/platform/login" element={<PlatformLogin />} />
          <Route path="/login" element={<PlatformLogin />} />
          <Route path="/auth/callback" element={<VerifyCallback />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<PlatformLogin />} />
        </Routes>
      );
    }

    // Show platform routes for authenticated users
    return (
      <Routes>
        <Route path="/onboarding" element={<OwnerOnboarding />} />
        <Route path="/auth/callback" element={<VerifyCallback />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<PlatformRoutes />} />
      </Routes>
    );
  }

  // Main domain routes
  console.log('Rendering main domain routes');
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/platform/register" element={<PlatformRegister />} />
      <Route path="/register" element={<PlatformRegister />} />
      <Route path="/platform/login" element={<PlatformLogin />} />
      <Route path="/login" element={<PlatformLogin />} />
      <Route path="/auth/callback" element={<VerifyCallback />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<PlatformLogin />} />
    </Routes>
  );
};
