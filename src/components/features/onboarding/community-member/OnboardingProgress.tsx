/**
 * AI Context: Community Member Experience
 * User Types: MEMBER
 *
 * Progress indicator for the community member onboarding flow.
 * Shows current step and overall progress.
 *
 * Location: /src/components/features/onboarding/community-member/
 * - Part of member onboarding flow
 * - Used in CommunityMemberOnboarding
 *
 * Responsibilities:
 * - Display step progress
 * - Show step descriptions
 * - Highlight current step
 *
 * Design Constraints:
 * - Must be accessible
 * - Must be responsive
 * - Must provide clear visual feedback
 */

import React from 'react';
import { Progress } from '@/components/ui/atoms/Progress';

export interface Step {
  id: number;
  name: string;
  description?: string;
}

interface OnboardingProgressProps {
  steps: Step[];
  currentStep: number;
}

export function OnboardingProgress({
  steps,
  currentStep,
}: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      <Progress value={(currentStep / steps.length) * 100} />
      <div className="mt-2 flex justify-between text-sm text-gray-600">
        {steps.map((step) => (
          <span
            key={step.id}
            className={`${
              step.id === currentStep ? 'text-indigo-600 font-medium' : ''
            }`}
            title={step.description}
          >
            {step.name}
          </span>
        ))}
      </div>
    </div>
  );
}
