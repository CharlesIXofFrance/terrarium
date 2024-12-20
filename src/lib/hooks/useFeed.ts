import { useState, useEffect } from 'react';

interface FeedItem {
  id: string;
  type: 'post' | 'event' | 'job' | 'member';
  title: string;
  description?: string;
  author: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  url?: string;
}

export function useFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        // TODO: Replace with actual API call
        const mockFeed: FeedItem[] = [
          {
            id: '1',
            type: 'post',
            title: 'Welcome to our community!',
            description: "We're excited to have you here.",
            author: {
              name: 'Community Admin',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            },
            timestamp: new Date(),
          },
          {
            id: '2',
            type: 'event',
            title: 'Networking Event',
            description: 'Join us for our monthly networking event.',
            author: {
              name: 'Events Team',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=events',
            },
            timestamp: new Date(),
            url: '/events/networking-2024',
          },
          {
            id: '3',
            type: 'job',
            title: 'Senior Developer Position',
            description: "We're hiring a senior developer!",
            author: {
              name: 'HR Team',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hr',
            },
            timestamp: new Date(),
            url: '/jobs/senior-dev',
          },
        ];

        setFeed(mockFeed);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch feed')
        );
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, []);

  return {
    feed,
    isLoading,
    error,
  };
}
