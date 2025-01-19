/**
 * AI Context: Community Member Experience
 * User Types: MEMBER
 *
 * Profile step of the community member onboarding flow.
 * Collects member's current status and preferences.
 *
 * Location: /src/components/features/onboarding/community-member/steps/
 * - Third step in onboarding flow
 * - Handles current status
 *
 * Responsibilities:
 * - Collect current status
 * - Gather preferences
 * - Handle validation
 *
 * Design Constraints:
 * - Must validate all fields
 * - Must handle numeric inputs
 * - Must preserve existing data
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/atoms/Input';
import { Select } from '@/components/ui/atoms/Select';
import { Button } from '@/components/ui/atoms/Button';
import {
  currentStatusFormSchema,
  type CurrentStatus,
} from '@/lib/types/profile';

interface CommunityMemberProfileStepProps {
  defaultValues?: Partial<CurrentStatus>;
  onSubmit: (data: CurrentStatus) => Promise<void>;
  onBack: () => void;
}

export function CommunityMemberProfileStep({
  defaultValues,
  onSubmit,
  onBack,
}: CommunityMemberProfileStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CurrentStatus>({
    resolver: zodResolver(currentStatusFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Profile</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Current Role
        </label>
        <Input
          {...register('current_role')}
          error={errors.current_role?.message}
          className="mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Company
        </label>
        <Input
          {...register('company')}
          error={errors.company?.message}
          className="mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Employment Status
        </label>
        <Select
          {...register('employment_status')}
          error={errors.employment_status?.message}
          className="mt-1"
        >
          <option value="">Select status...</option>
          <option value="employed">Employed</option>
          <option value="looking">Looking for opportunities</option>
          <option value="open">Open to opportunities</option>
          <option value="not_looking">Not looking</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Years of Experience
        </label>
        <Input
          {...register('years_of_experience')}
          type="number"
          error={errors.years_of_experience?.message}
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
