import { QueryClient } from '@tanstack/react-query';
export * from './utils';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Re-export API modules
export * from './recruitcrm';
export * from './mockApi';
