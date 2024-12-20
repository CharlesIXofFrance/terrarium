import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from '../stores/auth';
import { currentCommunityAtom } from '../stores/community';
import { supabase } from '../supabase';

export function useCommunityAccess() {
  const { communitySlug } = useParams();
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [userCommunity] = useAtom(userCommunityAtom);
  const [, setCurrentCommunity] = useAtom(currentCommunityAtom);

  useEffect(() => {
    const checkAccess = async () => {
      if (!communitySlug || !user) return;

      // If this is the user's own community, allow access
      if (userCommunity?.slug === communitySlug) {
        setCurrentCommunity(userCommunity);
        return;
      }

      // Check if the community exists
      const { data: community, error } = await supabase
        .from('communities')
        .select('*')
        .eq('slug', communitySlug)
        .single();

      if (error || !community) {
        console.error('Community not found:', error);
        navigate('/404');
        return;
      }

      // Check if user is a member of this community
      const { data: membership, error: membershipError } = await supabase
        .from('community_members')
        .select('*')
        .eq('community_id', community.id)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        console.error('Access denied: Not a member of this community');
        navigate('/403');
        return;
      }

      // User has access, update current community
      setCurrentCommunity(community);
    };

    checkAccess();
  }, [communitySlug, user, userCommunity, setCurrentCommunity, navigate]);
}
