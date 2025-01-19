/**
 * AI Context: Community Member Experience
 * User Types: MEMBER
 *
 * Identity step of the community member onboarding flow.
 * Collects basic profile information and avatar.
 *
 * Location: /src/components/features/onboarding/community-member/steps/
 * - Second step in onboarding flow
 * - Handles profile picture upload
 *
 * Responsibilities:
 * - Collect basic profile info
 * - Handle avatar upload
 * - Validate identity fields
 *
 * Design Constraints:
 * - Must validate email format
 * - Must handle image uploads
 * - Must preserve existing data
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/atoms/Input';
import { FileUpload } from '@/components/ui/atoms/FileUpload';
import { Button } from '@/components/ui/atoms/Button';
import { profileFormSchema, type Profile } from '@/lib/types/profile';

interface CommunityMemberIdentityStepProps {
  defaultValues: Partial<Profile>;
  onAvatarUpload: (file: File | null) => Promise<void>;
  onSubmit: (data: Profile) => Promise<void>;
  onBack: () => void;
}

export function CommunityMemberIdentityStep({
  defaultValues,
  onAvatarUpload,
  onSubmit,
  onBack,
}: CommunityMemberIdentityStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Profile>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      data-testid="identity-form"
    >
      <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
      <div>
        <FileUpload
          label="Upload a profile picture"
          accept="image/*"
          onChange={(file) => onAvatarUpload(file)}
          className="mt-1"
          helpText="Choose a profile picture that represents you in the community"
        />
      </div>

      <div>
        <label
          htmlFor="display_name"
          className="block text-sm font-medium text-gray-700"
        >
          Display Name
        </label>
        <Input
          {...register('display_name')}
          id="display_name"
          aria-label="Display Name"
          error={errors.display_name?.message}
          className="mt-1"
          placeholder="How should we call you in the community?"
        />
      </div>

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700"
        >
          Bio
        </label>
        <textarea
          {...register('bio')}
          id="bio"
          rows={4}
          className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Tell us a bit about yourself"
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          aria-label="Previous Step"
        >
          Previous Step
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Continue
        </Button>
      </div>
    </form>
  );
}
