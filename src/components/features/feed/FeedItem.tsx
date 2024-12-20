import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface FeedItemProps {
  item: {
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
  };
}

export function FeedItem({ item }: FeedItemProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'post':
        return '📝';
      case 'event':
        return '📅';
      case 'job':
        return '💼';
      case 'member':
        return '👋';
      default:
        return '📢';
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-10 h-10">
          {item.author.avatar ? (
            <img
              src={item.author.avatar}
              alt={item.author.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-lg">
              {getIcon()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {item.author.name}
            </p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
            </p>
          </div>

          <h3 className="mt-1 text-base font-medium text-gray-900">
            {item.url ? (
              <Link to={item.url} className="hover:text-indigo-600">
                {item.title}
              </Link>
            ) : (
              item.title
            )}
          </h3>

          {item.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
