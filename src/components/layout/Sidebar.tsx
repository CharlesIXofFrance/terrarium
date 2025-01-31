import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  Settings,
  Palette,
  Globe2,
  Building2,
  LayoutGrid,
  Database,
  Plug,
  CreditCard,
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';

export const Sidebar = () => {
  const { user } = useAuth();
  const { slug } = useParams();

  const communityNavigation = [
    { name: 'Dashboard', to: `/c/${slug}`, icon: Home },
    { name: 'Members', to: `/c/${slug}/members`, icon: Users },
    { name: 'Jobs', to: `/c/${slug}/jobs`, icon: Briefcase },
    { name: 'Employers', to: `/c/${slug}/employers`, icon: Building2 },
    { name: 'Settings', to: `/c/${slug}/settings`, icon: Settings },
  ];

  const platformNavigation = [
    { name: 'Dashboard', to: '/platform', icon: Home },
    { name: 'Communities', to: '/platform/communities', icon: Globe2 },
    { name: 'Settings', to: '/platform/settings', icon: Settings },
  ];

  const settingsLinks = [
    {
      name: 'Branding',
      to: `/c/${slug}/settings/branding`,
      icon: Palette,
    },
    {
      name: 'Data',
      to: `/c/${slug}/settings/data`,
      icon: Database,
    },
    {
      name: 'Job Board',
      to: `/c/${slug}/settings/job-board`,
      icon: LayoutGrid,
    },
    {
      name: 'Integrations',
      to: `/c/${slug}/settings/integrations`,
      icon: Plug,
    },
    {
      name: 'Billing',
      to: `/c/${slug}/settings/billing`,
      icon: CreditCard,
    },
    {
      name: 'Team',
      to: `/c/${slug}/settings/team`,
      icon: Users,
    },
  ];

  const navigation =
    user?.role === 'admin'
      ? platformNavigation
      : [...communityNavigation, ...settingsLinks];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 lg:pb-4 lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex flex-col flex-1 gap-y-7 px-6">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-x-3 px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-50 text-primary-600'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`
              }
            >
              {React.createElement(item.icon, {
                className: 'h-5 w-5 flex-shrink-0',
                'aria-hidden': 'true',
              })}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
