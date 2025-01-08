import { tokens } from '../tokens';

export const communityOwnerTheme = {
  page: {
    header: {
      title: 'text-2xl font-bold text-gray-900',
      subtitle: 'text-gray-600 mt-1',
      container: 'flex justify-between items-center',
      actions: 'flex items-center space-x-4',
    },
    section: {
      title: 'text-lg font-medium text-gray-900 mb-4',
      subtitle: 'text-gray-600 mt-1',
      container: 'space-y-8',
    },
  },
  cards: {
    stat: {
      container: 'bg-white p-6 rounded-lg shadow-sm',
      icon: {
        wrapper: 'p-2 bg-indigo-50 rounded-lg',
        icon: 'h-6 w-6 text-indigo-600',
      },
      header: 'flex justify-between items-start',
      content: 'mt-4',
      title: 'text-sm font-medium text-gray-500',
      value: 'text-2xl font-semibold text-gray-900 mt-1',
      period: 'text-sm text-gray-500 mt-1',
      metric: {
        wrapper: 'flex items-center text-sm',
        positive: 'text-green-600',
        negative: 'text-red-600',
        icon: 'h-4 w-4 mr-1',
      },
    },
    default: {
      container: 'bg-white p-6 rounded-lg shadow-sm',
      title: 'text-lg font-medium text-gray-900 mb-4',
    },
    resource: {
      container: 'flex items-center justify-between py-2',
      content: {
        wrapper: 'flex-1 min-w-0',
        label: 'text-sm font-medium text-gray-900',
        url: 'text-sm text-gray-500',
      },
      action: 'ml-2',
    },
    help: {
      title: 'text-sm font-medium text-gray-900',
      link: 'flex items-center text-sm text-gray-600 hover:text-gray-900',
      icon: 'h-4 w-4 ml-1',
    },
  },
  forms: {
    select: 'rounded-lg border-gray-300 text-sm',
  },
  layout: {
    grid: {
      stats: 'grid grid-cols-1 md:grid-cols-3 gap-6',
      content: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
    },
    section: {
      main: 'lg:col-span-2',
      sidebar: 'space-y-6',
    },
  },
} as const;
