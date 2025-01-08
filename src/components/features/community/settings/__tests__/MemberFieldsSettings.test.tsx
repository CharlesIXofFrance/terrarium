import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemberFieldsSettings } from '../MemberFieldsSettings';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/hooks/useToast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/hooks/useToast', () => ({
  useToast: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const rendered = render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
  return {
    ...rendered,
    debug: (message?: string) => {
      if (message) console.log(message);
      console.log(rendered.container.innerHTML);
    },
  };
};

describe('MemberFieldsSettings', () => {
  const mockCommunityId = 'test-community';
  const mockSection = 'profile';
  const mockFieldDefinitions = [
    {
      name: 'Test Field',
      type: 'text',
      required: true,
      help_text: 'Test help text',
      display_order: 1,
    },
  ];

  const mockSettings = [
    {
      community_id: mockCommunityId,
      section: mockSection,
      field_definitions: mockFieldDefinitions,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(vi.fn());
    queryClient.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and displays field definitions', async () => {
    const mockSelect = vi.fn().mockResolvedValue({
      data: mockSettings,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any);

    const { debug } = renderWithProviders(
      <MemberFieldsSettings
        communityId={mockCommunityId}
        section={mockSection}
      />
    );

    debug('Initial render');

    await waitFor(() => {
      debug('After loading');
      expect(screen.getByText('Test Field')).toBeInTheDocument();
    });
  });

  it('allows adding a new field', async () => {
    const mockSelect = vi.fn().mockResolvedValue({
      data: [
        {
          community_id: mockCommunityId,
          section: mockSection,
          field_definitions: [],
        },
      ],
      error: null,
    });

    const mockUpsert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    } as any);

    const { debug } = renderWithProviders(
      <MemberFieldsSettings
        communityId={mockCommunityId}
        section={mockSection}
      />
    );

    debug('Initial render');

    const addButton = await screen.findByRole('button', { name: /add field/i });
    fireEvent.click(addButton);

    const nameInput = await screen.findByLabelText('Field Name');
    const typeSelect = await screen.findByLabelText('Field Type');
    const requiredCheckbox = await screen.findByLabelText('Required');
    const saveButton = await screen.findByRole('button', { name: /save/i });

    fireEvent.change(nameInput, { target: { value: 'New Field' } });
    fireEvent.change(typeSelect, { target: { value: 'text' } });
    fireEvent.click(requiredCheckbox);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalled();
    });
  });

  it('allows editing an existing field', async () => {
    const mockSelect = vi.fn().mockResolvedValue({
      data: mockSettings,
      error: null,
    });

    const mockUpsert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    } as any);

    const { debug } = renderWithProviders(
      <MemberFieldsSettings
        communityId={mockCommunityId}
        section={mockSection}
      />
    );

    debug('Initial render');

    // Wait for the field to be displayed
    await waitFor(() => {
      debug('After loading');
      expect(screen.getByText('Test Field')).toBeInTheDocument();
    });

    debug('Before clicking edit');
    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);

    debug('After clicking edit');
    const nameInput = await screen.findByLabelText('Field Name');
    const saveButton = await screen.findByRole('button', { name: /save/i });

    fireEvent.change(nameInput, { target: { value: 'Updated Field' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalled();
    });
  });

  it('displays error message when API call fails', async () => {
    const mockError = {
      code: 'TEST_ERROR',
      message: 'Test error message',
    };

    const mockSelect = vi.fn().mockResolvedValue({
      data: mockSettings,
      error: null,
    });

    const mockUpsert = vi.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    } as any);

    const mockToast = vi.fn();
    (useToast as jest.Mock).mockReturnValue(mockToast);

    const { debug } = renderWithProviders(
      <MemberFieldsSettings
        communityId={mockCommunityId}
        section={mockSection}
      />
    );

    debug('Initial render');

    // Wait for the field to be displayed
    await waitFor(() => {
      debug('After loading');
      expect(screen.getByText('Test Field')).toBeInTheDocument();
    });

    debug('Before clicking edit');
    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);

    debug('After clicking edit');
    const nameInput = await screen.findByLabelText('Field Name');
    const saveButton = await screen.findByRole('button', { name: /save/i });

    fireEvent.change(nameInput, { target: { value: 'Updated Field' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to save field',
        type: 'error',
      });
    });
  });
});
