import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Event } from '../types/events';

const EVENTS_QUERY_KEY = ['events'];
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Introduction to Finance Academy',
    date: '2024-01-05',
    location: 'London',
    type: 'online',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=200&fit=crop',
    capacity: 100,
    attendees: 45
  },
  {
    id: '2',
    title: 'Role Model Event',
    subtitle: 'Aweng Majidpour',
    date: '2024-10-22',
    location: 'London',
    type: 'in-person',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=200&fit=crop',
    capacity: 50,
    attendees: 32
  }
];

export function useEvents() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_EVENTS;
    },
    initialData: MOCK_EVENTS,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    onSuccess: (data) => {
      // Cache individual events for quick access
      data.forEach(event => {
        queryClient.setQueryData(
          ['event', event.id],
          event
        );
      });
    },
  });
}