import React, { useState, useEffect } from 'react';
import {
  Outlet,
  Link,
  useParams,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from '../../lib/stores/auth';
import {
  currentCommunityAtom,
  communityLoadingAtom,
  communityErrorAtom,
} from '../../lib/stores/community';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Settings,
  Palette,
  Menu,
  X,
  Globe2,
  Loader2,
} from 'lucide-react';

export function CommunityLayout() {
  const { slug } = useParams();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user] = useAtom(userAtom);
  const [userCommunity] = useAtom(userCommunityAtom);
  const [currentCommunity, setCurrentCommunity] = useAtom(currentCommunityAtom);
  const [isLoading, setIsLoading] = useAtom(communityLoadingAtom);
  const [, setError] = useAtom(communityErrorAtom);

  useEffect(() => {
    let mounted = true;

    const loadCommunity = async () => {
      // Skip if we already have the community loaded
      if (currentCommunity?.slug === slug) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        if (userCommunity?.slug === slug) {
          console.log(
            'Setting current community from user context:',
            userCommunity
          );
          setCurrentCommunity(userCommunity);
        } else if (slug) {
          // Try to fetch community by slug if not in user context
          const { data: community, error } = await supabase
            .from('communities')
            .select('*')
            .eq('slug', slug)
            .single();

          if (error) {
            console.error('Error fetching community by slug:', error);
            setError(error.message);
            throw error;
          }

          if (community) {
            console.log('Setting community from slug:', community);
            setCurrentCommunity(community);
          }
        }
      } catch (error) {
        console.error('Error loading community:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to load community'
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadCommunity();

    return () => {
      mounted = false;
    };
  }, [slug, userCommunity, setCurrentCommunity, setIsLoading, setError]);

  // Show loading spinner only on initial load
  if (isLoading && !currentCommunity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentCommunity) {
    return <Navigate to="/" replace />;
  }

  // Verify user is owner and has access to this community
  if (
    !user ||
    !userCommunity ||
    (user.role !== 'platform_owner' &&
      user.role !== 'community_owner' &&
      userCommunity.community_id !== currentCommunity?.id)
  ) {
    return <Navigate to="/unauthorized" />;
  }

  const isOwner =
    user.role === 'platform_owner' || user.role === 'community_owner';

  // Navigation items for the sidebar
  const navigationItems = [
    {
      name: 'Dashboard',
      href: `/?subdomain=${currentCommunity?.slug}/settings/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: 'Members',
      href: `/?subdomain=${currentCommunity?.slug}/settings/members`,
      icon: Users,
    },
    {
      name: 'Jobs',
      href: `/?subdomain=${currentCommunity?.slug}/settings/jobs`,
      icon: Briefcase,
    },
    {
      name: 'Employers',
      href: `/?subdomain=${currentCommunity?.slug}/settings/employers`,
      icon: Building2,
    },
    {
      name: 'Job Board',
      href: `/?subdomain=${currentCommunity?.slug}/settings/job-board`,
      icon: Globe2,
    },
    {
      name: 'Branding',
      href: `/?subdomain=${currentCommunity?.slug}/settings/branding`,
      icon: Palette,
    },
    {
      name: 'Customize',
      href: `/?subdomain=${currentCommunity?.slug}/settings/customize`,
      icon: Settings,
    },
  ];

  // Get the current active route
  const getCurrentRoute = () => {
    const path = location.search.split('?subdomain=')[1]?.split('/')[1] || '';
    return `/${path}`;
  };

  const currentRoute = getCurrentRoute();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 p-2 rounded-md hover:bg-gray-100"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <Link to="/" className="flex items-center space-x-2 ml-4">
              <Globe2 className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Terrarium</span>
            </Link>
            <span className="ml-4 text-gray-400">|</span>
            <span className="ml-4 text-gray-600">Community Owner</span>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-sm transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive =
                currentRoute === item.href.split('?subdomain=')[1];
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex items-center ${isSidebarOpen ? 'min-w-[24px]' : 'justify-center w-full'}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}
                    />
                  </div>
                  {isSidebarOpen && (
                    <span className="ml-3 whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-20'
          } p-8`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
