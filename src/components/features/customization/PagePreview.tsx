import React from 'react';
import { MemberHub } from '../member-hub/MemberHub';
import { JobBoard } from '../../../pages/member/JobBoard';
import { Events } from '../../../pages/member/Events';
import { Feed } from '../../../pages/member/Feed';
import { MemberProfile } from '../../../pages/member/MemberProfile';
import { MemberLayout } from '../members/MemberLayout';

interface PagePreviewProps {
  pageId: string;
  styles: any;
  mode: 'desktop' | 'mobile' | 'fullscreen';
  testUser?: {
    name: string;
    role: string;
    profileComplete: number;
    avatar: string;
    mentoring?: boolean;
    coaching?: boolean;
    communityStats?: {
      members: number;
      activeMembers: string;
      jobViews: number;
    };
  };
}

export function PagePreview({
  pageId,
  styles,
  mode,
  testUser,
}: PagePreviewProps) {
  // Mock user for consistent preview
  const mockUser = {
    name: 'Clara Johnson',
    role: 'member',
    profileComplete: 70,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    mentoring: true,
    coaching: true,
  };

  const getComponent = () => {
    switch (pageId) {
      case 'member-hub':
        return <MemberHub styles={styles} testUser={mockUser} />;
      case 'job-board':
        return <JobBoard />;
      case 'events':
        return <Events />;
      case 'live-feed':
        return <Feed />;
      case 'member-profile':
        return <MemberProfile />;
      default:
        return <div>Preview not available</div>;
    }
  };

  return (
    <div
      className={`min-h-[600px] relative bg-gray-50 ${
        mode === 'mobile' ? 'max-w-sm mx-auto' : ''
      }`}
    >
      <MemberLayout mode={mode} isPreview={true}>
        {getComponent()}
      </MemberLayout>
    </div>
  );
}
