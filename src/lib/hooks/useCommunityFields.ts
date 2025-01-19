import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CommunityField {
  id: string;
  name: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
}

export function useCommunityFields(communityId: string) {
  return useQuery({
    queryKey: ['community-fields', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_fields')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as CommunityField[];
    },
  });
}
