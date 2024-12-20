import React from 'react';
import { Calendar } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface UpcomingEventsProps {
  styles: any;
}

export function UpcomingEvents({ styles }: UpcomingEventsProps) {
  const { communitySlug } = useParams();

  const events = [
    {
      title: 'Introduction to Finance Academy',
      date: '5 Jan',
      location: 'London',
      image:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=200&fit=crop',
    },
    {
      title: 'Role Model Event',
      subtitle: 'Aweng Majidpour',
      date: '22 Oct',
      location: 'London',
      image:
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=200&fit=crop',
    },
    {
      title: 'WiF Hackathon',
      date: '26 Oct',
      location: 'London',
      image:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=200&fit=crop',
    },
    {
      title: 'WiF Anniversary Cocktail',
      date: '29 Oct',
      location: 'London',
      image:
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300&h=200&fit=crop',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Upcoming events</h2>
        <Link
          to={`/m/${communitySlug}/events`}
          className="text-[#8B0000] hover:underline font-medium"
        >
          See all
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {events.map((event, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                    {event.date}, {event.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
