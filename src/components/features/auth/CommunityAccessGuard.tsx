import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from '../../../lib/stores/auth';
import { currentCommunityAtom } from '../../../lib/stores/community';

interface CommunityAccessGuardProps {
  children: React.ReactNode;
}

export function CommunityAccessGuard({ children }: CommunityAccessGuardProps) {
  const { communitySlug } = useParams();
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [userCommunity] = useAtom(userCommunityAtom);
  const [, setCurrentCommunity] = useAtom(currentCommunityAtom);

  useEffect(() => {
    if (!communitySlug || !user) return;

    // Only allow access to user's own community
    if (userCommunity?.slug === communitySlug) {
      setCurrentCommunity(userCommunity);
    } else {
      console.error('Access denied: Not your community');
      navigate('/403');
    }
  }, [communitySlug, user, userCommunity, setCurrentCommunity, navigate]);

  // Don't render anything until we've confirmed access
  if (!userCommunity || userCommunity.slug !== communitySlug) {
    return null;
  }

  return <>{children}</>;
}
