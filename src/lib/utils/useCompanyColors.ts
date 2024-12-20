import { useQuery } from '@tanstack/react-query';
import type { ColorAnalysis } from '../types/colors';
import { logoColors } from '../data/logoColors';

export function useCompanyColors(logoUrl?: string) {
  return useQuery({
    queryKey: ['companyColors', logoUrl],
    queryFn: async (): Promise<ColorAnalysis | null> => {
      if (!logoUrl) return null;

      try {
        // Access the colors directly from the imported JSON
        const colorData = logoColors[logoUrl as keyof typeof logoColors];

        if (!colorData) {
          console.warn(`No color data found for logo URL: ${logoUrl}`);
          return null;
        }

        return colorData;
      } catch (error) {
        console.error('Error loading company colors:', error);
        return null;
      }
    },
    enabled: !!logoUrl,
    staleTime: Infinity, // Colors won't change often
    cacheTime: Infinity,
    retry: false, // Don't retry on failure
  });
}
