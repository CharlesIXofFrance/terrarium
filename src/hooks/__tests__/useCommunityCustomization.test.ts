/**
 * AI Context:
 * This file contains tests for the useCommunityCustomization hook. It tests both
 * the data fetching and mutation functionality, including error cases and auth checks.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCommunityCustomization } from '../useCommunityCustomization';
import { supabase } from '../../lib/supabase';
import { wrapper } from '../../test/testUtils';

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      update: vi.fn(),
      eq: vi.fn(),
    })),
  },
}));

const mockCustomization = {
  logoUrl: '/test-logo.png',
  primaryColor: '#FF0000',
  secondaryColor: '#00FF00',
  loginText: 'Welcome to our community',
};

describe('useCommunityCustomization Hook', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  describe('Fetching Customization', () => {
    it('successfully fetches community customization', async () => {
      supabase.from().select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { login_customization: mockCustomization },
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useCommunityCustomization('test-community'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.customization).toEqual(mockCustomization);
      expect(result.current.error).toBeNull();
    });

    it('handles 404 error when community not found', async () => {
      supabase.from().select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116', message: 'Not found' },
          }),
        }),
      });

      const { result } = renderHook(() => useCommunityCustomization('non-existent'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        message: 'Not found',
        status: 404,
      });
    });

    it('handles server errors', async () => {
      supabase.from().select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'INTERNAL_ERROR', message: 'Server error' },
          }),
        }),
      });

      const { result } = renderHook(() => useCommunityCustomization('test-community'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        message: 'Server error',
        status: 500,
      });
    });
  });

  describe('Updating Customization', () => {
    it('successfully updates customization', async () => {
      supabase.from().update.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useCommunityCustomization('test-community'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await result.current.updateCustomization(mockCustomization);

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(supabase.from().update).toHaveBeenCalledWith({
        login_customization: mockCustomization,
      });
      expect(result.current.updateError).toBeNull();
    });

    it('handles update errors', async () => {
      supabase.from().update.mockResolvedValue({
        error: { message: 'Update failed' },
      });

      const { result } = renderHook(() => useCommunityCustomization('test-community'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await result.current.updateCustomization(mockCustomization);

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(result.current.updateError).toEqual({
        message: 'Update failed',
        status: 500,
      });
    });
  });
});
