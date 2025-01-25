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
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';

interface CustomizationError {
  message: string;
  status: number;
}

interface LoginSettings {
  title: string;
  subtitle: string;
  welcome_message?: string;
  button_text: string;
  background_color: string;
  text_color: string;
  side_image_url?: string;
  logo_url?: string;
}

const defaultCustomization: LoginSettings = {
  title: 'Welcome Back',
  subtitle: 'Sign in to your account',
  button_text: 'Sign In',
  background_color: '#FFFFFF',
  text_color: '#000000',
};

/**
 * Custom hook to manage community login page customization
 * @param slug - Community slug identifier
 * @returns Object containing customization data, loading state, error state, and update function
 */
export function useCommunityCustomization(slug: string) {
  const queryClient = useQueryClient();
  const queryKey = ['communityCustomization', slug];

  const {
    data: customization,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!slug) {
        console.log('No slug provided to useCommunityCustomization');
        return defaultCustomization;
      }

      console.log('Fetching customization for community:', slug);

      // First get the community and its logo
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('id, logo_url')
        .eq('slug', slug)
        .single();

      if (communityError) {
        console.error('Error fetching community:', communityError);
        return defaultCustomization;
      }

      // Then get the login settings
      const { data: settings, error: settingsError } = await supabase
        .from('community_login_settings')
        .select('*')
        .eq('community_id', community.id)
        .single();

      if (settingsError) {
        console.error('Error fetching login settings:', settingsError);
        return defaultCustomization;
      }

      // Return paths for images, they will be converted to signed URLs by useSignedUrl hook
      return {
        communityId: community.id,
        title: settings.title || defaultCustomization.title,
        subtitle: settings.subtitle || defaultCustomization.subtitle,
        welcomeMessage: settings.welcome_message,
        buttonText: settings.button_text || defaultCustomization.button_text,
        backgroundColor:
          settings.background_color || defaultCustomization.background_color,
        textColor: settings.text_color || defaultCustomization.text_color,
        sideImageUrl: settings.side_image_url,
        logoUrl: community.logo_url,
      };
    },
  });

  // Use the useSignedUrl hook for both logo and side image
  const { signedUrl: logoSignedUrl } = useSignedUrl(customization?.logoUrl);
  const { signedUrl: sideImageSignedUrl } = useSignedUrl(
    customization?.sideImageUrl
  );

  // Return the customization with signed URLs
  return {
    customization: customization
      ? {
          ...customization,
          logoUrl: logoSignedUrl,
          sideImageUrl: sideImageSignedUrl,
        }
      : defaultCustomization,
    isLoading,
    error,
  };
}
