import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/stores/auth';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { FileUpload } from '@/components/ui/atoms/FileUpload';
import { supabase } from '@/lib/supabase';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { Globe, Upload, Eye, Users } from 'lucide-react';
import { SUPPORTED_IMAGE_TYPES } from '@/lib/constants/images';

/**
 * AI CONTEXT - DON'T DELETE
 * AI Context: Member Experience
 * User Types: MEMBER
 *
 * Onboarding flow for new community members.
 * Collects required profile information and preferences.
 *
 * Location: /src/components/features/onboarding/
 * - Separate from owner onboarding
 * - Part of member signup flow
 *
 * Responsibilities:
 * - Profile information collection
 * - Job preferences setup
 * - Community-specific fields
 * - Privacy settings
 *
 * Design Constraints:
 * - Must adapt to community settings
 * - Must validate required fields
 * - Must be mobile responsive
 */

// Types
export interface FormData {
  fullName: string;
  bio: string;
  profilePicture: File | null;
  profilePictureUrl: string | null;
  skills: string[];
  interests: string[];
  location: string;
  title: string;
  company: string;
  yearsOfExperience: number;
}

const steps = [
  {
    title: 'Welcome to Terrarium',
    description: "Let's get you set up in a few simple steps.",
    icon: Globe,
  },
  {
    title: 'Basic Information',
    description: 'Tell us about yourself.',
    icon: Users,
  },
  {
    title: 'Profile Setup',
    description: 'Set up your professional profile.',
    icon: Upload,
  },
  {
    title: 'Almost Done!',
    description: 'Review your profile and get started.',
    icon: Eye,
  },
];

export function MemberOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    bio: '',
    profilePicture: null,
    profilePictureUrl: null,
    skills: [],
    interests: [],
    location: '',
    title: '',
    company: '',
    yearsOfExperience: 0,
  });

  const [user, setUser] = useAtom(userAtom);
  const navigate = useNavigate();

  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>(
    {}
  );
  const { signedUrl: profilePictureSignedUrl } = useSignedUrl(
    formData?.profilePictureUrl
  );

  const handleNext = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Update profile in step 1
      if (currentStep === 1) {
        if (!formData.fullName) {
          setError('Full name is required');
          setIsSubmitting(false);
          return;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.fullName,
            bio: formData.bio,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      // If this is the last step, update profile completion and redirect
      if (currentStep === steps.length - 1) {
        try {
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ profile_complete: true })
            .eq('id', user.id);

          if (profileUpdateError) throw profileUpdateError;

          setUser({
            ...user,
            profile_complete: true,
          });

          // Navigate to the member hub
          navigate('/member-hub');
          return;
        } catch (error) {
          console.error('Error in final step:', error);
          setError('Failed to complete onboarding. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    try {
      const fileName = `${user.id}/profile/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: fileName })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
        profilePictureUrl: fileName,
      }));

      setError(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Error uploading image');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {steps[currentStep].title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {steps[currentStep].description}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {currentStep === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <Input
                  type="text"
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Picture
                </label>
                <FileUpload
                  accept={SUPPORTED_IMAGE_TYPES.logo.join(',')}
                  onChange={(file) => handleImageUpload(file)}
                  helpText="PNG, JPG, GIF up to 10MB"
                  previewUrl={
                    localPreviews.profilePicture ||
                    (formData.profilePicture
                      ? URL.createObjectURL(formData.profilePicture)
                      : profilePictureSignedUrl || undefined)
                  }
                  imageClassName="h-32 w-32 object-cover rounded-full border border-gray-200 mx-auto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <Input
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-6">
          {currentStep > 0 && (
            <Button onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          )}
          <Button onClick={handleNext} disabled={isSubmitting}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
