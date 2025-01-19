import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CommunityLayout } from '@/components/layout/CommunityLayout';
import { MemberLayout } from '@/components/features/members/MemberLayout';
import { Dashboard } from '@/pages/community/Dashboard';
import { Members } from '@/pages/community/Members';
import { Jobs } from '@/pages/community/Jobs';
import { Employers } from '@/pages/community/Employers';
import { JobBoardSettings } from '@/pages/community/JobBoardSettings';
import { BrandingSettings } from '@/pages/community/BrandingSettings';
import { CustomizationPortal } from '@/pages/community/CustomizationPortal';
import { MemberHub } from '@/pages/member/MemberHub';
import { JobBoard } from '@/pages/member/JobBoard';
import { JobDetails } from '@/pages/member/JobDetails';
import { Events } from '@/pages/member/Events';
import { Feed } from '@/pages/member/Feed';
import { MemberProfile } from '@/pages/member/MemberProfile';
import { CommunityAccessGuard } from '@/components/features/auth/CommunityAccessGuard';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAtom } from 'jotai';
import { userCommunityAtom } from '@/lib/stores/auth';
import { OwnerOnboarding } from '../features/onboarding/OwnerOnboarding';
import { CommunityMemberOnboarding } from '../features/onboarding/community-member/CommunityMemberOnboarding';
import { DataSettings } from '@/pages/community/DataSettings';

export const CommunityRoutes: React.FC = () => {
  const { user } = useAuth();
  const [userCommunity] = useAtom(userCommunityAtom);
  const location = useLocation();

  // Get the path from the subdomain parameter
  const params = new URLSearchParams(window.location.search);
  const subdomainParam = params.get('subdomain') || '';
  const [community, ...pathParts] = subdomainParam.split('/');
  const path = pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';

  // Check if user is admin or owner of this specific community
  const hasAdminAccess =
    (user?.role === 'community_admin' || user?.role === 'community_owner') &&
    userCommunity?.slug === community;

  // Check if onboarding is complete
  const isOnboardingComplete = user?.profile_complete;

  console.log('CommunityRoutes - Debug:', {
    user: {
      id: user?.id,
      role: user?.role,
      profileComplete: user?.profile_complete,
    },
    userCommunity: {
      id: userCommunity?.id,
      slug: userCommunity?.slug,
      ownerId: userCommunity?.owner_id,
    },
    hasAdminAccess,
    isOnboardingComplete,
    pathname: location.pathname,
    subdomainParam,
    community,
    path,
  });

  // Admin routes mapping
  const adminRoutes: Record<string, React.ReactNode> = {
    '/settings': <Dashboard />,
    '/settings/dashboard': <Dashboard />,
    '/settings/members': <Members />,
    '/settings/jobs': <Jobs />,
    '/settings/employers': <Employers />,
    '/settings/job-board': <JobBoardSettings />,
    '/settings/branding': <BrandingSettings />,
    '/settings/customize': <CustomizationPortal />,
    '/settings/data': <DataSettings />,
  };

  // Member routes mapping
  const memberRoutes: Record<string, React.ReactNode> = {
    '/': <MemberHub />,
    '/jobs': <JobBoard />,
    '/events': <Events />,
    '/feed': <Feed />,
    '/profile': <MemberProfile />,
  };

  // Function to find matching route with dynamic parameters
  const findMatchingRoute = (
    routes: Record<string, React.ReactNode>,
    path: string
  ) => {
    // First try exact match
    if (routes[path]) {
      return routes[path];
    }

    // Handle dynamic routes
    if (path.startsWith('/jobs/')) {
      return <JobDetails />;
    }

    return null;
  };

  // Handle onboarding routes
  if (path === '/onboarding') {
    // If we're on a community subdomain, always show member onboarding
    if (community) {
      return <CommunityMemberOnboarding />;
    }
    // Otherwise, show owner onboarding for admins
    return <OwnerOnboarding />;
  }

  // Redirect to onboarding if not complete
  if (!isOnboardingComplete && !path.includes('/onboarding')) {
    return <Navigate to={`/?subdomain=${community}/onboarding`} replace />;
  }

  return (
    <CommunityAccessGuard>
      {hasAdminAccess ? (
        <Routes>
          {path.startsWith('/settings') ? (
            <Route element={<CommunityLayout />}>
              <Route
                path="*"
                element={
                  adminRoutes[path] || (
                    <Navigate
                      to={`/?subdomain=${community}/settings`}
                      replace
                      state={{ from: location }}
                    />
                  )
                }
              />
            </Route>
          ) : (
            <Route element={<MemberLayout />}>
              <Route
                path="*"
                element={
                  findMatchingRoute(memberRoutes, path) || (
                    <Navigate
                      to={`/?subdomain=${community}`}
                      replace
                      state={{ from: location }}
                    />
                  )
                }
              />
            </Route>
          )}
        </Routes>
      ) : (
        <Routes>
          <Route element={<MemberLayout />}>
            <Route
              path="*"
              element={
                findMatchingRoute(memberRoutes, path) || (
                  <Navigate
                    to={`/?subdomain=${community}`}
                    replace
                    state={{ from: location }}
                  />
                )
              }
            />
          </Route>
        </Routes>
      )}
    </CommunityAccessGuard>
  );
};
