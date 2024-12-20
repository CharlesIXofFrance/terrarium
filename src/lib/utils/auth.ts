import { atom } from 'jotai';
import { supabase } from '../supabase';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'community_admin' | 'member';
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type Community = {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

// Initialize atoms with null
export const userAtom = atom<UserProfile | null>(null);
export const userCommunityAtom = atom<Community | null>(null);

// Helper function to normalize profile data
export function normalizeProfile(profile: any): UserProfile {
  return {
    ...profile,
    profile_complete: profile.profile_complete === 1,
    role: profile.role || 'community_admin',
  };
}

// Initialize the auth state
export const initAuth = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        let community = null;
        if (profile.role === 'community_admin') {
          const { data: communityData } = await supabase
            .from('communities')
            .select(
              'id, name, description, owner_id, slug, created_at, updated_at'
            )
            .eq('owner_id', profile.id)
            .single();

          if (communityData) {
            community = {
              ...communityData,
              slug: communityData.slug || communityData.id, // Fallback to ID if slug is not set
            };
          }
        }

        return {
          user: normalizeProfile(profile),
          community,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error initializing auth:', error);
    return null;
  }
};

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
