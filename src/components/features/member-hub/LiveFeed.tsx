import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FeedItem } from '@/components/features/feed/FeedItem';
import { useFeed } from '@/lib/hooks/useFeed';

export function LiveFeed() {
  const { communitySlug } = useParams();
  const { feed } = useFeed();

  return (
    <section className="bg-white rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Live Feed</h2>
        <Link
          to={`/m/${communitySlug}/feed`}
          className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {feed.slice(0, 3).map((item) => (
          <FeedItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
