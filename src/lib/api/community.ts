import { supabase } from '../supabase';
import type { Community } from '../../backend/types/auth.types';
import { slugify } from 'slugify';

interface CreateCommunityInput {
  name: string;
  description: string;
}

export const communityApi = {
  async getCommunity(slug: string): Promise<Community | null> {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async updateCommunity(id: string, updates: Partial<Community>) {
    const { data, error } = await supabase
      .from('communities')
      .update(updates)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createCommunity(input: CreateCommunityInput) {
    const slug = slugify(input.name, { lower: true });
    const { data, error } = await supabase
      .from('communities')
      .insert([{ ...input, slug }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCommunityLogo(slug: string, logo: File) {
    const { data: community } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!community) throw new Error('Community not found');

    const filename = `${community.id}/logo/${logo.name}`;
    const { error: uploadError } = await supabase.storage
      .from('community-assets')
      .upload(filename, logo);

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from('community-assets')
      .getPublicUrl(filename);

    const { error: updateError } = await supabase
      .from('communities')
      .update({ logo: publicUrl.publicUrl })
      .eq('id', community.id);

    if (updateError) throw updateError;

    return publicUrl.publicUrl;
  },

  async deleteCommunity(id: string) {
    const { error } = await supabase.from('communities').delete().eq('id', id);
    if (error) throw error;
  },

  async getMembers(communityId: string) {
    const { data, error } = await supabase
      .from('community_members')
      .select('*, user:users(*)')
      .eq('community_id', communityId);

    if (error) throw error;
    return data;
  },

  async addMember(communityId: string, userId: string, role: string) {
    const { data, error } = await supabase
      .from('community_members')
      .insert([
        {
          community_id: communityId,
          user_id: userId,
          role,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeMember(communityId: string, userId: string) {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
