import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from '../../../lib/stores/auth';
import { Button } from '../../ui/atoms/Button';
import { Input } from '../../ui/atoms/Input';
import { supabase } from '../../../lib/supabase';
import { slugify } from '../../../lib/utils/string';

const steps = [
  {
    title: 'Welcome to Terrarium',
    description: "Let's set up your community in a few simple steps.",
  },
  {
    title: 'Community Details',
    description: 'Tell us about your community.',
  },
  {
    title: 'Customize Your Job Board',
    description: 'Set up your job board preferences.',
  },
  {
    title: 'Almost Done!',
    description: 'Review your settings and launch your community.',
  },
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    jobBoardSettings: {
      requireApproval: true,
      categories: ['Engineering', 'Design', 'Product'],
    },
  });

  const [user, setUser] = useAtom(userAtom);
  const [userCommunity, setUserCommunity] = useAtom(userCommunityAtom);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (!formData.name && currentStep === 1) {
      setError('Please enter a community name');
      return;
    }

    if (currentStep === 1) {
      setIsSubmitting(true);
      setError(null);

      try {
        if (!user) throw new Error('User not found');

        const { data: community, error: createError } = await supabase
          .from('communities')
          .insert([
            {
              name: formData.name,
              slug: slugify(formData.name),
              description: formData.description,
              owner_id: user.id,
              settings: {
                jobBoard: {
                  requireApproval: true,
                  categories: ['Engineering', 'Design', 'Product'],
                },
                branding: {
                  primaryColor: '#4F46E5',
                  secondaryColor: '#818CF8',
                  fontFamily: 'Inter',
                },
              },
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        if (!community) throw new Error('Failed to create community');

        const { error: memberError } = await supabase
          .from('community_members')
          .insert([
            {
              community_id: community.id,
              profile_id: user.id,
              role: 'admin',
            },
          ]);

        if (memberError) throw memberError;

        setUserCommunity(community);
        setCurrentStep((prev) => prev + 1);
      } catch (err) {
        console.error('Error creating community:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to create community'
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (currentStep === steps.length - 1) {
      setIsSubmitting(true);
      setError(null);

      try {
        if (!user || !userCommunity)
          throw new Error('User or community not found');

        const { error: updateError } = await supabase
          .from('communities')
          .update({
            settings: {
              ...userCommunity.settings,
              jobBoard: formData.jobBoardSettings,
            },
          })
          .eq('id', userCommunity.id)
          .select()
          .single();

        if (updateError) throw updateError;

        const { error: profileError } = await supabase
          .from('profiles')
          .update({ profile_complete: 1 })
          .eq('id', user.id)
          .select()
          .single();

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw new Error('Failed to update profile completion status');
        }

        setUser({ ...user, profile_complete: true });

        navigate('/admin/dashboard');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update community'
        );
        console.error('Error in final step:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {steps[currentStep].title}
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              {steps[currentStep].description}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {currentStep === 1 && (
              <>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Community Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <Input
                    id="description"
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData('description', e.target.value)
                    }
                    required
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Job Board Settings
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={formData.jobBoardSettings.requireApproval}
                      onChange={(e) =>
                        updateFormData('jobBoardSettings', {
                          ...formData.jobBoardSettings,
                          requireApproval: e.target.checked,
                        })
                      }
                    />
                    <span className="ml-2">
                      Require approval for new job posts
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              {currentStep > 0 && (
                <Button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
