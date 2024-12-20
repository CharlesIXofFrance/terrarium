import React from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../../lib/stores/auth';
import { MemberHub as MemberHubComponent } from '@/components/features/member-hub/MemberHub';

export function MemberHub() {
  const [user] = useAtom(userAtom);

  const styles = {
    colors: {
      primary: '#8B0000',
      secondary: '#E5E7EB',
      background: '#FFFFFF',
      text: '#111827',
      accent: '#F59E0B',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseSize: '16px',
      scale: 1.2,
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
  };

  const testUser = {
    name: user?.name || 'Clara',
    role: user?.role || 'member',
    profileComplete: 70,
    avatar:
      user?.avatar ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    mentoring: true,
    coaching: true,
  };

  return <MemberHubComponent styles={styles} testUser={testUser} />;
}
