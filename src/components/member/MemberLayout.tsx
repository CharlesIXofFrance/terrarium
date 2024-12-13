import React, { useState, useCallback, useMemo } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { Header } from '../member-hub/Header';
import { useAtom } from 'jotai';
import { userAtom } from '../../lib/auth';
import { Home, Briefcase, Calendar, BookOpen } from 'lucide-react';

interface MemberLayoutProps {
  children?: React.ReactNode;
  mode?: 'desktop' | 'mobile' | 'fullscreen';
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

export function MemberLayout({ children, mode = 'desktop', isPreview = false }: MemberLayoutProps) {
  const [user] = useAtom(userAtom);
  const location = useLocation();
  const { communitySlug } = useParams();
  const [showNotifications, setShowNotifications] = useState(false);

  const baseSlug = isPreview ? '#' : `/m/${communitySlug || 'women-in-fintech'}`;

  const mockUser = useMemo(() => ({
    name: 'Clara Johnson',
    role: 'member',
    profileComplete: 70,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    mentoring: true,
    coaching: true,
  }), []);

  const navigation = useMemo(() => [
    { name: 'Home', href: baseSlug, icon: Home },
    { name: 'Jobs', href: `${baseSlug}/jobs`, icon: Briefcase },
    { name: 'Events', href: `${baseSlug}/events`, icon: Calendar },
    { name: 'Academy', href: `${baseSlug}/academy`, icon: BookOpen },
  ], [baseSlug]);

  const notifications = useMemo(() => [
    { id: 1, title: 'New job match!', message: 'A new job matching your profile has been posted.' },
    { id: 2, title: 'Upcoming event', message: 'Don\'t forget about the networking event tomorrow!' },
  ], []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  return (
    <div className={`relative min-h-screen bg-gray-50 ${mode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
      <div className="relative transition-all duration-200">
        <Header
          styles={THEME}
          communityName="Women in Fintech"
          navigation={navigation}
          currentPath={location.pathname}
          notifications={notifications}
          showNotifications={showNotifications}
          onToggleNotifications={toggleNotifications}
          user={isPreview ? mockUser : user}
          isPreview={isPreview}
        />
      </div>
      <main className="pt-16">
        {children || <Outlet />}
      </main>
    </div>
  );
}