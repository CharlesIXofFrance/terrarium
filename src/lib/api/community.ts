import { supabase } from '../supabase';
import type { Community } from '../../types/domain/auth';

export async function getCommunity(slug: string): Promise<Community | null> {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function updateCommunity(id: string, updates: Partial<Community>) {
  const { data, error } = await supabase
    .from('communities')
    .update(updates)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCommunity(
  community: Omit<Community, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('communities')
    .insert(community)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCommunity(id: string) {
  const { error } = await supabase.from('communities').delete().eq('id', id);

  if (error) throw error;
}

export async function getCommunityMembers(communityId: string) {
  const { data, error } = await supabase
    .from('community_members')
    .select('*, users(*)')
    .eq('community_id', communityId);

  if (error) throw error;
  return data;
}

export async function addCommunityMember(
  communityId: string,
  userId: string,
  role: string
) {
  const { data, error } = await supabase
    .from('community_members')
    .insert({
      community_id: communityId,
      user_id: userId,
      role,
    })
    .single();

  if (error) throw error;
  return data;
}

export async function removeCommunityMember(
  communityId: string,
  userId: string
) {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', userId);

  if (error) throw error;
}
