import React from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../../lib/stores/auth';
import { ProfileHeader } from '../../components/member/profile/ProfileHeader';
import { ProfileSidebar } from '../../components/member/profile/ProfileSidebar';
import { ProfileTabs } from '../../components/member/profile/ProfileTabs';

export function MemberProfile() {
  const [user] = useAtom(userAtom);

  const completionSteps = [
    {
      id: 'work',
      label: 'Add work experience',
      completed: true,
      icon: 'Briefcase',
    },
    {
      id: 'education',
      label: 'Add education',
      completed: true,
      icon: 'GraduationCap',
    },
    {
      id: 'skills',
      label: 'Add skills & technologies',
      completed: false,
      icon: 'Code',
    },
    {
      id: 'languages',
      label: 'Add languages',
      completed: false,
      icon: 'Globe',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <ProfileHeader
              user={{
                name: user?.name || 'Clara Johnson',
                avatar: user?.avatar,
                title: 'Senior Product Manager',
                location: 'London, UK',
                interests: ['Product Management', 'Fintech', 'Women in Tech'],
                completionPercentage: 65,
                coverImage:
                  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
              }}
            />
            <ProfileTabs />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <ProfileSidebar completionSteps={completionSteps} />
          </div>
        </div>
      </div>
    </div>
  );
}
