import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Home, Users, Briefcase, Settings, Palette, Globe2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export const Sidebar = () => {
  const { slug } = useParams();
  const { user } = useAuth();

  const communityNavigation = [
    { name: 'Dashboard', to: `/c/${slug}`, icon: Home },
    { name: 'Members', to: `/c/${slug}/members`, icon: Users },
    { name: 'Jobs', to: `/c/${slug}/jobs`, icon: Briefcase },
    { name: 'Branding', to: `/c/${slug}/settings/branding`, icon: Palette },
    { name: 'Settings', to: `/c/${slug}/settings`, icon: Settings },
  ];

  const platformNavigation = [
    { name: 'Dashboard', to: '/platform', icon: Home },
    { name: 'Communities', to: '/platform/communities', icon: Globe2 },
    { name: 'Users', to: '/platform/users', icon: Users },
    { name: 'Settings', to: '/platform/settings', icon: Settings },
  ];

  const navigation = user?.role === 'platform_owner' ? platformNavigation : communityNavigation;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 lg:pb-4 lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex flex-col flex-1 h-0 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-100 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className="flex-shrink-0 w-6 h-6 mr-3"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
