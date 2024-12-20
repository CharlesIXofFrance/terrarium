import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location?: string;
    description?: string;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {event.title}
      </h3>

      <div className="flex items-start space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>{event.date}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>{event.time}</span>
        </div>
      </div>

      {event.location && (
        <div className="mt-2 text-sm text-gray-600">
          <span>📍 {event.location}</span>
        </div>
      )}

      {event.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {event.description}
        </p>
      )}

      <Link
        to={`/events/${event.id}`}
        className="mt-3 inline-block text-sm text-indigo-600 hover:text-indigo-700"
      >
        View details →
      </Link>
    </div>
  );
}
