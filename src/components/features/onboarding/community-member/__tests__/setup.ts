import React from 'react';
import { vi } from 'vitest';

// Mock UI components
vi.mock('@/components/ui/atoms/Progress', () => ({
  default: (props: { value: number }) =>
    React.createElement('div', {
      'data-testid': 'progress',
      'data-value': props.value,
    }),
}));

vi.mock('@/components/ui/atoms/Button', () => ({
  default: (props: { children: React.ReactNode; onClick?: () => void }) =>
    React.createElement('button', { onClick: props.onClick }, props.children),
}));

vi.mock('@/components/ui/atoms/Input', () => ({
  default: (props: any) => React.createElement('input', props),
}));

vi.mock('@/components/ui/atoms/Select', () => ({
  default: (props: any) => React.createElement('select', props, props.children),
}));

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          welcomeVideoUrl: 'https://example.com/welcome.mp4',
          identityPactTemplate: 'Welcome to our community!',
          customFields: [],
          requiresApproval: false,
          rewardsConfig: {
            welcomeMeme: 'https://example.com/meme.jpg',
            completionAnimation: 'confetti',
          },
        },
      }),
      update: vi.fn().mockResolvedValue({ error: null }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  },
}));

// Mock hooks
vi.mock('@/lib/hooks/useToast', () => ({
  default: () => ({
    toast: vi.fn(),
  }),
}));
