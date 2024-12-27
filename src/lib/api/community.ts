import { supabase } from '../supabase';
import type { Community } from '../../backend/types/auth.types';
import { slugify } from 'slugify';

interface CreateCommunityInput {
  name: string;
  description: string;
}

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

export async function createCommunity(input: CreateCommunityInput) {
  // Create slug from name
  const slug = slugify(input.name.toLowerCase());

  // Create community with basic info
  const { data: community, error } = await supabase
    .from('communities')
    .insert({
      name: input.name,
      description: input.description,
      slug,
      owner_id: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return community;
}

export async function updateCommunityLogo(slug: string, logo: File) {
  // Upload logo directly to community directory
  const extension = logo.name.split('.').pop();
  const logoPath = `${slug}/logo.${extension}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('community-assets')
    .upload(logoPath, logo);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('community-assets')
    .getPublicUrl(logoPath);

  // Update community with logo URL
  const { data: community, error: updateError } = await supabase
    .from('communities')
    .update({ logo_url: urlData.publicUrl })
    .eq('slug', slug)
    .select()
    .single();

  if (updateError) throw updateError;
  return community;
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
