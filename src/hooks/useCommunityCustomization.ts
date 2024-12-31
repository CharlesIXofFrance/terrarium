/**
 * AI Context:
 * This hook is part of the community login customization feature. It's located in the hooks directory
 * because it provides reusable data fetching and mutation logic for community login page customization.
 * 
 * The hook:
 * 1. Fetches community-specific login page customization (colors, logo, text)
 * 2. Provides a mutation function for community owners to update these settings
 * 3. Handles loading states and error scenarios
 * 
 * It's placed in hooks/ rather than features/ because it's a generic data hook that could be used
 * by multiple components, not just the login page (e.g., preview in settings, admin dashboard).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Community } from '../lib/utils/community';

interface CustomizationError {
  message: string;
  status: number;
}

type LoginCustomization = NonNullable<Community['settings']['login_customization']>;

const defaultCustomization: LoginCustomization = {
  logoUrl: '/default-logo.png',
  colorScheme: {
    primary: '#000000',
    secondary: '#4F46E5',
    background: '#FFFFFF',
  },
  customText: {
    headline: 'Welcome Back',
    subHeadline: 'Sign in to your account',
  },
};

/**
 * Custom hook to manage community login page customization
 * @param slug - Community slug identifier
 * @returns Object containing customization data, loading state, error state, and update function
 */
export function useCommunityCustomization(slug: string) {
  const queryClient = useQueryClient();
  const queryKey = ['communityCustomization', slug];

  const { data: customization, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!slug) {
        console.log('No slug provided to useCommunityCustomization');
        return defaultCustomization;
      }

      console.log('Fetching customization for community:', slug);
      const { data, error } = await supabase
        .from('communities')
        .select('settings')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching community settings:', error);
        if (error.code === 'PGRST116') {
          console.log('Community not found, using default customization');
          return defaultCustomization;
        }
        throw {
          message: error.message,
          status: 500,
        } as CustomizationError;
      }

      if (!data?.settings?.login_customization) {
        console.log('No login customization found, using default');
        return defaultCustomization;
      }

      return {
        ...defaultCustomization,
        ...data.settings.login_customization,
      };
    },
    enabled: true, // Always enabled, will return default if no slug
  });

  const updateMutation = useMutation({
    mutationFn: async (newCustomization: Partial<LoginCustomization>) => {
      if (!slug) throw new Error('Community slug is required for updates');

      const { error } = await supabase
        .from('communities')
        .update({
          settings: {
            login_customization: {
              ...customization,
              ...newCustomization,
            },
          },
        })
        .eq('slug', slug);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    customization: customization || defaultCustomization,
    isLoading,
    error,
    update: updateMutation.mutate,
  };
}
