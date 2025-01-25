import React, { useState, useCallback, useMemo } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { Header } from '@/components/features/member-hub/Header';
import { MemberFooter } from '@/components/features/member-hub/MemberFooter';
import { useAtom } from 'jotai';
import { userAtom } from '../../../lib/stores/auth';
import { currentCommunityAtom } from '../../../lib/stores/community';
import { Home, Briefcase, Calendar, BookOpen } from 'lucide-react';
import { parseDomain } from '@/lib/utils/subdomain';

interface MemberLayoutProps {
  children?: React.ReactNode;
  mode?: 'desktop' | 'mobile' | 'tablet' | 'fullscreen';
  isPreview?: boolean;
}

export const THEME = {
  colors: {
    primary: '#9b1c1b',
    secondary: '#E5E7EB',
    background: '#FFFFFF',
    text: '#111827',
    textLight: '#6B7280',
    accent: '#F59E0B',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  spacing: {
    containerWidth: '1200px',
    gap: '1rem',
    padding: '2rem',
  },
  shadows: {
    small: '0 1px 2px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.05)',
    large: '0 10px 15px rgba(0, 0, 0, 0.05)',
  },
  borderRadius: '0.5rem',
};

export function MemberLayout({
  children,
  mode = 'desktop',
  isPreview = false,
}: MemberLayoutProps) {
  const [user] = useAtom(userAtom);
  const location = useLocation();
  const { subdomain } = parseDomain();
  const { communitySlug } = useParams();
  const [currentCommunity] = useAtom(currentCommunityAtom);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get the current path from the subdomain parameter
  const params = new URLSearchParams(window.location.search);
  const subdomainParam = params.get('subdomain') || '';
  const [community, ...pathParts] = subdomainParam.split('/');
  const currentPath = pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';

  // Function to create URLs with subdomain parameter
  const createUrl = (path: string) => {
    const baseSubdomain = subdomain || community || currentCommunity?.slug;
    const targetPath = path === '/' ? '' : path;
    return baseSubdomain
      ? `/?subdomain=${baseSubdomain}${targetPath}`
      : targetPath;
  };

  console.log('MemberLayout - Debug:', {
    location,
    subdomain,
    currentCommunity,
    currentPath,
    user,
  });

  const layoutClasses = 'min-h-screen bg-gray-50 relative';
  const contentClasses = 'flex-1 py-6 px-4 sm:px-6 lg:px-8 mt-[72px] relative';

  const mockUser = useMemo(
    () => ({
      name: 'Clara Johnson',
      role: 'member',
      profileComplete: 70,
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
      mentoring: true,
      coaching: true,
      community: currentCommunity,
    }),
    [currentCommunity]
  );

  const navigation = useMemo(
    () => [
      { name: 'Home', href: '/', icon: Home },
      { name: 'Jobs', href: '/jobs', icon: Briefcase },
      { name: 'Events', href: '/events', icon: Calendar },
      { name: 'Academy', href: '/academy', icon: BookOpen },
    ],
    []
  );

  const notifications = useMemo(
    () => [
      {
        id: 1,
        title: 'New job match!',
        message: 'A new job matching your profile has been posted.',
      },
      {
        id: 2,
        title: 'Upcoming event',
        message: "Don't forget about the networking event tomorrow!",
      },
    ],
    []
  );

  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => !prev);
  }, []);

  return (
    <div className={layoutClasses}>
      <Header
        styles={THEME}
        mode={mode}
        communityName={currentCommunity?.name}
        navigation={navigation}
        currentPath={currentPath}
        notifications={notifications}
        showNotifications={showNotifications}
        onToggleNotifications={toggleNotifications}
        user={isPreview ? mockUser : user}
        isPreview={isPreview}
      />
      <main className={contentClasses}>{children || <Outlet />}</main>
      <MemberFooter />
    </div>
  );
}
