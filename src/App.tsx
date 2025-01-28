import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from '@/lib/stores/auth';
import { currentCommunityAtom } from '@/lib/stores/community';
import { supabase } from '@/lib/supabase';
import { SubdomainRouter } from '@/components/routing/SubdomainRouter';
import { Toaster } from '@/components/ui/atoms/Toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from '@/components/layout/molecules/ErrorBoundary';
import { VerifyCallback } from '@/pages/auth/VerifyCallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [, setUser] = useAtom(userAtom);
  const [, setUserCommunity] = useAtom(userCommunityAtom);
  const [, setCurrentCommunity] = useAtom(currentCommunityAtom);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Failed to get session:', sessionError);
          return;
        }

        if (session?.user && mounted) {
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            if (profileError.message.includes('Results contain 0 rows')) {
              // Profile doesn't exist, create it
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: session.user.id,
                    email: session.user.email,
                    role: 'member',
                    profile_complete: false,
                    onboarding_step: 0,
                  },
                ])
                .select()
                .single();

              if (createError) {
                console.error('Failed to create profile:', createError);
                return;
              }

              setUser({ ...session.user, ...newProfile });
            } else {
              console.error('Failed to fetch profile:', profileError);
              return;
            }
          } else {
            setUser({ ...session.user, ...profile });
          }

          // If user has a community, fetch it
          if (profile?.community_id) {
            const { data: community, error: communityError } = await supabase
              .from('communities')
              .select('*')
              .eq('id', profile.community_id)
              .single();

            if (communityError) {
              console.error('Failed to fetch community:', communityError);
              return;
            }

            setUserCommunity(community);
            setCurrentCommunity(community);
          }
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', { event, hasSession: !!session });

      if (session?.user && mounted) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser({ ...session.user, ...profile });

        // If user has a community, fetch it
        if (profile?.community_id) {
          const { data: community } = await supabase
            .from('communities')
            .select('*')
            .eq('id', profile.community_id)
            .single();

          setUserCommunity(community);
          setCurrentCommunity(community);
        }
      } else if (mounted) {
        setUser(null);
        setUserCommunity(null);
        setCurrentCommunity(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setUserCommunity, setCurrentCommunity]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Routes>
              <Route path="/auth/confirm" element={<VerifyCallback />} />
              <Route path="/*" element={<SubdomainRouter />} />
            </Routes>
          )}
          <Toaster />
        </ErrorBoundary>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
