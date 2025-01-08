import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import {
  getFieldDefinitions,
  updateFieldDefinitions,
  updateCustomFields,
} from '../customFields';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Custom Fields API', () => {
  const mockCommunityId = 'test-community-id';
  const mockUserId = 'test-user-id';
  const mockSection = 'background';
  const mockFieldDefinitions = [
    {
      name: 'Test Field',
      type: 'text',
      required: true,
      help_text: 'Test help text',
      display_order: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getFieldDefinitions', () => {
    it('should fetch field definitions successfully', async () => {
      const mockResponse = {
        data: { field_definitions: mockFieldDefinitions },
        error: null,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockResponse),
            }),
          }),
        }),
      } as any);

      const result = await getFieldDefinitions(mockCommunityId, mockSection);
      expect(result.data).toEqual(mockFieldDefinitions);
      expect(result.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const mockError = {
        code: 'TEST_ERROR',
        message: 'Test error message',
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: null, error: mockError }),
            }),
          }),
        }),
      } as any);

      const result = await getFieldDefinitions(mockCommunityId, mockSection);
      expect(result.data).toBeNull();
      expect(result.error?.code).toBe(mockError.code);
    });
  });

  describe('updateFieldDefinitions', () => {
    it('should update field definitions successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      const result = await updateFieldDefinitions(
        mockCommunityId,
        mockSection,
        mockFieldDefinitions
      );
      expect(result.error).toBeNull();
    });

    it('should handle update errors', async () => {
      const mockError = {
        code: 'TEST_ERROR',
        message: 'Test error message',
      };

      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: mockError }),
      } as any);

      const result = await updateFieldDefinitions(
        mockCommunityId,
        mockSection,
        mockFieldDefinitions
      );
      expect(result.error?.code).toBe(mockError.code);
    });
  });

  describe('updateCustomFields', () => {
    it('should update custom field values successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await updateCustomFields(mockUserId, mockSection, {
        testField: 'test value',
      });
      expect(result.error).toBeNull();
    });

    it('should handle update errors', async () => {
      const mockError = {
        code: 'TEST_ERROR',
        message: 'Test error message',
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: mockError }),
        }),
      } as any);

      const result = await updateCustomFields(mockUserId, mockSection, {
        testField: 'test value',
      });
      expect(result.error?.code).toBe(mockError.code);
    });
  });
});
