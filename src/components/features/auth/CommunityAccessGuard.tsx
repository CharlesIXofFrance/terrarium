import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from '../../../lib/stores/auth';
import { currentCommunityAtom } from '../../../lib/stores/community';
import { parseDomain } from '../../../lib/utils/subdomain';

interface CommunityAccessGuardProps {
  children: React.ReactNode;
}

export function CommunityAccessGuard({ children }: CommunityAccessGuardProps) {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [userCommunity] = useAtom(userCommunityAtom);
  const [, setCurrentCommunity] = useAtom(currentCommunityAtom);
  const { subdomain } = parseDomain();

  useEffect(() => {
    if (!user) return;

    // Debug logging
    console.log('CommunityAccessGuard - Debug:', {
      user: {
        id: user.id,
        role: user.role,
      },
      userCommunity: userCommunity ? {
        id: userCommunity.id,
        slug: userCommunity.slug,
        ownerId: userCommunity.owner_id,
      } : null,
      subdomain,
      pathname: window.location.pathname,
    });

    // Set current community if it matches the user's community
    if (userCommunity && userCommunity.slug === subdomain) {
      setCurrentCommunity(userCommunity);
    } else if (user.role === 'community_owner' || user.role === 'community_admin') {
      // Redirect admin/owner to their community if trying to access a different one
      navigate(`/?subdomain=${userCommunity?.slug || ''}`);
    }
  }, [user, userCommunity, subdomain, setCurrentCommunity, navigate]);

  return <>{children}</>;
}
