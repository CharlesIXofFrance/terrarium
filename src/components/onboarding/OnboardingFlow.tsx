import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Step schemas
const communitySchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  category: z.string(),
  isPrivate: z.boolean(),
});

const brandingSchema = z.object({
  logo: z.string().optional(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  banner: z.string().optional(),
});

const invitationSchema = z.object({
  emails: z.array(z.string().email()),
  message: z.string(),
  role: z.enum(['admin', 'member']),
});

type Step = 'community' | 'branding' | 'invitation' | 'complete';

export const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState<Step>('community');
  const navigate = useNavigate();

  // Form setup for each step
  const communityForm = useForm({
    resolver: zodResolver(communitySchema),
  });

  const brandingForm = useForm({
    resolver: zodResolver(brandingSchema),
  });

  const invitationForm = useForm({
    resolver: zodResolver(invitationSchema),
  });

  // Mutations
  const saveCommunity = useMutation({
    mutationFn: async (data: z.infer<typeof communitySchema>) => {
      // API call to save community data
    },
  });

  const saveBranding = useMutation({
    mutationFn: async (data: z.infer<typeof brandingSchema>) => {
      // API call to save branding data
    },
  });

  const sendInvitations = useMutation({
    mutationFn: async (data: z.infer<typeof invitationSchema>) => {
      // API call to send invitations
    },
  });

  // Step handlers
  const handleCommunitySubmit = communityForm.handleSubmit(async (data) => {
    await saveCommunity.mutateAsync(data);
    setCurrentStep('branding');
  });

  const handleBrandingSubmit = brandingForm.handleSubmit(async (data) => {
    await saveBranding.mutateAsync(data);
    setCurrentStep('invitation');
  });

  const handleInvitationSubmit = invitationForm.handleSubmit(async (data) => {
    await sendInvitations.mutateAsync(data);
    setCurrentStep('complete');
  });

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          {['community', 'branding', 'invitation', 'complete'].map((step) => (
            <div
              key={step}
              className={`w-1/4 text-center ${
                currentStep === step ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      {currentStep === 'community' && (
        <form onSubmit={handleCommunitySubmit} className="space-y-6">
          <h2 className="text-2xl font-bold">Community Setup</h2>
          {/* Add form fields */}
        </form>
      )}

      {currentStep === 'branding' && (
        <form onSubmit={handleBrandingSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold">Branding</h2>
          {/* Add form fields */}
        </form>
      )}

      {currentStep === 'invitation' && (
        <form onSubmit={handleInvitationSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold">Invite Members</h2>
          {/* Add form fields */}
        </form>
      )}

      {currentStep === 'complete' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold">Setup Complete!</h2>
          <p className="mt-4">Your community is ready to go.</p>
          <button
            onClick={handleComplete}
            className="mt-6 px-4 py-2 bg-primary text-white rounded"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
