import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from './lib/stores/auth';
import { currentCommunityAtom } from './lib/stores/community';
import { supabase } from './lib/supabase';
import { ErrorBoundary } from '@/components/layout/molecules/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { PlatformLogin } from './pages/auth/PlatformLogin';
import { PlatformRegister } from './pages/auth/PlatformRegister';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { ResetPasswordCallback } from './pages/auth/ResetPasswordCallback';
import { Logout } from './pages/auth/Logout';
import { AuthCallback } from './pages/auth/AuthCallback';
import { ProtectedRoute } from './components/features/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/features/auth/PublicOnlyRoute';
import { CommunityLayout } from './components/layout/CommunityLayout';
import { MemberLayout } from './components/features/members/MemberLayout';
import { Dashboard } from './pages/community/Dashboard';
import { Members } from './pages/community/Members';
import { Jobs } from './pages/community/Jobs';
import { Employers } from './pages/community/Employers';
import { JobBoardSettings } from './pages/community/JobBoardSettings';
import { BrandingSettings } from './pages/community/BrandingSettings';
import { CustomizationPortal } from './pages/community/CustomizationPortal';
import { OwnerOnboarding } from './components/features/onboarding/OwnerOnboarding';
import { MemberHub } from './pages/member/MemberHub';
import { JobBoard } from './pages/member/JobBoard';
import { JobDetails } from './pages/member/JobDetails';
import { Events } from './pages/member/Events';
import { Feed } from './pages/member/Feed';
import { MemberProfile } from './pages/member/MemberProfile';
import { RBACTest } from './pages/RBACTest';
import { CommunityAccessGuard } from './components/features/auth/CommunityAccessGuard';
import { SubdomainRouter } from './components/routing/SubdomainRouter';
import { Toaster } from '@/components/ui/atoms/Toaster';

function App() {
  const [user, setUser] = useAtom(userAtom);
  const [userCommunity, setUserCommunity] = useAtom(userCommunityAtom);
  const [, setCurrentCommunity] = useAtom(currentCommunityAtom);
  const [isLoading, setIsLoading] = useState(true);

  // Initial session check
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log('Debug - Starting session check');
        const {
          data: { user: sessionUser },
        } = await supabase.auth.getUser();
        console.log('Initial user:', { sessionUser });

        if (!mounted) return;

        if (sessionUser) {
          // Fetch user profile and community in parallel
          const [profileResult, communityResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('*')
              .eq('id', sessionUser.id)
              .single(),
            supabase
              .from('communities')
              .select('id, name, slug, description, logo_url')
              .eq('owner_id', sessionUser.id)
              .maybeSingle(),
          ]);

          if (!mounted) return;

          if (profileResult.error) {
            console.error('Profile fetch error:', profileResult.error);
            throw profileResult.error;
          }

          setUser({
            ...sessionUser,
            ...profileResult.data,
            avatar:
              profileResult.data.avatar_url ||
              sessionUser.user_metadata?.avatar_url,
          });

          // If not an owner, check if member of any community
          if (!communityResult.data) {
            console.log('Not a community owner, checking membership...');
            const { data: memberCommunity, error: memberError } = await supabase
              .from('community_members')
              .select(
                `
                *,
                community:communities!inner (
                  id,
                  name,
                  slug,
                  description,
                  logo_url
                )
              `
              )
              .eq('profile_id', sessionUser.id)
              .maybeSingle();

            if (!mounted) return;

            if (memberError) {
              console.error('Member community fetch error:', memberError);
              throw memberError;
            }

            if (memberCommunity?.community) {
              console.log('Found member community:', memberCommunity.community);
              setUserCommunity(memberCommunity.community);
              setCurrentCommunity(memberCommunity.community);
            } else {
              console.log('No community found for user');
            }
          } else {
            console.log('Found owned community:', communityResult.data);
            setUserCommunity(communityResult.data);
            setCurrentCommunity(communityResult.data);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();
    return () => {
      mounted = false;
    };
  }, [setUser, setUserCommunity, setCurrentCommunity, setIsLoading]);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', { event, session });

      if (session?.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // Wait for the trigger to create the profile
              let retryCount = 0;
              const maxRetries = 3;
              let retryProfile = null;
              let retryError = null;

              while (retryCount < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const result = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                if (!result.error) {
                  retryProfile = result.data;
                  break;
                }

                retryError = result.error;
                retryCount++;
              }

              if (retryProfile) {
                setUser({
                  ...session.user,
                  ...retryProfile,
                  avatar:
                    retryProfile.avatar_url ||
                    session.user.user_metadata?.avatar_url,
                });
              } else {
                // If profile still doesn't exist after retries, create it manually
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .upsert({
                    id: session.user.id,
                    email: session.user.email,
                    full_name:
                      session.user.user_metadata?.full_name ||
                      session.user.email?.split('@')[0] ||
                      'New User',
                    role: 'community_admin',
                    profile_complete: false,
                  })
                  .select()
                  .single();

                if (createError) {
                  console.error('Error creating profile:', createError);
                  throw createError;
                }

                setUser({
                  ...session.user,
                  ...newProfile,
                  avatar:
                    newProfile.avatar_url ||
                    session.user.user_metadata?.avatar_url,
                });
              }
            } else {
              console.error('Error fetching profile:', profileError);
              throw profileError;
            }
          } else {
            setUser({
              ...session.user,
              ...profile,
              avatar:
                profile.avatar_url || session.user.user_metadata?.avatar_url,
            });
          }

          // Fetch user's community (either owned or member of)
          const { data: ownedCommunity, error: ownedError } = await supabase
            .from('communities')
            .select('id, name, slug, description, logo_url')
            .eq('owner_id', session.user.id)
            .maybeSingle();

          if (ownedError && ownedError.code === 'PGRST116') {
            const { data: memberCommunity, error: memberError } = await supabase
              .from('community_members')
              .select(
                'community:communities!inner(id, name, slug, description, logo_url)'
              )
              .eq('profile_id', session.user.id)
              .maybeSingle()
              .throwOnError();

            if (memberError) {
              console.error('Member community fetch error:', memberError);
              throw memberError;
            }

            if (memberCommunity?.community) {
              console.log('Found member community:', memberCommunity.community);
              setUserCommunity(memberCommunity.community);
              setCurrentCommunity(memberCommunity.community);
            } else {
              console.log('No community found for user');
            }
          } else if (ownedError) {
            console.error('Owner community fetch error:', ownedError);
            throw ownedError;
          } else if (ownedCommunity) {
            console.log('Found owned community:', ownedCommunity);
            setUserCommunity(ownedCommunity);
            setCurrentCommunity(ownedCommunity);
          }
        } catch (error) {
          console.error('Error in auth change:', error);
        }
      } else {
        setUser(null);
        setUserCommunity(null);
        setCurrentCommunity(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setUserCommunity, setCurrentCommunity]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <PlatformLogin />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <PlatformRegister />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicOnlyRoute>
                <ResetPassword />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/auth/reset-password"
            element={<ResetPasswordCallback />}
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/v1/verify" element={<ResetPasswordCallback />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/rbac-test" element={<RBACTest />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OwnerOnboarding />
              </ProtectedRoute>
            }
          />

          {/* Legacy community admin routes */}
          <Route
            path="/c/:slug/*"
            element={
              <ProtectedRoute>
                <CommunityLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="employers" element={<Employers />} />
            <Route path="settings/job-board" element={<JobBoardSettings />} />
            <Route path="settings/branding" element={<BrandingSettings />} />
            <Route path="customize" element={<CustomizationPortal />} />
          </Route>

          {/* Legacy member routes */}
          <Route
            path="/m/:communitySlug"
            element={
              <ProtectedRoute>
                <CommunityAccessGuard>
                  <MemberLayout />
                </CommunityAccessGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<MemberHub />} />
            <Route path="jobs" element={<JobBoard />} />
            <Route path="jobs/:jobId" element={<JobDetails />} />
            <Route path="events" element={<Events />} />
            <Route path="feed" element={<Feed />} />
            <Route path="profile" element={<MemberProfile />} />
          </Route>

          {/* Subdomain routes - must be last */}
          <Route path="*" element={<SubdomainRouter />} />
        </Routes>
      </Router>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
