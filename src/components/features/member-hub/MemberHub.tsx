import React, { useMemo } from 'react';
import { ProfileSection } from './ProfileSection';
import { OpportunitiesSection } from './OpportunitiesSection';
import { CareerAcademy } from './CareerAcademy';
import { UpcomingEvents } from './UpcomingEvents';

interface MemberHubProps {
  styles: any;
  testUser?: {
    name: string;
    role: string;
    profileComplete: number;
    avatar: string;
  };
}

export function MemberHub({ styles, testUser }: MemberHubProps) {
  // Memoize user data to prevent unnecessary re-renders
  const userData = useMemo(
    () => ({
      userName: testUser?.name || 'Clara',
      profileComplete: testUser?.profileComplete || 70,
      userAvatar:
        testUser?.avatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    }),
    [testUser]
  );

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#F8F7FF',
        fontFamily: styles.typography.bodyFont,
        color: styles.colors.text,
      }}
    >
      <div className="min-h-screen overflow-x-hidden px-2 sm:px-4">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
            Hi, {testUser?.name}!
          </h1>

          <div className="grid lg:grid-cols-9 gap-6 lg:gap-8">
            {/* Center Column - Main Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <UpcomingEvents styles={styles} />
              </div>
              <OpportunitiesSection styles={styles} />
              <CareerAcademy styles={styles} />
            </div>

            {/* Right Column - Profile */}
            <div className="lg:col-span-3 space-y-6 mt-6 lg:mt-0">
              <ProfileSection
                userName={userData.userName}
                avatar={userData.userAvatar}
                profileComplete={userData.profileComplete}
                styles={styles}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
