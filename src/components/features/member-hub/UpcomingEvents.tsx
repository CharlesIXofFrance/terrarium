import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { EventCard } from '@/components/features/events/EventCard';
import { useEvents } from '@/lib/hooks/useEvents';

export function UpcomingEvents() {
  const { communitySlug } = useParams();
  const { events = [], isLoading, error } = useEvents();

  return (
    <section className="bg-white rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
        <Link
          to={`/m/${communitySlug}/events`}
          className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-gray-500">Loading events...</div>
        ) : error ? (
          <div className="text-red-500">Failed to load events</div>
        ) : events.length === 0 ? (
          <div className="text-gray-500">No upcoming events</div>
        ) : (
          events
            .slice(0, 3)
            .map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </section>
  );
}
