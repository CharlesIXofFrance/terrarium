import React from 'react';

interface ProfileSectionProps {
  userName: string;
  avatar: string;
  profileComplete: number;
  styles: any;
}

export function ProfileSection({ 
  userName, 
  avatar, 
  profileComplete,
  styles 
}: ProfileSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 className="font-semibold mb-4 md:mb-6">Your WiF Sister Profile</h2>
      
      {/* Profile Picture with Circular Progress */}
      <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
        <div className="relative">
          <div className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden">
            <img
              src={avatar}
              alt={userName}
              className="w-full h-full object-cover"
            />
          </div>
          <div 
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: styles.colors.primary }}
          >
            {profileComplete}%
          </div>
        </div>
        <div>
          <div className="font-medium text-lg">{userName}</div>
          <div className="text-sm text-gray-500">Member since 2024</div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-4 sm:mt-6 space-y-4">
        <div 
          className="p-4 sm:p-5 rounded-lg"
          style={{ backgroundColor: styles.colors.primary }}
        >
          <h3 className="text-white font-semibold mb-2 text-base">
            Be Mentored by an Industry Expert
          </h3>
          <p className="text-white/80 text-sm mb-3">
            Book your free career consultation with one of our expert mentors.
          </p>
          <button className="w-full bg-white py-3 rounded-lg font-medium transition-opacity hover:opacity-90 min-h-[44px]"
            style={{ color: styles.colors.primary }}
          >
            Book Consultation
          </button>
        </div>

        <div 
          className="p-4 sm:p-5 rounded-lg"
          style={{ backgroundColor: styles.colors.primary }}
        >
          <h3 className="text-white font-semibold mb-2 text-base">
            Discover WiF Coaching Sessions
          </h3>
          <p className="text-white/80 text-sm mb-2 sm:mb-3">
            Get personalized coaching to achieve your career goals.
          </p>
          <button className="w-full bg-white py-3 rounded-lg font-medium transition-opacity hover:opacity-90 min-h-[44px]"
            style={{ color: styles.colors.primary }}
          >
            Explore Coaching
          </button>
        </div>
      </div>
    </div>
  );
}