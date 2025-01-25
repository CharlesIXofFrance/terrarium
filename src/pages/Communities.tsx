import React from 'react';
import { CommunityCard } from '../components/communities/CommunityCard';
import type { Community } from '../lib/types';

const MOCK_COMMUNITIES: Community[] = [
  {
    id: '1',
    name: 'React Developers',
    description:
      'A community for React developers to share knowledge and find opportunities.',
    memberCount: 1500,
    jobCount: 25,
  },
  {
    id: '2',
    name: 'Product Designers',
    description:
      'Connect with fellow designers and discover exciting design opportunities.',
    memberCount: 800,
    jobCount: 15,
  },
];

export function Communities() {
  const handleJoin = (communityId: string) => {
    console.log('Joining community:', communityId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Discover Communities
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {MOCK_COMMUNITIES.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onJoin={handleJoin}
          />
        ))}
      </div>
    </div>
  );
}
