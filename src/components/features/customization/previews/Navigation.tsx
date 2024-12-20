import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Home,
  Briefcase,
  Calendar,
  BookOpen,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Header } from '../../member-hub/Header';
import { useAuth } from '../../../../lib/hooks/useAuth';
import type { NavigationItem } from '../../../../lib/types/navigation';

interface NavigationProps {
  styles: Record<string, string>;
  mode: 'desktop' | 'mobile' | 'fullscreen';
}

export function Navigation({ styles, mode }: NavigationProps) {
  const { communitySlug } = useParams();
  const { user } = useAuth();

  const navigation: NavigationItem[] = [
    {
      name: 'Home',
      href: `/m/${communitySlug}`,
      icon: Home,
    },
    {
      name: 'Jobs',
      href: `/m/${communitySlug}/jobs`,
      icon: Briefcase,
    },
    {
      name: 'Events',
      href: `/m/${communitySlug}/events`,
      icon: Calendar,
    },
    {
      name: 'Academy',
      href: `/m/${communitySlug}/academy`,
      icon: BookOpen,
    },
    {
      name: 'Members',
      href: `/m/${communitySlug}/members`,
      icon: Users,
    },
    {
      name: 'Feed',
      href: `/m/${communitySlug}/feed`,
      icon: MessageSquare,
    },
  ];

  const previewUser = {
    name: user?.name || 'Clara Johnson',
    avatar:
      user?.avatar ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
  };

  return (
    <div
      className={`min-h-[600px] ${mode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}
    >
      <Header
        styles={styles}
        navigation={navigation}
        notifications={[]}
        user={previewUser}
        isPreview={true}
      />
      <div className="pt-20 px-4">
        <div className="bg-gray-100 rounded-lg p-8">
          <h2 className="text-lg font-semibold mb-4">Navigation Preview</h2>
          <div className="space-y-4">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(item.icon, { className: 'w-5 h-5' })}
                  <span>{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
