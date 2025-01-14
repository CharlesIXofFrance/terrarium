import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/stores/auth';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/layout/molecules/Hero';
import { Features } from '@/components/layout/molecules/Features';
import { Benefits } from '@/components/features/jobs/Benefits';
import { CTA } from '@/components/layout/molecules/CTA';
import { Footer } from '@/components/layout/Footer';

// Mock users for testing
const mockUsers = {
  member: {
    id: 'test-member',
    email: 'member@test.com',
    name: 'Test Member',
    role: 'member',
    communities: ['women-in-fintech'],
    createdAt: new Date().toISOString(),
    profileComplete: 70,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
  },
  platformOwner: {
    id: 'test-platform-owner',
    email: 'platform-owner@test.com',
    name: 'Test Platform Owner',
    role: 'platform_owner',
    communities: ['women-in-fintech'],
    createdAt: new Date().toISOString(),
  },
};

export function LandingPage() {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);

  const handleDashboardClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // First check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    const userMetadata = user.user_metadata || {};
    const onboardingCompleted =
      profile?.onboarding_completed && userMetadata.onboarding_completed;

    if (!onboardingCompleted) {
      navigate('/onboarding');
      return;
    }

    // Check if user is a community owner
    const { data: ownedCommunity, error } = await supabase
      .from('communities')
      .select('slug')
      .eq('owner_id', user.id)
      .single();

    if (error) {
      console.error('Error checking community ownership:', error);
      // If not a community owner, redirect to member hub
      const { data: memberCommunity } = await supabase
        .from('community_members')
        .select('communities:communities(slug)')
        .eq('profile_id', user.id)
        .single();

      if (memberCommunity?.communities?.slug) {
        navigate(`/?subdomain=${memberCommunity.communities.slug}`);
      } else {
        navigate('/login');
      }
      return;
    }

    // User is a community owner and has completed onboarding
    navigate(`/?subdomain=${ownedCommunity.slug}/settings/dashboard`);
  };

  const loginAs = (role: 'member' | 'platform_owner') => {
    const user = mockUsers[role];
    localStorage.setItem('user', JSON.stringify(user));

    if (role === 'member') {
      // Get user's community
      const community = user.communities[0];
      navigate(`/m/${community}`);
    } else {
      navigate('/c/default');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar onDashboardClick={handleDashboardClick} />
      <Hero onGetStarted={handleDashboardClick} />
      <Features />
      <Benefits />
      <CTA onGetStarted={handleDashboardClick} />
      <Footer />

      {/* Quick Access Panel */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => loginAs('member')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
        >
          Test as Member
        </button>
        <button
          onClick={() => loginAs('platform_owner')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
        >
          Test as Platform Owner
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
