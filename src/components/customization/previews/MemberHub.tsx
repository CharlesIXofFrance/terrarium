import React from 'react';
import { MemberHub as LiveMemberHub } from '../../member-hub/MemberHub';

interface MemberHubPreviewProps {
  styles: any;
  mode: string;
  testUser?: {
    name: string;
    role: string;
    profileComplete: number;
    avatar: string;
    mentoring?: boolean;
    coaching?: boolean;
  };
}

export function MemberHub({ styles, testUser }: MemberHubPreviewProps) {
  const mockUser = {
    name: 'Clara Johnson',
    role: 'member',
    profileComplete: 70,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    mentoring: true,
    coaching: true,
  };

  return <LiveMemberHub styles={styles} testUser={testUser || mockUser} />;
}