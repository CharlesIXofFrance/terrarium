import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/stores/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/hooks/useToast';
import {
  profileFormSchema,
  currentStatusFormSchema,
  careerSettingsFormSchema,
  type Profile,
  type CurrentStatus,
  type CareerSettings,
} from '@/lib/types/profile';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Select } from '@/components/ui/atoms/Select';
import { FileUpload } from '@/components/ui/atoms/FileUpload';
import { Progress } from '@/components/ui/atoms/Progress';

const steps = [
  { id: 1, name: 'Welcome' },
  { id: 2, name: 'Personal Info' },
  { id: 3, name: 'Current Status' },
  { id: 4, name: 'Career Settings' },
  { id: 5, name: 'Community Fields' },
];

export function MemberOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();
  const toast = useToast();

  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: user?.full_name?.split(' ')[0] || '',
      last_name: user?.full_name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
    },
  });

  const currentStatusForm = useForm({
    resolver: zodResolver(currentStatusFormSchema),
  });

  const careerSettingsForm = useForm({
    resolver: zodResolver(careerSettingsFormSchema),
  });

  const handleLinkedInSync = async () => {
    // TODO: Implement LinkedIn OAuth sync
    toast({
      title: 'Coming Soon',
      description: 'LinkedIn sync will be available soon!',
      type: 'info',
    });
  };

  const handleAvatarUpload = async (file: File | null) => {
    if (!file || !user) return;

    try {
      const fileName = `${user.id}/avatar/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: fileName })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload avatar',
        type: 'error',
      });
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      // Update profile
      const profileData = profileForm.getValues();
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Insert current status
      const statusData = currentStatusForm.getValues();
      const { error: statusError } = await supabase
        .from('current_status')
        .insert({ profile_id: user.id, ...statusData });

      if (statusError) throw statusError;

      // Insert career settings
      const careerData = careerSettingsForm.getValues();
      const { error: careerError } = await supabase
        .from('career_settings')
        .insert({ profile_id: user.id, ...careerData });

      if (careerError) throw careerError;

      // Mark onboarding as completed
      const { error: completionError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (completionError) throw completionError;

      toast({
        title: 'Success',
        description: 'Profile setup completed successfully!',
        type: 'success',
      });

      navigate('/m/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        type: 'error',
      });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <Progress value={(currentStep / steps.length) * 100} />
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            {steps.map((step) => (
              <span
                key={step.id}
                className={`${
                  step.id === currentStep ? 'text-indigo-600 font-medium' : ''
                }`}
              >
                {step.name}
              </span>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white shadow rounded-lg p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome to Your Community!
              </h2>
              <p className="text-gray-600">
                Let's set up your profile to help you get the most out of your
                community. You can sync with LinkedIn or fill out the
                information manually.
              </p>
              <Button onClick={handleLinkedInSync} className="w-full">
                Sync with LinkedIn
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              <Button onClick={nextStep} variant="outline" className="w-full">
                Fill Out Manually
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <form className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Personal Info
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Input
                    label="First Name"
                    {...profileForm.register('first_name')}
                    error={profileForm.formState.errors.first_name?.message}
                  />
                </div>
                <div>
                  <Input
                    label="Last Name"
                    {...profileForm.register('last_name')}
                    error={profileForm.formState.errors.last_name?.message}
                  />
                </div>
              </div>
              <Input
                label="Email"
                type="email"
                {...profileForm.register('email')}
                error={profileForm.formState.errors.email?.message}
              />
              <Input
                label="Phone"
                type="tel"
                {...profileForm.register('phone')}
                error={profileForm.formState.errors.phone?.message}
              />
              <Input
                label="LinkedIn URL"
                type="url"
                {...profileForm.register('linkedin_url')}
                error={profileForm.formState.errors.linkedin_url?.message}
              />
              <FileUpload
                label="Profile Picture"
                accept="image/*"
                onFileSelect={handleAvatarUpload}
              />
            </form>
          )}

          {currentStep === 3 && (
            <form className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Current Status
              </h2>
              <Select
                label="Job Satisfaction"
                {...currentStatusForm.register('job_satisfaction')}
                error={
                  currentStatusForm.formState.errors.job_satisfaction?.message
                }
              >
                <option value="">Select your satisfaction level</option>
                <option value="very_satisfied">Very Satisfied</option>
                <option value="satisfied">Satisfied</option>
                <option value="neutral">Neutral</option>
                <option value="not_satisfied">Not Satisfied</option>
                <option value="very_not_satisfied">Very Not Satisfied</option>
              </Select>
              <Input
                label="Current Job Title"
                {...currentStatusForm.register('current_job_title')}
                error={
                  currentStatusForm.formState.errors.current_job_title?.message
                }
              />
              <Input
                label="Current Employer"
                {...currentStatusForm.register('employer')}
                error={currentStatusForm.formState.errors.employer?.message}
              />
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Gross Salary"
                  type="number"
                  {...currentStatusForm.register('gross_salary', {
                    valueAsNumber: true,
                  })}
                  error={
                    currentStatusForm.formState.errors.gross_salary?.message
                  }
                />
                <Select
                  label="Interval"
                  {...currentStatusForm.register('salary_interval')}
                  error={
                    currentStatusForm.formState.errors.salary_interval?.message
                  }
                >
                  <option value="">Select interval</option>
                  <option value="yearly">Per Year</option>
                  <option value="monthly">Per Month</option>
                </Select>
              </div>
            </form>
          )}

          {currentStep === 4 && (
            <form className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Career Settings
              </h2>
              <Select
                label="Openness to Opportunities"
                {...careerSettingsForm.register('openness_to_opportunities')}
                error={
                  careerSettingsForm.formState.errors.openness_to_opportunities
                    ?.message
                }
              >
                <option value="">Select your status</option>
                <option value="looking_actively">Looking Actively</option>
                <option value="open_to_opportunities">
                  Open to Opportunities
                </option>
                <option value="not_open">Not Open</option>
              </Select>
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Desired Salary"
                  type="number"
                  {...careerSettingsForm.register('desired_salary', {
                    valueAsNumber: true,
                  })}
                  error={
                    careerSettingsForm.formState.errors.desired_salary?.message
                  }
                />
                <Select
                  label="Interval"
                  {...careerSettingsForm.register('desired_salary_interval')}
                  error={
                    careerSettingsForm.formState.errors.desired_salary_interval
                      ?.message
                  }
                >
                  <option value="">Select interval</option>
                  <option value="yearly">Per Year</option>
                  <option value="monthly">Per Month</option>
                </Select>
              </div>
              {/* TODO: Add multi-select components for roles, locations, etc. */}
            </form>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Community Fields
              </h2>
              <p className="text-gray-600">
                These fields are specific to your community. They help create a
                better experience for all members.
              </p>
              {/* TODO: Render dynamic community fields */}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              onClick={currentStep === steps.length ? handleSubmit : nextStep}
            >
              {currentStep === steps.length ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
