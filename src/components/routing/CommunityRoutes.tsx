import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CommunityLayout } from '@/components/layout/CommunityLayout';
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
import { useAuth } from '@/lib/hooks/useAuth';
import { useAtom } from 'jotai';
import { userCommunityAtom } from '@/lib/stores/auth';
import { OwnerOnboarding } from '../features/onboarding/OwnerOnboarding';
import { CommunityMemberOnboarding } from '../features/onboarding/community-member/CommunityMemberOnboarding';
import { DataSettings } from '@/pages/community/DataSettings';
import { AuthGuard } from '../features/auth/AuthGuard';
import { AuthCallback } from '@/pages/auth/AuthCallback';
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  profile_complete: boolean;
  onboarding_step: number;
}

export const CommunityRoutes: React.FC = () => {
  const { user } = useAuth();
  const [userCommunity] = useAtom(userCommunityAtom);
  const location = useLocation();

  // Parse subdomain and path from URL parameters
  const params = new URLSearchParams(window.location.search);
  const community = params.get('subdomain') || '';
  const pathParam = params.get('path') || '/';

  // Normalize the path by removing any trailing slashes and ensuring it starts with /
  const path =
    pathParam.endsWith('/') && pathParam !== '/'
      ? pathParam.slice(0, -1)
      : pathParam;

  // Fetch user profile data
  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, profile_complete, onboarding_step')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  // Check if user is admin or owner of this specific community
  const hasAdminAccess =
    (user?.role === 'admin' || user?.role === 'owner') &&
    userCommunity?.slug === community;

  // Check if onboarding is complete based on user role
  const isOnboardingComplete = hasAdminAccess
    ? userCommunity?.onboarding_completed
    : profile?.profile_complete;

  console.log('CommunityRoutes - Debug:', {
    user: {
      id: user?.id,
      role: user?.role,
    },
    profile: {
      profileComplete: profile?.profile_complete,
      onboardingStep: profile?.onboarding_step,
    },
    userCommunity: {
      id: userCommunity?.id,
      slug: userCommunity?.slug,
      ownerId: userCommunity?.owner_id,
      onboardingCompleted: userCommunity?.onboarding_completed,
    },
    hasAdminAccess,
    isOnboardingComplete,
    pathname: location.pathname,
    community,
    path,
  });

  // Helper function to build URL with subdomain and path
  const buildUrl = (subdomain: string, path: string) =>
    `/?subdomain=${subdomain}&path=${path}`;

  // If onboarding is not complete, redirect to onboarding
  if (!isOnboardingComplete && path !== '/onboarding') {
    return <Navigate to={buildUrl(community, '/onboarding')} replace />;
  }

  // Admin routes mapping
  const adminRoutes: Record<string, React.ReactNode> = {
    '/settings': (
      <AuthGuard requiredRole="admin">
        <Dashboard />
      </AuthGuard>
    ),
    '/settings/dashboard': (
      <AuthGuard requiredRole="admin">
        <Dashboard />
      </AuthGuard>
    ),
    '/settings/members': (
      <AuthGuard requiredRole="admin">
        <Members />
      </AuthGuard>
    ),
    '/settings/jobs': (
      <AuthGuard requiredRole="admin">
        <Jobs />
      </AuthGuard>
    ),
    '/settings/employers': (
      <AuthGuard requiredRole="admin">
        <Employers />
      </AuthGuard>
    ),
    '/settings/job-board': (
      <AuthGuard requiredRole="admin">
        <JobBoardSettings />
      </AuthGuard>
    ),
    '/settings/branding': (
      <AuthGuard requiredRole="admin">
        <BrandingSettings />
      </AuthGuard>
    ),
    '/settings/data': (
      <AuthGuard requiredRole="admin">
        <DataSettings />
      </AuthGuard>
    ),
    '/settings/customization': (
      <AuthGuard requiredRole="admin">
        <CustomizationPortal />
      </AuthGuard>
    ),
  };

  // Member routes mapping
  const memberRoutes: Record<string, React.ReactNode> = {
    '/': <MemberHub />,
    '/jobs': <JobBoard />,
    '/jobs/:id': <JobDetails />,
    '/events': <Events />,
    '/feed': <Feed />,
    '/profile': <MemberProfile />,
  };

  // Special routes
  const specialRoutes: Record<string, React.ReactNode> = {
    '/onboarding': hasAdminAccess ? (
      <OwnerOnboarding />
    ) : (
      <CommunityMemberOnboarding />
    ),
    '/auth/callback': <AuthCallback />,
    '/unauthorized': <UnauthorizedPage />,
  };

  // Determine which routes to show based on user role
  const routesToUse = hasAdminAccess
    ? { ...adminRoutes, ...memberRoutes, ...specialRoutes }
    : { ...memberRoutes, ...specialRoutes };

  // Find matching route
  const matchingRoute = routesToUse[path];

  console.log('CommunityRoutes - Route Debug:', {
    path,
    availableRoutes: Object.keys(routesToUse),
    matchingRoute: !!matchingRoute,
    specialRoutes: Object.keys(specialRoutes),
    isOnboardingComplete,
    profile,
  });

  const content = matchingRoute ? (
    <Route path="*" element={matchingRoute} />
  ) : (
    <Route
      path="*"
      element={<Navigate to={buildUrl(community, '/')} replace />}
    />
  );

  return (
    <Routes>
      <Route element={<CommunityLayout />}>{content}</Route>
    </Routes>
  );
};
