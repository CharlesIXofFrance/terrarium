/**
 * AI Context: Community Member Experience
 * User Types: MEMBER
 *
 * Multi-step onboarding flow for new community members.
 * Handles profile setup, identity verification, and community integration.
 *
 * Location: /src/components/features/onboarding/community-member/
 * - Part of member experience flow
 * - Integrated with community configuration
 *
 * Responsibilities:
 * - Guide through onboarding steps
 * - Collect required information
 * - Handle identity verification
 * - Manage completion status
 * - Show rewards and animations
 *
 * Design Constraints:
 * - Must follow community configuration
 * - Must validate all steps
 * - Must handle file uploads securely
 * - Must support rewards system
 */

import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/stores/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/hooks/useToast';
import {
  communityMemberOnboardingAtom,
  onboardingFormDataAtom,
  onboardingRewardsAtom,
} from '@/lib/stores/community-member';
import { OnboardingProgress } from './components/OnboardingProgress';
import { CommunityMemberWelcomeStep } from './steps/CommunityMemberWelcomeStep';
import { CommunityMemberIdentityStep } from './steps/CommunityMemberIdentityStep';
import { CommunityMemberProfileStep } from './steps/CommunityMemberProfileStep';
import { CommunityFieldsStep } from './steps/CommunityFieldsStep';
import type { Profile } from '@/lib/types/profile';

const onboardingSteps = [
  'welcome',
  'identity',
  'profile',
  'community',
] as const;
type OnboardingStep = (typeof onboardingSteps)[number];

export function CommunityMemberOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user] = useAtom(userAtom);
  const [onboardingState, setOnboardingState] = useAtom(
    communityMemberOnboardingAtom
  );
  const [formData, setFormData] = useAtom(onboardingFormDataAtom);
  const [, setRewards] = useAtom(onboardingRewardsAtom);

  const handleAvatarUpload = async (file: File | null) => {
    try {
      if (!file || !user?.id) return;

      // Upload avatar to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('public').getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update form data
      setFormData((prev) => ({
        ...prev,
        avatar_url: publicUrl,
      }));

      toast({
        title: 'Success',
        description: 'Profile picture uploaded successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload profile picture',
        variant: 'destructive',
      });
    }
  };

  const handleStepComplete = async (
    step: OnboardingStep,
    data: Partial<Profile>
  ) => {
    try {
      // Update form data
      setFormData((prev) => ({ ...prev, ...data }));

      // Update completion status
      const newState = {
        ...onboardingState,
        completed: {
          ...onboardingState.completed,
          [`${step}_completed`]: true,
        },
      };

      // Get current step index
      const currentStepIndex = onboardingSteps.indexOf(step) + 1;
      const isLastStep = currentStepIndex === onboardingSteps.length;

      // Merge with existing form data for complete profile update
      const updatedProfileData: Partial<Profile> = {
        ...formData,
        ...data,
        onboarding_step: currentStepIndex,
        onboarding_completed: isLastStep,
      };

      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfileData)
        .eq('id', user?.id);

      if (error) throw error;

      // Update community member data if needed
      if (isLastStep) {
        const { error: memberError } = await supabase
          .from('community_members')
          .update({
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('profile_id', user?.id)
          .eq('community_id', user?.user_metadata?.communityId);

        if (memberError) throw memberError;
      }

      // Show rewards if applicable
      if (step === 'welcome') {
        setRewards((prev) => ({ ...prev, showWelcomeMeme: true }));
      }

      // Move to next step or complete onboarding
      const currentIndex = onboardingSteps.indexOf(step);
      if (currentIndex < onboardingSteps.length - 1) {
        setOnboardingState({
          ...newState,
          currentStep: onboardingSteps[currentIndex + 1],
        });
      } else {
        // Show completion animation and redirect
        setRewards((prev) => ({ ...prev, showCompletionAnimation: true }));

        // Get current community from URL
        const params = new URLSearchParams(window.location.search);
        const community = params.get('subdomain') || '';

        // Redirect to member profile in the community
        navigate(`/?subdomain=${community}&path=/profile`);
      }

      toast({
        title: 'Success',
        description: 'Progress saved successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    const currentIndex = onboardingSteps.indexOf(
      onboardingState.currentStep as OnboardingStep
    );
    if (currentIndex > 0) {
      setOnboardingState({
        ...onboardingState,
        currentStep: onboardingSteps[currentIndex - 1],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <OnboardingProgress
          currentStep={onboardingState.currentStep as OnboardingStep}
          completed={onboardingState.completed}
        />

        {/* Step content */}
        <div className="bg-white shadow rounded-lg p-6">
          {onboardingState.currentStep === 'welcome' && (
            <CommunityMemberWelcomeStep
              onComplete={(data) => handleStepComplete('welcome', data)}
            />
          )}

          {onboardingState.currentStep === 'identity' && (
            <CommunityMemberIdentityStep
              defaultValues={formData}
              onAvatarUpload={handleAvatarUpload}
              onSubmit={(data) => handleStepComplete('identity', data)}
              onBack={handleBack}
            />
          )}

          {onboardingState.currentStep === 'profile' && (
            <CommunityMemberProfileStep
              defaultValues={formData}
              onSubmit={(data) => handleStepComplete('profile', data)}
              onBack={handleBack}
            />
          )}

          {onboardingState.currentStep === 'community' && (
            <CommunityFieldsStep
              communityId={user?.user_metadata?.communityId || ''}
              defaultValues={formData.community_fields}
              onSubmit={(data) => handleStepComplete('community', data)}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
