import React from 'react';
import { LiveFeed } from '@/components/features/member-hub/LiveFeed';
import { Search } from 'lucide-react';

export function Feed() {
  const styles = {
    colors: {
      primary: '#8B0000',
      secondary: '#E5E7EB',
      background: '#FFFFFF',
      text: '#111827',
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search threads..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#41B9B9] focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Feed */}
      <LiveFeed styles={styles} compact={false} />
    </div>
  );
}
