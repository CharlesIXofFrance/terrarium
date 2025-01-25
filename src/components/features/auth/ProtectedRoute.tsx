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
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [requireOnboarding, setRequireOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Effect to check and refresh session if needed
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session && user) {
          // Session is invalid but we have a user, try to refresh
          const {
            data: { session: newSession },
          } = await supabase.auth.refreshSession();

          if (!newSession) {
            // If refresh failed, clear user state
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
      }
    };

    checkSession();
  }, [user, setUser]);

  // Check if user is owner and handle onboarding
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is a community owner
        const { data: ownedCommunity, error: ownerError } = await supabase
          .from('communities')
          .select('onboarding_completed')
          .eq('owner_id', user.id)
          .single();

        if (ownerError && ownerError.code !== 'PGRST116') {
          console.error('Error checking owned community:', ownerError);
          throw ownerError;
        }

        const userIsOwner = Boolean(ownedCommunity);
        setIsOwner(userIsOwner);

        // If not an owner, check if they're a member
        if (!userIsOwner) {
          const { data: memberData, error: memberError } = await supabase
            .from('community_members')
            .select('community_id')
            .eq('profile_id', user.id)
            .maybeSingle();

          if (memberError && memberError.code !== 'PGRST116') {
            console.error('Error checking community membership:', memberError);
            throw memberError;
          }

          // If they're a member, check profile onboarding
          if (memberData) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', user.id)
              .single();

            if (profileError) {
              console.error('Error checking profile:', profileError);
              throw profileError;
            }

            setRequireOnboarding(true);
            setOnboardingCompleted(profile?.onboarding_completed);
          }
        } else {
          setRequireOnboarding(true);
          setOnboardingCompleted(ownedCommunity.onboarding_completed);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [user?.id, location.pathname]);

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
    console.log('No user found, redirecting to login with search:', search);
    return <Navigate to={`/login${search}`} replace />;
  }

  // If onboarding required and not completed, redirect to onboarding
  if (requireOnboarding && !onboardingCompleted) {
    console.log(
      'Onboarding required but not completed, redirecting to onboarding'
    );
    return <Navigate to="/onboarding" replace />;
  }

  // Allow access to login page if already logged in
  if (location.pathname === '/login' && user) {
    return <>{children}</>;
  }

  // Check owner-only access
  if (ownerOnly && !isOwner) {
    console.log('Non-owner attempting to access owner-only route');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
