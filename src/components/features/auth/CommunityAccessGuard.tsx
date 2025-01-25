import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from '../../../lib/stores/auth';
import { currentCommunityAtom } from '../../../lib/stores/community';
import { parseDomain } from '../../../lib/utils/subdomain';
import { supabase } from '@/lib/supabase';

interface CommunityAccessGuardProps {
  children: React.ReactNode;
}

export function CommunityAccessGuard({ children }: CommunityAccessGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAtom(userAtom);
  const [userCommunity] = useAtom(userCommunityAtom);
  const [, setCurrentCommunity] = useAtom(currentCommunityAtom);
  const { subdomain } = parseDomain();

  useEffect(() => {
    const checkAccess = async () => {
      // Debug logging
      console.log('CommunityAccessGuard - Debug:', {
        user: user
          ? {
              id: user?.id,
              role: user?.role,
            }
          : null,
        userCommunity: userCommunity
          ? {
              id: userCommunity.id,
              slug: userCommunity.slug,
              ownerId: userCommunity.owner_id,
            }
          : null,
        subdomain,
        pathname: location.pathname,
      });

      // If we're on a login page, check if the user should be here
      if (location.pathname.includes('/login')) {
        // Check if this community exists
        const { data: community, error } = await supabase
          .from('communities')
          .select('id, owner_id, slug')
          .eq('slug', subdomain)
          .single();

        if (error || !community) {
          console.error('Community not found:', error);
          navigate('/404');
          return;
        }

        if (user) {
          // If user is logged in, check their access
          const { data: memberAccess } = await supabase
            .from('community_members')
            .select('id')
            .eq('profile_id', user.id)
            .eq('community_id', community.id)
            .maybeSingle();

          const isOwner = community.owner_id === user.id;
          const isMember = Boolean(memberAccess);

          if (!isOwner && !isMember) {
            // User is logged in but doesn't have access to this community
            console.log('User does not have access to this community');
            return;
          }

          // User has access, redirect to dashboard
          navigate(`/?subdomain=${subdomain}/dashboard`, { replace: true });
          return;
        }

        // Not logged in, let them proceed to login page
        return;
      }

      // For non-login pages, handle community access
      if (!user) return;

      if (userCommunity && userCommunity.slug === subdomain) {
        setCurrentCommunity(userCommunity);
      } else {
        // Check if user has access to this community
        const { data: community } = await supabase
          .from('communities')
          .select('id, owner_id')
          .eq('slug', subdomain)
          .single();

        if (community) {
          const { data: memberAccess } = await supabase
            .from('community_members')
            .select('id')
            .eq('profile_id', user.id)
            .eq('community_id', community.id)
            .maybeSingle();

          const isOwner = community.owner_id === user.id;
          const isMember = Boolean(memberAccess);

          if (!isOwner && !isMember) {
            // User doesn't have access to this community
            navigate(`/?subdomain=${userCommunity?.slug || ''}`);
          }
        } else {
          // Community doesn't exist
          navigate('/404');
        }
      }
    };

    checkAccess();
  }, [
    user,
    userCommunity,
    subdomain,
    setCurrentCommunity,
    navigate,
    location.pathname,
  ]);

  return <>{children}</>;
}
