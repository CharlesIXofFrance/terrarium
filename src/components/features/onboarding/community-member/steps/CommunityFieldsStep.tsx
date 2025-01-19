/**
 * AI Context: Community Member Experience
 * User Types: MEMBER
 *
 * Community fields step of the member onboarding flow.
 * Handles dynamic fields configured by the community owner.
 *
 * Location: /src/components/features/onboarding/community-member/steps/
 * - Final step in onboarding flow
 * - Handles community-specific fields
 *
 * Responsibilities:
 * - Render dynamic fields
 * - Validate per field type
 * - Handle field dependencies
 *
 * Design Constraints:
 * - Must support all field types
 * - Must handle validation rules
 * - Must be accessible
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/atoms/Input';
import { Select } from '@/components/ui/atoms/Select';
import { Button } from '@/components/ui/atoms/Button';
import { useCommunityFields } from '@/lib/hooks/useCommunityFields';

interface CommunityFieldsStepProps {
  communityId: string;
  defaultValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onBack: () => void;
}

export function CommunityFieldsStep({
  communityId,
  defaultValues = {},
  onSubmit,
  onBack,
}: CommunityFieldsStepProps) {
  const { fields, isLoading, error } = useCommunityFields(communityId);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  if (isLoading) {
    return <div>Loading community fields...</div>;
  }

  if (error) {
    return <div>Error loading community fields</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Community</h2>
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-gray-700">
            {field.name}
          </label>
          {field.type === 'select' ? (
            <Select
              {...register(field.id)}
              error={errors[field.id]?.message}
              className="mt-1"
            >
              <option value="">Select {field.name}...</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              {...register(field.id)}
              type={field.type === 'date' ? 'date' : 'text'}
              error={errors[field.id]?.message}
              className="mt-1"
            />
          )}
        </div>
      ))}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Complete'}
        </Button>
      </div>
    </form>
  );
}
