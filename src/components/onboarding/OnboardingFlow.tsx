import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useSetAtom } from 'jotai';
import { currentCommunityAtom } from '../../stores/community';
import { hasCompletedOnboardingAtom } from '../../lib/auth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    jobBoardSettings: {
      requireApproval: true,
      categories: ['Engineering', 'Design', 'Product'],
    },
  });
  
  const setCommunity = useSetAtom(currentCommunityAtom);
  const [, setHasCompletedOnboarding] = useAtom(hasCompletedOnboardingAtom);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if onboarding is already completed
    if (localStorage.getItem('onboarding_completed')) {
      navigate('/c/default');
    }
  }, [navigate]);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      // Create community
      const community = {
        id: crypto.randomUUID(),
        ...formData,
        members: [],
        employers: [],
        settings: {
          branding: {},
          jobBoard: formData.jobBoardSettings,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setCommunity(community);
      localStorage.setItem('onboarding_completed', 'true');
      setHasCompletedOnboarding(true);
      navigate('/c/default');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Terrarium
            </h2>
            <p className="text-gray-600 mb-8">
              Let's get your community set up in just a few minutes.
            </p>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Community Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value,
                }))}
                placeholder="e.g., Women in Fintech"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value,
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                placeholder="Tell us about your community..."
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Categories
              </label>
              <div className="space-y-2">
                {formData.jobBoardSettings.categories.map((category, index) => (
                  <Input
                    key={index}
                    value={category}
                    onChange={(e) => {
                      const newCategories = [...formData.jobBoardSettings.categories];
                      newCategories[index] = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        jobBoardSettings: {
                          ...prev.jobBoardSettings,
                          categories: newCategories,
                        },
                      }));
                    }}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    jobBoardSettings: {
                      ...prev.jobBoardSettings,
                      categories: [...prev.jobBoardSettings.categories, ''],
                    },
                  }))}
                >
                  Add Category
                </Button>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.jobBoardSettings.requireApproval}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  jobBoardSettings: {
                    ...prev.jobBoardSettings,
                    requireApproval: e.target.checked,
                  },
                }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Require approval for new job postings
              </label>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Your Settings
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Community Name
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {formData.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {formData.description}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Job Categories
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {formData.jobBoardSettings.categories.join(', ')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-8">
            <div className="relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                <div
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`${
                      index <= currentStep ? 'text-indigo-600' : ''
                    }`}
                  >
                    Step {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {renderStep()}

          <div className="mt-8 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button type="button" onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Launch Community' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}