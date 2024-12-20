import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bell, Globe } from 'lucide-react';

interface HeaderProps {
  styles: any;
  communityName: string;
  navigation?: Array<{ name: string; href: string; icon: React.ElementType }>;
  currentPath?: string;
  notifications?: Array<{ id: number; title: string; message: string }>;
  showNotifications?: boolean;
  onToggleNotifications?: () => void;
  user?: any;
  isPreview?: boolean;
}

export function Header({
  styles,
  communityName,
  navigation = [],
  currentPath,
  notifications = [],
  showNotifications,
  onToggleNotifications,
  user,
  isPreview = false,
}: HeaderProps) {
  const { communitySlug } = useParams();
  const NavLink = isPreview ? 'div' : Link;

  return (
    <header
      className="absolute top-0 left-0 right-0 z-10 h-[72px]"
      style={{ backgroundColor: styles.colors.primary }}
    >
      <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
        <div className="flex items-center space-x-12">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Globe className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">
              {communityName}
            </span>
          </div>

          {/* Navigation */}
          {navigation.length > 0 && (
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;

                return isPreview ? (
                  <div
                    key={item.name}
                    className={`flex items-center space-x-2 text-white/80 cursor-default ${
                      isActive ? 'text-white' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 text-white/80 hover:text-white hover:underline transition-all duration-200 ${
                      isActive ? 'text-white' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          {onToggleNotifications && (
            <button
              onClick={isPreview ? undefined : onToggleNotifications}
              className={`relative text-white/80 hover:text-white transition-colors ${
                isPreview ? 'cursor-default' : ''
              }`}
            >
              <Bell className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  {notifications.length}
                </span>
              )}
            </button>
          )}

          {/* Profile Picture */}
          {user?.avatar &&
            (isPreview ? (
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <Link to={`/m/${communitySlug}/profile`}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              </Link>
            ))}
        </div>
      </div>
    </header>
  );
}
