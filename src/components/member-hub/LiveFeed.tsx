import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface LiveFeedProps {
  styles: any;
  compact?: boolean;
}

export function LiveFeed({ styles, compact = true }: LiveFeedProps) {
  const { communitySlug } = useParams();

  // Memoize threads data to prevent unnecessary re-renders
  const threads = useMemo(
    () => [
      {
        id: 1,
        title: 'Working from home without getting distracted',
        author: {
          name: 'Emma Wilson',
          avatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop',
        },
      },
      {
        id: 2,
        title: 'Looking to Relocate to the UK',
        author: {
          name: 'Sarah Chen',
          avatar:
            'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=48&h=48&fit=crop',
        },
      },
      {
        id: 3,
        title: 'Any Novas in NYC?',
        author: {
          name: 'Jessica Park',
          avatar:
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=48&h=48&fit=crop',
        },
      },
      {
        id: 4,
        title:
          'France-based Novas: An exclusive invite to the biggest Tech & Retail event on Nov 26-27',
        author: {
          name: 'Marie Laurent',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=48&h=48&fit=crop',
        },
      },
    ],
    []
  );

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Latest Threads</h2>
        <Link
          to={`/m/${communitySlug}/feed`}
          className="text-[#41B9B9] hover:underline text-sm"
        >
          See all
        </Link>
      </div>

      <div className="space-y-6">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className="flex items-start space-x-3 group cursor-pointer"
          >
            <img
              src={thread.author.avatar}
              alt={thread.author.name}
              className="w-10 h-10 rounded-full flex-shrink-0"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 group-hover:text-[#41B9B9] transition-colors line-clamp-2">
                  {thread.title}
                </h3>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-[#41B9B9] transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
