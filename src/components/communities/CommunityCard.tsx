import React from 'react';
import { Users, Briefcase } from 'lucide-react';
import type { Community } from '../../lib/types';
import { Button } from '../ui/Button';

interface CommunityCardProps {
  community: Community;
  onJoin: (communityId: string) => void;
}

export function CommunityCard({ community, onJoin }: CommunityCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center space-x-4">
        {community.logo ? (
          <img
            src={community.logo}
            alt={community.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-semibold">
              {community.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{community.name}</h3>
          <p className="text-gray-600 text-sm">{community.description}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-6">
        <div className="flex items-center text-gray-500">
          <Users className="h-4 w-4 mr-2" />
          <span>{community.memberCount} members</span>
        </div>
        <div className="flex items-center text-gray-500">
          <Briefcase className="h-4 w-4 mr-2" />
          <span>{community.jobCount} jobs</span>
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onJoin(community.id)}
        >
          Join Community
        </Button>
      </div>
    </div>
  );
}