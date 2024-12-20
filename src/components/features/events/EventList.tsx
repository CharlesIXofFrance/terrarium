import React from 'react';
import { Calendar } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import type { Event } from '../../types/events';

interface EventListProps {
  events: Event[];
  selectedDate: Date | null;
}

export function EventList({ events, selectedDate }: EventListProps) {
  const filteredEvents = selectedDate
    ? events.filter((event) => isSameDay(new Date(event.date), selectedDate))
    : events;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {filteredEvents.map((event, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center p-4 gap-4">
            <img
              src={event.image}
              alt={event.title}
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">{event.title}</h3>
              {event.subtitle && (
                <p className="text-gray-600 mb-2">{event.subtitle}</p>
              )}
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {format(new Date(event.date), 'd MMM')}, {event.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
