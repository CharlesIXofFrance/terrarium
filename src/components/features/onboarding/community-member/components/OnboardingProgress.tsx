/**
 * Internal component for tracking onboarding progress
 */

import React from 'react';
import { Progress } from '@/components/ui/atoms/Progress';
import { onboardingSteps } from '@/lib/stores/community-member';

interface OnboardingProgressProps {
  currentStep: string;
  completed: {
    welcome_completed: boolean;
    identity_pact_completed: boolean;
    profile_completed: boolean;
    rewards_claimed: boolean;
  };
}

export function OnboardingProgress({
  currentStep,
  completed,
}: OnboardingProgressProps) {
  const progress =
    (Object.values(completed).filter(Boolean).length / onboardingSteps.length) *
    100;

  return (
    <div className="mb-8">
      <Progress value={progress} />
      <div className="mt-2 flex justify-between text-sm text-gray-600">
        {onboardingSteps.map((step) => (
          <span
            key={step}
            className={`${
              step === currentStep
                ? 'text-indigo-600 font-medium'
                : completed[`${step}_completed` as keyof typeof completed]
                  ? 'text-gray-900'
                  : ''
            }`}
          >
            {step.charAt(0).toUpperCase() + step.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}
