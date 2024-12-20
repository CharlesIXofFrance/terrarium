import React from 'react';
import { UserCircle, MapPin, Building2 } from 'lucide-react';
import { ProgressBar } from '../../ui/ProgressBar';

interface ProfileHeaderProps {
  user: {
    name: string;
    avatar?: string;
    title?: string;
    location?: string;
    interests?: string[];
    coverImage?: string;
    completionPercentage: number;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Cover Image */}
      {user.coverImage && (
        <div className="h-48 w-full relative">
          <img
            src={user.coverImage}
            alt="Profile cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center border-4 border-white shadow-lg">
                <UserCircle className="w-16 h-16 text-indigo-600" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {user.title && (
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Building2 className="w-4 h-4" />
                  <span>{user.title}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2 text-gray-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Completion Status */}
          <div className="flex-1 w-full md:w-auto">
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-700">
                  Profile Completion
                </span>
                <span className="text-sm font-medium text-indigo-700">
                  {user.completionPercentage}%
                </span>
              </div>
              <ProgressBar
                value={user.completionPercentage}
                className="bg-indigo-100/50"
                barClassName="bg-gradient-to-r from-indigo-500 to-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
