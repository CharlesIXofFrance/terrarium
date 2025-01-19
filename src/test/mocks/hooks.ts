import { vi } from 'vitest';

// Mock custom fields hook
vi.mock('@/lib/hooks/useCommunityFields', () => ({
  useCommunityFields: () => ({
    data: [
      {
        id: 'field-1',
        name: 'Experience Level',
        type: 'select',
        options: ['Junior', 'Mid-Level', 'Senior'],
        required: true,
      },
      {
        id: 'field-2',
        name: 'Skills',
        type: 'multiselect',
        options: ['React', 'TypeScript', 'Node.js'],
        required: false,
      },
    ],
    isLoading: false,
    error: null,
  }),
}));
