/**
 * AI Context: Community Member Experience
 * User Types: MEMBER
 *
 * Welcome step of the community member onboarding flow.
 * Shows welcome video and meme, introduces the community.
 *
 * Location: /src/components/features/onboarding/community-member/steps/
 * - First step in onboarding flow
 * - Handles welcome content
 *
 * Responsibilities:
 * - Play welcome video
 * - Show welcome meme
 * - Provide next step
 *
 * Design Constraints:
 * - Must be welcoming
 * - Must handle video errors
 * - Must support mobile
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/atoms/Button';
import { useToast } from '@/lib/hooks/useToast';
import { supabase } from '@/lib/supabase';
import type { CommunityMemberConfig } from '@/lib/types/community-member';

interface CommunityMemberWelcomeStepProps {
  onComplete: (data: Record<string, never>) => void;
}

export function CommunityMemberWelcomeStep({
  onComplete,
}: CommunityMemberWelcomeStepProps) {
  const { toast } = useToast();
  const [videoError, setVideoError] = useState(false);

  // Fetch community config
  const { data: config, isLoading } = useQuery<CommunityMemberConfig>({
    queryKey: ['community-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_member_config')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleVideoError = () => {
    setVideoError(true);
    toast({
      title: 'Video Error',
      description: 'Could not load the welcome video',
      type: 'error',
    });
  };

  if (isLoading) {
    return <div>Loading welcome content...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Welcome to Your Community!
      </h2>

      {/* Welcome Video */}
      {config?.welcomeVideoUrl && !videoError && (
        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
          <video
            src={config.welcomeVideoUrl}
            controls
            className="w-full"
            onError={handleVideoError}
            data-testid="welcome-video"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Welcome Meme */}
      {config?.rewardsConfig.welcomeMeme && (
        <div className="rounded-lg overflow-hidden">
          <img
            src={config.rewardsConfig.welcomeMeme}
            alt="Welcome to the community"
            className="w-full"
          />
        </div>
      )}

      <p className="text-gray-600">
        We're excited to have you join our community! Let's get your profile set
        up so you can start connecting with other members.
      </p>

      <Button onClick={() => onComplete({})} className="w-full">
        Let's Get Started
      </Button>
    </div>
  );
}
