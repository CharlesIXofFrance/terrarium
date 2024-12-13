import React from 'react';
import { Header } from '../../member-hub/Header';
import { Home, Briefcase, Calendar, BookOpen } from 'lucide-react';

interface NavigationProps {
  styles: any;
  mode: string;
}

export function Navigation({ styles, mode }: NavigationProps) {
  const navigation = [
    { name: 'Home', href: '#', icon: Home },
    { name: 'Jobs', href: '#', icon: Briefcase },
    { name: 'Events', href: '#', icon: Calendar },
    { name: 'Academy', href: '#', icon: BookOpen },
  ];

  return (
    <div className={`min-h-[600px] ${mode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
      <Header 
        styles={styles}
        communityName="Women in Fintech"
        navigation={navigation}
        notifications={[]}
        user={{
          name: 'Clara Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop'
        }}
      />
      <div className="pt-20 px-4">
        <div className="bg-gray-100 rounded-lg p-8">
          <h2 className="text-lg font-semibold mb-4">Navigation Preview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between textI'll help fix the preview in the customization portal to accurately match the live member pages. The key issue is that the preview components need to use the exact same components as the live pages, with the same styling and layout.

<boltArtifact id="fix-preview-components" title="Fix Preview Components in Customization Portal">
<boltAction type="file" filePath="src/components/customization/PagePreview.tsx">
import React from 'react';
import { MemberHub } from '../member-hub/MemberHub';
import { JobBoard } from '../../pages/member/JobBoard';
import { Events } from '../../pages/member/Events';
import { Feed } from '../../pages/member/Feed';
import { MemberProfile } from '../../pages/member/MemberProfile';
import { MemberLayout } from '../member/MemberLayout';

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

export function PagePreview({ pageId, styles, mode, testUser }: PagePreviewProps) {
  // Mock user for consistent preview
  const mockUser = {
    name: 'Clara Johnson',
    role: 'member',
    profileComplete: 70,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
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
      <MemberLayout>
        {getComponent()}
      </MemberLayout>
    </div>
  );
}