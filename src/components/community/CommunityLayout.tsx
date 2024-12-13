import React, { useState } from 'react';
import { Outlet, Link, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building2, 
  Settings,
  Palette,
  Menu,
  X,
  Globe2
} from 'lucide-react';

export function CommunityLayout() {
  const { communitySlug } = useParams();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: `/c/${communitySlug}`, icon: LayoutDashboard },
    { name: 'Members', href: `/c/${communitySlug}/members`, icon: Users },
    { name: 'Jobs', href: `/c/${communitySlug}/jobs`, icon: Briefcase },
    { name: 'Employers', href: `/c/${communitySlug}/employers`, icon: Building2 },
    { name: 'Settings', href: `/c/${communitySlug}/settings/job-board`, icon: Settings },
    { name: 'Customize', href: `/c/${communitySlug}/customize`, icon: Palette },
  ];

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
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/" className="flex items-center space-x-2 ml-4">
              <Globe2 className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Terrarium</span>
            </Link>
            <span className="ml-4 text-gray-400">|</span>
            <span className="ml-4 text-gray-600">Community Admin</span>
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
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
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
                  <div className={`flex items-center ${isSidebarOpen ? 'min-w-[24px]' : 'justify-center w-full'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                  </div>
                  {isSidebarOpen && (
                    <span className="ml-3 whitespace-nowrap">
                      {item.name}
                    </span>
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