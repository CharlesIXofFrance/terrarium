import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { userAtom } from '../lib/stores/auth';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Benefits } from '../components/Benefits';
import { CTA } from '../components/CTA';
import { Footer } from '../components/Footer';

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
  admin: {
    id: 'test-admin',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'admin',
    communities: ['women-in-fintech'],
    createdAt: new Date().toISOString(),
  },
};

export function LandingPage() {
  const navigate = useNavigate();
  const setUser = useSetAtom(userAtom);

  const loginAs = (role: 'member' | 'admin') => {
    const user = mockUsers[role];
    setUser(user);
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
      <Navbar />
      <Hero />
      <Features />
      <Benefits />
      <CTA />
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
          onClick={() => loginAs('admin')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
        >
          Test as Admin
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
