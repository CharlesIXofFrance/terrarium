import { useQuery } from '@tanstack/react-query';
import type { Event } from '../types/events';

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Introduction to Finance Academy',
    date: '2024-01-05',
    location: 'London',
    type: 'online',
    image:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=200&fit=crop',
    capacity: 100,
    attendees: 45,
  },
  {
    id: '2',
    title: 'Role Model Event',
    subtitle: 'Aweng Majidpour',
    date: '2024-10-22',
    location: 'London',
    type: 'in-person',
    image:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=200&fit=crop',
    capacity: 50,
    attendees: 32,
  },
  {
    id: '3',
    title: 'WiF Hackathon',
    date: '2024-10-26',
    location: 'London',
    type: 'in-person',
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=200&fit=crop',
    capacity: 75,
    attendees: 60,
  },
  {
    id: '4',
    title: 'WiF Anniversary Cocktail',
    date: '2024-10-29',
    location: 'London',
    type: 'in-person',
    image:
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300&h=200&fit=crop',
    capacity: 200,
    attendees: 150,
  },
];

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_EVENTS;
    },
    initialData: MOCK_EVENTS, // Provide initial data to avoid loading state
  });
}
