import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  CommunityDataSettings,
  FieldDefinition,
  ProfileSection,
} from '@/lib/types/profile';

export function useCommunityDataSettings(communityId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['community', communityId, 'data-settings'];

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_data_settings')
        .select('*')
        .eq('community_id', communityId);

      if (error) {
        throw error;
      }

      return data as CommunityDataSettings[];
    },
  });

  const { mutateAsync: updateSettings } = useMutation({
    mutationFn: async ({
      section,
      fieldDefinitions,
    }: {
      section: ProfileSection;
      fieldDefinitions: FieldDefinition[];
    }) => {
      console.log('Updating settings in database:', {
        section,
        fieldDefinitions,
      });
      const { data, error } = await supabase
        .from('community_profile_settings')
        .upsert(
          {
            community_id: communityId,
            section,
            field_definitions: fieldDefinitions,
          },
          { onConflict: 'community_id,section' }
        );

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      console.log('Database update successful:', data);
      return data;
    },
    onMutate: async ({ section, fieldDefinitions }) => {
      console.log('Starting optimistic update:', { section, fieldDefinitions });
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousSettings =
        queryClient.getQueryData<CommunityDataSettings[]>(queryKey);
      console.log('Previous settings:', previousSettings);

      // Optimistically update to the new value
      if (previousSettings) {
        queryClient.setQueryData<CommunityDataSettings[]>(queryKey, (old) => {
          if (!old) return previousSettings;
          const updated = old.map((setting) => {
            if (setting.section === section) {
              return {
                ...setting,
                field_definitions: fieldDefinitions,
              };
            }
            return setting;
          });
          console.log('Updated settings:', updated);
          return updated;
        });
      }

      // Return a context object with the snapshotted value
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      console.error('Mutation error:', err);
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSettings) {
        console.log(
          'Rolling back to previous settings:',
          context.previousSettings
        );
        queryClient.setQueryData(queryKey, context.previousSettings);
      }
    },
    onSettled: () => {
      // Invalidate and refetch after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey });
      }, 1000);
    },
  });

  const addField = async (field: Omit<CommunityDataSettings, 'id'>) => {
    const { data: newField, error } = await supabase
      .from('community_data_settings')
      .insert([{ ...field, community_id: communityId }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return newField;
  };

  const updateField = async (field: CommunityDataSettings) => {
    const { error } = await supabase
      .from('community_data_settings')
      .update(field)
      .eq('id', field.id);

    if (error) {
      throw error;
    }
  };

  const deleteField = async (fieldId: string) => {
    const { error } = await supabase
      .from('community_data_settings')
      .delete()
      .eq('id', fieldId);

    if (error) {
      throw error;
    }

    // Optimistically update the cache
    const previousSettings =
      queryClient.getQueryData<CommunityDataSettings[]>(queryKey);

    if (previousSettings) {
      queryClient.setQueryData<CommunityDataSettings[]>(queryKey, (old) => {
        if (!old) return [];
        return old.filter((field) => field.id !== fieldId);
      });
    }
  };

  const getFieldDefinitions = (section: ProfileSection) => {
    return (
      settings?.find((s) => s.section === section)?.field_definitions || []
    );
  };

  return {
    settings: settings || [],
    isLoading,
    error,
    addField,
    updateField,
    deleteField,
    updateSettings,
    getFieldDefinitions,
  };
}
