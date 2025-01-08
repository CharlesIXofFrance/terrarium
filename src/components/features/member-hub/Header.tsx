import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Bell, Globe, Menu } from 'lucide-react';
import { useAtom } from 'jotai';
import { currentCommunityAtom } from '@/lib/stores/community';
import { supabase } from '@/lib/supabase';
import { parseDomain } from '@/lib/utils/subdomain';
import { Button } from '@/components/ui/atoms/Button';

/**
 * AI CONTEXT - DON'T DELETE
 * AI Context: Member Experience
 * User Types: MEMBER
 *
 * Header component for the member hub dashboard.
 * Shows community branding and member navigation.
 *
 * Location: /src/components/features/member-hub/
 * - Part of member dashboard
 * - Separate from community owner view
 *
 * Responsibilities:
 * - Display community branding
 * - Show member navigation
 * - Handle member actions
 * - Manage notifications
 *
 * Design Constraints:
 * - Must use community colors
 * - Must be responsive
 * - Must show all key actions
 */

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
  const { subdomain } = parseDomain();
  const location = useLocation();
  const [currentCommunity, setCurrentCommunity] = useAtom(currentCommunityAtom);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const NavLink = isPreview ? 'div' : Link;

  // Function to create URLs with subdomain parameter
  const createUrl = (path: string) => {
    const baseSubdomain = subdomain || communitySlug;
    return baseSubdomain ? `/?subdomain=${baseSubdomain}${path}` : path;
  };

  // Get the current URL from the location
  const currentUrl = location.search ? location.search : createUrl('/');

  // Subscribe to community changes
  useEffect(() => {
    if (!communitySlug) return;

    const channel = supabase
      .channel(`community_${communitySlug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communities',
          filter: `slug=eq.${communitySlug}`,
        },
        async (payload) => {
          // Fetch the updated community data
          const { data: community } = await supabase
            .from('communities')
            .select('*')
            .eq('slug', communitySlug)
            .single();

          if (community) {
            setCurrentCommunity(community);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communitySlug, setCurrentCommunity]);

  // Update logo URL when community changes
  useEffect(() => {
    const updateLogoUrl = async () => {
      if (currentCommunity?.logo_url) {
        try {
          const {
            data: { signedUrl },
            error,
          } = await supabase.storage
            .from('community-assets')
            .createSignedUrl(
              currentCommunity.logo_url.replace(/^.*community-assets\//, ''),
              3600
            );

          if (!error && signedUrl) {
            setLogoUrl(signedUrl);
          } else {
            setLogoUrl(null);
          }
        } catch (error) {
          console.error('Error getting logo URL:', error);
          setLogoUrl(null);
        }
      } else {
        setLogoUrl(null);
      }
    };

    updateLogoUrl();
  }, [currentCommunity?.logo_url]);

  // Get branding settings from the current community
  const brandingSettings = currentCommunity?.settings?.branding || {};
  const primaryColor = brandingSettings.primaryColor || styles.colors.primary;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-10 h-[72px] border-none"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="h-full flex items-center justify-between px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-white/80 mr-4"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <NavLink
            to={isPreview ? '#' : createUrl('/')}
            className="flex items-center"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={communityName}
                className="h-10 w-auto md:h-12 object-contain"
              />
            ) : (
              <Globe className="h-10 w-10 md:h-12 md:w-12 text-white" />
            )}
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center space-x-8 ml-8">
          {navigation
            .filter((item) => item.name !== 'Home')
            .map((item) => (
              <NavLink
                key={item.name}
                to={createUrl(item.href)}
                className={`text-white hover:text-white/80 ${
                  location.pathname === createUrl(item.href)
                    ? 'font-semibold'
                    : ''
                }`}
              >
                {item.name}
              </NavLink>
            ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Notifications */}
          {onToggleNotifications && (
            <button
              onClick={onToggleNotifications}
              className="text-white hover:text-white/80"
            >
              <Bell className="h-6 w-6" />
            </button>
          )}

          {/* User menu */}
          {user && (
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.name}
                className="h-8 w-8 rounded-full"
              />
              <span className="text-white hidden md:inline">{user.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-[72px] left-0 right-0 bg-white shadow-lg md:hidden">
          <nav className="px-4 py-2">
            {navigation
              .filter((item) => item.name !== 'Home')
              .map((item) => (
                <NavLink
                  key={item.name}
                  to={createUrl(item.href)}
                  className={`block py-2 text-gray-800 hover:text-gray-600 ${
                    location.pathname === createUrl(item.href)
                      ? 'font-semibold'
                      : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
          </nav>
        </div>
      )}
    </header>
  );
}
