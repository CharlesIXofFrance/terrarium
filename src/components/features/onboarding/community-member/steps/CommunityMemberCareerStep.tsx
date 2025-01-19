/**
 * AI Context: Community Member Experience
 * User Types: MEMBER
 *
 * Career step of the community member onboarding flow.
 * Collects career preferences and goals.
 *
 * Location: /src/components/features/onboarding/community-member/steps/
 * - Fourth step in onboarding flow
 * - Handles career settings
 *
 * Responsibilities:
 * - Collect career preferences
 * - Gather salary expectations
 * - Handle validation
 *
 * Design Constraints:
 * - Must validate numeric inputs
 * - Must handle currency formats
 * - Must preserve existing data
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/atoms/Input';
import { Select } from '@/components/ui/atoms/Select';
import { Button } from '@/components/ui/atoms/Button';
import {
  careerSettingsFormSchema,
  type CareerSettings,
} from '@/lib/types/profile';

interface CommunityMemberCareerStepProps {
  defaultValues?: Partial<CareerSettings>;
  onSubmit: (data: CareerSettings) => Promise<void>;
  onBack: () => void;
}

export function CommunityMemberCareerStep({
  defaultValues,
  onSubmit,
  onBack,
}: CommunityMemberCareerStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CareerSettings>({
    resolver: zodResolver(careerSettingsFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Openness to Opportunities
        </label>
        <Select
          {...register('openness_to_opportunities')}
          error={errors.openness_to_opportunities?.message}
          className="mt-1"
        >
          <option value="">Select your status...</option>
          <option value="looking_actively">Looking Actively</option>
          <option value="open_to_opportunities">Open to Opportunities</option>
          <option value="not_open">Not Open</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Desired Salary
          </label>
          <Input
            {...register('desired_salary', { valueAsNumber: true })}
            type="number"
            error={errors.desired_salary?.message}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Salary Interval
          </label>
          <Select
            {...register('desired_salary_interval')}
            error={errors.desired_salary_interval?.message}
            className="mt-1"
          >
            <option value="">Select interval...</option>
            <option value="yearly">Per Year</option>
            <option value="monthly">Per Month</option>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Preferred Roles
        </label>
        <Input
          {...register('preferred_roles')}
          placeholder="e.g., Software Engineer, Product Manager"
          error={errors.preferred_roles?.message}
          className="mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Preferred Locations
        </label>
        <Input
          {...register('preferred_locations')}
          placeholder="e.g., Remote, San Francisco, London"
          error={errors.preferred_locations?.message}
          className="mt-1"
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
}
