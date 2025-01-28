import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../../lib/stores/auth';
import { supabase } from '../../../lib/supabase';
import { parseDomain } from '../../../lib/utils/subdomain';
import { Spinner } from '../../../components/ui/atoms/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  ownerOnly?: boolean;
}

export function ProtectedRoute({
  children,
  ownerOnly = false,
}: ProtectedRouteProps) {
  const [user, setUser] = useAtom(userAtom);
  const location = useLocation();
  const { subdomain } = parseDomain();
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [requireOnboarding, setRequireOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Effect to handle auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  // Check if user is owner and handle onboarding
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is a community owner
        const { data: communities, error: ownerError } = await supabase
          .from('communities')
          .select()
          .eq('owner_id', user.id);

        if (ownerError) throw ownerError;

        const userIsOwner = communities && communities.length > 0;
        setIsOwner(userIsOwner);

        // If not an owner, check if they're a member
        if (!userIsOwner) {
          const { data: memberData, error: memberError } = await supabase
            .from('community_members')
            .select('*, profile:profiles(*)')
            .eq('profile_id', user.id)
            .single();

          if (memberError && memberError.code !== 'PGRST116') {
            throw memberError;
          }

          if (memberData) {
            setRequireOnboarding(true);
            setOnboardingCompleted(memberData.onboarding_completed ?? false);
          }
        } else if (communities?.[0]) {
          setRequireOnboarding(true);
          setOnboardingCompleted(communities[0].onboarding_completed ?? false);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      checkUserStatus();
    }
  }, [user?.id]);

  // Wait for initial session check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    const search = location.search ? location.search : '';
    return <Navigate to={`/login${search}`} replace />;
  }

  // If onboarding required and not completed, redirect to onboarding
  if (requireOnboarding && !onboardingCompleted) {
    // If we have a subdomain, redirect to community onboarding
    if (subdomain) {
      return (
        <Navigate to={`/?subdomain=${subdomain}&path=/onboarding`} replace />
      );
    }
    // Otherwise redirect to platform onboarding
    return <Navigate to="/onboarding" replace />;
  }

  // Allow access to login page if already logged in
  if (location.pathname === '/login' && user) {
    return <>{children}</>;
  }

  // Check owner-only access
  if (ownerOnly && !isOwner) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
