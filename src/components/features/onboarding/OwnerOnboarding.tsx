import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, userCommunityAtom } from '@/lib/stores/auth';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { PagePreview } from '@/components/features/customization/PagePreview';
import { ColorPicker } from '@/components/ui/atoms/ColorPicker';
import { FileUpload } from '@/components/ui/atoms/FileUpload';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/layout/molecules/Tabs';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils/string';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { redirectToSubdomain } from '@/lib/utils/subdomain';
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Globe,
  Upload,
  Eye,
  Palette,
  Users,
} from 'lucide-react';
import { SUPPORTED_IMAGE_TYPES } from '@/lib/constants/images';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Types
interface FormData {
  name: string;
  description: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: File | null;
    logoUrl: string | null;
    banner: File | null;
    bannerUrl: string | null;
    favicon: File | null;
    faviconUrl: string | null;
    memberNaming: {
      singular: string;
      plural: string;
    };
    login: {
      title: string;
      subtitle: string;
      welcomeMessage: string;
      buttonText: string;
      backgroundColor: string;
      textColor: string;
    };
  };
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    discord: string;
    youtube: string;
  };
  jobBoardSettings: {
    requireApproval: boolean;
    categories: string[];
    allowRemote: boolean;
    customFields: any[];
  };
}

const steps = [
  {
    title: 'Welcome to Terrarium',
    description: "Let's set up your community in a few simple steps.",
    icon: Globe,
  },
  {
    title: 'Community Details',
    description: 'Tell us about your community.',
    icon: Upload,
  },
  {
    title: 'Brand Your Community',
    description: 'Customize your community look and feel.',
    icon: Palette,
  },
  {
    title: 'Member Naming',
    description: 'How would you like to call your community members?',
    icon: Users,
  },
  {
    title: 'Social Presence',
    description: 'Connect your social media accounts.',
    icon: Facebook,
  },
  {
    title: 'Almost Done!',
    description: 'Review your settings and launch your community.',
    icon: Globe,
  },
];

/**
 * AI CONTEXT - DON'T DELETE
 * AI Context: Community Owner Onboarding
 * User Types: COMMUNITY_OWNER
 *
 * Onboarding flow for new community owners to set up their community.
 * Guides owners through initial community configuration steps.
 *
 * Location: /src/components/features/onboarding/
 * - Separate from member onboarding
 * - Part of community creation flow
 *
 * Responsibilities:
 * - Community profile setup
 * - Branding configuration
 * - Job board settings
 * - Member field customization
 * - Integration setup (RecruitCRM)
 *
 * Design Constraints:
 * - Must follow step-by-step flow
 * - Must validate each section
 * - Must allow saving progress
 */

const communitySchema = z.object({
  name: z.string().min(1, 'Community name is required'),
  description: z.string(),
  branding: z.object({
    logo: z.string().optional(),
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
    }),
  }),
  jobBoard: z.object({
    enabled: z.boolean(),
    recruitcrmEnabled: z.boolean().optional(),
    recruitcrmApiKey: z.string().optional(),
  }),
  memberFields: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['text', 'select', 'multiselect', 'date']),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    })
  ),
});

type CommunitySetup = z.infer<typeof communitySchema>;

export function OwnerOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<
    'desktop' | 'mobile' | 'tablet'
  >('desktop');
  const [previewPage, setPreviewPage] = useState('member-hub');
  const defaultFormData = {
    name: '',
    description: '',
    branding: {
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',
      logo: null,
      logoUrl: '',
      banner: null,
      bannerUrl: '',
      favicon: null,
      faviconUrl: '',
      memberNaming: {
        singular: 'member',
        plural: 'members',
      },
      login: {
        title: '',
        subtitle: '',
        welcomeMessage: '',
        buttonText: '',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
      },
    },
    social: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      discord: '',
      youtube: '',
    },
    jobBoardSettings: {
      requireApproval: true,
      categories: ['Engineering', 'Design', 'Product'],
      allowRemote: true,
      customFields: [],
    },
  };
  const [formData, setFormData] = useState(defaultFormData);

  const [user, setUser] = useAtom(userAtom);
  const [userCommunity, setUserCommunity] = useAtom(userCommunityAtom);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(communitySchema),
    defaultValues: formData,
  });

  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>(
    {}
  );

  const { signedUrl: logoSignedUrl } = useSignedUrl(
    formData?.branding?.logoUrl
  );
  const { signedUrl: bannerSignedUrl } = useSignedUrl(
    formData?.branding?.bannerUrl
  );
  const { signedUrl: faviconSignedUrl } = useSignedUrl(
    formData?.branding?.faviconUrl
  );

  useEffect(() => {
    if (!userCommunity) return;
    console.log('Setting initial form data from community:', userCommunity);

    setFormData({
      name: userCommunity.name || '',
      description: userCommunity.description || '',
      branding: {
        primaryColor:
          userCommunity.settings?.branding?.primaryColor || '#000000',
        secondaryColor:
          userCommunity.settings?.branding?.secondaryColor || '#FFFFFF',
        logo: null,
        logoUrl: userCommunity.settings?.branding?.logoUrl || '',
        banner: null,
        bannerUrl: userCommunity.settings?.branding?.bannerUrl || '',
        favicon: null,
        faviconUrl: userCommunity.settings?.branding?.faviconUrl || '',
        memberNaming: {
          singular:
            userCommunity.settings?.branding?.memberNaming?.singular ||
            'member',
          plural:
            userCommunity.settings?.branding?.memberNaming?.plural || 'members',
        },
        login: {
          title: userCommunity.settings?.branding?.login?.title || '',
          subtitle: userCommunity.settings?.branding?.login?.subtitle || '',
          welcomeMessage:
            userCommunity.settings?.branding?.login?.welcomeMessage || '',
          buttonText: userCommunity.settings?.branding?.login?.buttonText || '',
          backgroundColor:
            userCommunity.settings?.branding?.login?.backgroundColor ||
            '#FFFFFF',
          textColor:
            userCommunity.settings?.branding?.login?.textColor || '#000000',
        },
      },
      social: {
        facebook: userCommunity.settings?.social?.facebook || '',
        twitter: userCommunity.settings?.social?.twitter || '',
        linkedin: userCommunity.settings?.social?.linkedin || '',
        instagram: userCommunity.settings?.social?.instagram || '',
        discord: userCommunity.settings?.social?.discord || '',
        youtube: userCommunity.settings?.social?.youtube || '',
      },
      jobBoardSettings: {
        requireApproval:
          userCommunity.settings?.jobBoardSettings?.requireApproval ?? true,
        categories: userCommunity.settings?.jobBoardSettings?.categories || [
          'Engineering',
          'Design',
          'Product',
        ],
        allowRemote:
          userCommunity.settings?.jobBoardSettings?.allowRemote ?? true,
        customFields:
          userCommunity.settings?.jobBoardSettings?.customFields || [],
      },
    });
  }, [userCommunity]);

  useEffect(() => {
    const initializeFormData = async () => {
      try {
        const { data: existingCommunity } = await supabase
          .from('communities')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (existingCommunity) {
          setFormData({
            name: existingCommunity.name || '',
            description: existingCommunity.description || '',
            branding: {
              primaryColor:
                existingCommunity.settings?.branding?.primaryColor || '#000000',
              secondaryColor:
                existingCommunity.settings?.branding?.secondaryColor ||
                '#FFFFFF',
              logo: null,
              logoUrl: existingCommunity.settings?.branding?.logoUrl || '',
              banner: null,
              bannerUrl: existingCommunity.settings?.branding?.bannerUrl || '',
              favicon: null,
              faviconUrl:
                existingCommunity.settings?.branding?.faviconUrl || '',
              memberNaming: {
                singular:
                  existingCommunity.settings?.branding?.memberNaming
                    ?.singular || 'member',
                plural:
                  existingCommunity.settings?.branding?.memberNaming?.plural ||
                  'members',
              },
              login: {
                title: existingCommunity.settings?.branding?.login?.title || '',
                subtitle:
                  existingCommunity.settings?.branding?.login?.subtitle || '',
                welcomeMessage:
                  existingCommunity.settings?.branding?.login?.welcomeMessage ||
                  '',
                buttonText:
                  existingCommunity.settings?.branding?.login?.buttonText || '',
                backgroundColor:
                  existingCommunity.settings?.branding?.login
                    ?.backgroundColor || '#FFFFFF',
                textColor:
                  existingCommunity.settings?.branding?.login?.textColor ||
                  '#000000',
              },
            },
            social: {
              facebook: existingCommunity.settings?.social?.facebook || '',
              twitter: existingCommunity.settings?.social?.twitter || '',
              linkedin: existingCommunity.settings?.social?.linkedin || '',
              instagram: existingCommunity.settings?.social?.instagram || '',
              discord: existingCommunity.settings?.social?.discord || '',
              youtube: existingCommunity.settings?.social?.youtube || '',
            },
            jobBoardSettings: {
              requireApproval:
                existingCommunity.settings?.jobBoardSettings?.requireApproval ??
                true,
              categories: existingCommunity.settings?.jobBoardSettings
                ?.categories || ['Engineering', 'Design', 'Product'],
              allowRemote:
                existingCommunity.settings?.jobBoardSettings?.allowRemote ??
                true,
              customFields:
                existingCommunity.settings?.jobBoardSettings?.customFields ||
                [],
            },
          });
          setUserCommunity(existingCommunity);
        }
      } catch (error) {
        console.error('Error initializing form data:', error);
      }
    };

    if (user) {
      initializeFormData();
    }
  }, [user]);

  useEffect(() => {
    const loadExistingData = async () => {
      const { data: existingCommunity } = await supabase
        .from('communities')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (existingCommunity) {
        setFormData({
          name: existingCommunity.name,
          description: existingCommunity.description,
          branding: existingCommunity.settings?.branding || {},
          social: existingCommunity.settings?.social || {},
          jobBoardSettings:
            existingCommunity.settings?.jobBoardSettings ||
            defaultFormData.jobBoardSettings,
        });
      }
    };

    if (currentStep > 1) {
      loadExistingData();
    }
  }, [currentStep, user.id]);

  const uploadImage = async (
    file: File,
    type: keyof typeof SUPPORTED_IMAGE_TYPES,
    existingCommunity: any
  ) => {
    try {
      if (!SUPPORTED_IMAGE_TYPES[type].includes(file.type)) {
        const supportedTypes = SUPPORTED_IMAGE_TYPES[type]
          .map((t) => t.replace('image/', '.'))
          .join(', ');
        setError(
          `Unsupported file type. Please use ${supportedTypes} for ${type}`
        );
        return;
      }

      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      setLocalPreviews((prev) => ({ ...prev, [type]: previewUrl }));

      // Upload file
      const fileName = `${existingCommunity.slug}/${type}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('community-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update database
      const fieldMap = {
        logo: 'logo_url',
        banner: 'banner_url',
        favicon: 'favicon_url',
      };

      const dbField = fieldMap[type];
      if (!dbField) return;

      const { error: updateError } = await supabase
        .from('communities')
        .update({ [dbField]: fileName })
        .eq('id', existingCommunity.id);

      if (updateError) throw updateError;

      // Update form data
      setFormData((prev) => ({
        ...prev,
        branding: {
          ...prev.branding,
          [`${type}Url`]: fileName,
        },
      }));

      // Refetch community data
      const { data: updatedCommunity, error: fetchError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', existingCommunity.id)
        .single();

      if (fetchError) throw fetchError;
      if (updatedCommunity) {
        setUserCommunity(updatedCommunity);
      }

      setError(null);
      return fileName;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Error uploading image');
      return null;
    }
  };

  const handleImageUpload = async (
    type: 'logo' | 'banner' | 'favicon',
    file: File | null
  ) => {
    if (!file) return;

    const { data: existingCommunity } = await supabase
      .from('communities')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (!existingCommunity) {
      setError('Community not found');
      return;
    }

    await uploadImage(file, type, existingCommunity);
  };

  useEffect(() => {
    return () => {
      Object.values(localPreviews).forEach(URL.revokeObjectURL);
    };
  }, [localPreviews]);

  const updateFormData = (field: string, value: any) => {
    console.log('Updating form data:', field, value);
    setFormData((prev) => {
      // Handle nested fields with dot notation (e.g., 'branding.memberNaming.singular')
      const fields = field.split('.');
      if (fields.length === 1) {
        return {
          ...prev,
          [field]: value,
        };
      }

      // Handle nested objects
      const current = { ...prev };
      let currentObj = current;
      for (let i = 0; i < fields.length - 1; i++) {
        currentObj[fields[i]] = { ...currentObj[fields[i]] };
        currentObj = currentObj[fields[i]];
      }
      currentObj[fields[fields.length - 1]] = value;
      return current;
    });
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Current form data:', formData);
      // Get existing community if we're past step 1
      const { data: existingCommunity } = await supabase
        .from('communities')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      console.log('Existing community:', existingCommunity);

      // Create community in step 2 when name is set
      if (currentStep === 1) {
        if (!formData.name) {
          setError('Community name is required');
          setIsSubmitting(false);
          return;
        }

        if (existingCommunity) {
          console.log('Updating existing community:', {
            name: formData.name,
            description: formData.description,
          });

          const { data: updated, error: updateError } = await supabase
            .from('communities')
            .update({
              name: formData.name,
              description: formData.description,
            })
            .eq('id', existingCommunity.id)
            .select()
            .single();

          if (updateError) throw updateError;
          console.log('Updated community:', updated);
          setUserCommunity(updated);
        } else {
          const communitySlug = slugify(formData.name);
          console.log('Creating new community:', {
            name: formData.name,
            slug: communitySlug,
            description: formData.description,
            owner_id: user.id,
          });

          const { data: created, error: createError } = await supabase
            .from('communities')
            .insert([
              {
                name: formData.name,
                slug: communitySlug,
                description: formData.description,
                owner_id: user.id,
              },
            ])
            .select()
            .single();

          if (createError) throw createError;
          console.log('Created community:', created);
          setUserCommunity(created);
        }
      }

      // Update existing community in subsequent steps
      if (existingCommunity && currentStep > 1) {
        const updates: any = {};

        if (currentStep === 2) {
          console.log('Step 2: Updating branding colors');
          updates.settings = {
            ...existingCommunity.settings,
            branding: {
              ...(existingCommunity.settings?.branding || {}),
              primaryColor: formData.branding.primaryColor,
              secondaryColor: formData.branding.secondaryColor,
            },
          };

          const { data: updated, error: updateError } = await supabase
            .from('communities')
            .update(updates)
            .eq('id', existingCommunity.id)
            .select()
            .single();

          if (updateError) {
            console.error('Failed to update branding colors:', updateError);
            throw updateError;
          }

          console.log('Successfully updated branding colors:', updated);
          setUserCommunity(updated);
        }

        if (currentStep === 3) {
          console.log('Step 3: Updating member naming');
          console.log('Current member naming:', formData.branding.memberNaming);
          console.log('Existing settings:', existingCommunity.settings);

          // Create a new settings object with the updated member naming
          const updatedSettings = {
            ...(existingCommunity.settings || {}),
            branding: {
              ...(existingCommunity.settings?.branding || {}),
              memberNaming: {
                singular: formData.branding.memberNaming.singular,
                plural: formData.branding.memberNaming.plural,
              },
            },
          };

          console.log('Sending update with settings:', updatedSettings);

          const { data: updated, error: updateError } = await supabase
            .from('communities')
            .update({
              settings: updatedSettings,
            })
            .eq('id', existingCommunity.id)
            .select()
            .single();

          if (updateError) {
            console.error('Failed to update member naming:', updateError);
            throw updateError;
          }

          console.log(
            'Successfully updated community with new settings:',
            updated
          );
          setUserCommunity(updated);

          // Verify the update
          const { data: verifyUpdate } = await supabase
            .from('communities')
            .select('*')
            .eq('id', existingCommunity.id)
            .single();

          console.log(
            'Verified update - current community state:',
            verifyUpdate
          );
        }

        if (currentStep === 4) {
          console.log('Step 4: Updating social links');
          updates.settings = {
            ...existingCommunity.settings,
            social: formData.social,
          };

          const { data: updated, error: updateError } = await supabase
            .from('communities')
            .update(updates)
            .eq('id', existingCommunity.id)
            .select()
            .single();

          if (updateError) throw updateError;
          console.log('Successfully updated social links:', updated);
          setUserCommunity(updated);
        }

        // If this is the last step, update profile completion and redirect
        if (currentStep === steps.length - 1) {
          try {
            // Get the latest community data
            const { data: community, error: communityError } = await supabase
              .from('communities')
              .select('*')
              .eq('owner_id', user.id)
              .single();

            if (communityError) throw communityError;
            if (!community) throw new Error('Community not found');

            // Update community to mark onboarding as completed
            const { error: updateError } = await supabase
              .from('communities')
              .update({
                onboarding_completed: true,
                settings: {
                  ...community.settings,
                  setup_completed_at: new Date().toISOString(),
                },
              })
              .eq('id', community.id);

            if (updateError) throw updateError;

            // Update user metadata to mark onboarding as completed
            const { error: metadataError } = await supabase.auth.updateUser({
              data: {
                onboarding_completed: true,
                community_id: community.id,
              },
            });

            if (metadataError) throw metadataError;

            // Update local user state
            setUser({
              ...user,
              user_metadata: {
                ...user.user_metadata,
                onboarding_completed: true,
                community_id: community.id,
              },
            });

            // Navigate to the community dashboard
            console.log('Redirecting to dashboard...');
            const isLocalhost = window.location.hostname.includes('localhost');
            const path = '/settings/dashboard';

            if (isLocalhost) {
              // For local development, use navigate to preserve the session
              navigate(`/?subdomain=${community.slug}${path}`);
            } else {
              // For production, use full URL redirect
              window.location.href = `${window.location.protocol}//${community.slug}.${import.meta.env.VITE_APP_DOMAIN}${path}`;
            }
            return;
          } catch (error) {
            console.error('Error in final step:', error);
            setError('Failed to complete onboarding. Please try again.');
            setIsSubmitting(false);
            return;
          }
        }

        // Move to next step if not the last step
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(currentStep + 1);
      }
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

  const renderPreview = () => {
    const previewStyles = {
      colors: {
        primary: formData.branding.primaryColor,
        secondary: formData.branding.secondaryColor,
        text: '#111827',
      },
      typography: {
        bodyFont: 'Inter',
        headingFont: 'Inter',
      },
    };

    const previewSizes = {
      desktop: 'w-full',
      tablet: 'w-[768px]',
      mobile: 'w-[375px]',
    };

    return (
      <div className="w-full mt-8">
        <div className="flex items-center justify-between mb-4">
          <Tabs value={previewPage} onValueChange={setPreviewPage}>
            <TabsList>
              <TabsTrigger value="member-hub">Member Hub</TabsTrigger>
              <TabsTrigger value="job-board">Job Board</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded-md transition-colors ${
                previewMode === 'mobile'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Mobile preview"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`p-2 rounded-md transition-colors ${
                previewMode === 'tablet'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Tablet preview"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded-md transition-colors ${
                previewMode === 'desktop'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Desktop preview"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative w-full overflow-auto rounded-lg border bg-white">
          <div className="min-h-[600px] w-full">
            <div
              className={`mx-auto transition-all duration-300 ${
                previewSizes[previewMode]
              }`}
            >
              <PagePreview
                pageId={previewPage}
                styles={previewStyles}
                mode={previewMode}
                testUser={{
                  name: user?.full_name || 'Test User',
                  role: 'platform_owner',
                  profileComplete: 1,
                  avatar: user?.avatar_url || '',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Ensure currentStep is within bounds
  const safeCurrentStep = Math.min(Math.max(currentStep, 0), steps.length - 1);
  const currentStepData = steps[safeCurrentStep];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Setup Forms */}
      <div className="w-1/2 py-12 px-8">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStepData.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(handleNext)} className="space-y-6">
            {/* Community details step */}
            {safeCurrentStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Community Name
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      console.log('Name changed:', e.target.value);
                      updateFormData('name', e.target.value);
                    }}
                    error={errors.name?.message}
                    placeholder="Enter your community name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => {
                      console.log('Description changed:', e.target.value);
                      updateFormData('description', e.target.value);
                    }}
                    error={errors.description?.message}
                    placeholder="Describe your community"
                  />
                </div>
              </>
            )}
            {safeCurrentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Branding</h3>
                <div className="space-y-4">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Logo
                    </label>
                    <FileUpload
                      accept={SUPPORTED_IMAGE_TYPES.logo.join(',')}
                      onChange={(file) => handleImageUpload('logo', file)}
                      helpText="PNG, JPG, GIF, SVG up to 10MB (SVG recommended for logo)"
                      previewUrl={
                        localPreviews.logo ||
                        (formData.branding.logo
                          ? URL.createObjectURL(formData.branding.logo)
                          : logoSignedUrl || undefined)
                      }
                      imageClassName="h-20 w-20 object-contain rounded border border-gray-200"
                    />
                  </div>

                  {/* Banner Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Banner
                    </label>
                    <FileUpload
                      accept={SUPPORTED_IMAGE_TYPES.banner.join(',')}
                      onChange={(file) => handleImageUpload('banner', file)}
                      helpText="PNG, JPG, GIF, SVG up to 10MB"
                      previewUrl={
                        localPreviews.banner ||
                        (formData.branding.banner
                          ? URL.createObjectURL(formData.branding.banner)
                          : bannerSignedUrl || undefined)
                      }
                      imageClassName="w-full h-32 object-cover rounded border border-gray-200"
                    />
                  </div>

                  {/* Favicon Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Favicon
                    </label>
                    <FileUpload
                      accept={SUPPORTED_IMAGE_TYPES.favicon.join(',')}
                      onChange={(file) => handleImageUpload('favicon', file)}
                      helpText="PNG, ICO, SVG up to 10MB (SVG or ICO recommended for favicon)"
                      previewUrl={
                        localPreviews.favicon ||
                        (formData.branding.favicon
                          ? URL.createObjectURL(formData.branding.favicon)
                          : faviconSignedUrl || undefined)
                      }
                      imageClassName="h-10 w-10 object-contain rounded border border-gray-200"
                    />
                  </div>

                  {/* Color inputs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Brand Colors
                    </label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="text-xs text-gray-500">Primary</label>
                        <ColorPicker
                          color={formData.branding.primaryColor}
                          onChange={(color) =>
                            setFormData((prev) => ({
                              ...prev,
                              branding: {
                                ...prev.branding,
                                primaryColor: color,
                              },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          Secondary
                        </label>
                        <ColorPicker
                          color={formData.branding.secondaryColor}
                          onChange={(color) =>
                            setFormData((prev) => ({
                              ...prev,
                              branding: {
                                ...prev.branding,
                                secondaryColor: color,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {safeCurrentStep === 3 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  How do you want to call your community members?
                </label>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600">
                      Singular (e.g., member, student, player)
                    </label>
                    <Input
                      type="text"
                      value={formData.branding.memberNaming.singular}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log('Member singular changing to:', value);
                        setFormData((prev) => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            memberNaming: {
                              ...prev.branding.memberNaming,
                              singular: value,
                            },
                          },
                        }));
                      }}
                      error={errors.branding?.memberNaming?.singular?.message}
                      placeholder="member"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">
                      Plural (e.g., members, students, players)
                    </label>
                    <Input
                      type="text"
                      value={formData.branding.memberNaming.plural}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log('Member plural changing to:', value);
                        setFormData((prev) => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            memberNaming: {
                              ...prev.branding.memberNaming,
                              plural: value,
                            },
                          },
                        }));
                      }}
                      error={errors.branding?.memberNaming?.plural?.message}
                      placeholder="members"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
            {safeCurrentStep === 4 && (
              <div className="space-y-4">
                {[
                  { name: 'facebook', label: 'Facebook', icon: Facebook },
                  { name: 'twitter', label: 'Twitter', icon: Twitter },
                  { name: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                  { name: 'instagram', label: 'Instagram', icon: Instagram },
                  { name: 'discord', label: 'Discord', icon: Globe },
                  { name: 'youtube', label: 'YouTube', icon: Globe },
                ].map(({ name, label, icon: Icon }) => (
                  <div key={name} className="flex items-center space-x-2">
                    <Icon className="w-6 h-6 text-gray-400" />
                    <Input
                      type="url"
                      value={formData.social?.[name] || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          social: {
                            ...prev.social,
                            [name]: e.target.value,
                          },
                        }))
                      }
                      placeholder={`${label} URL`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            )}
            {safeCurrentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Job Board
                  </h3>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.jobBoardSettings.requireApproval}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            jobBoardSettings: {
                              ...prev.jobBoardSettings,
                              requireApproval: e.target.checked,
                            },
                          }))
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Require approval for new job posts
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.jobBoardSettings.allowRemote}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            jobBoardSettings: {
                              ...prev.jobBoardSettings,
                              allowRemote: e.target.checked,
                            },
                          }))
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Allow remote job listings
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {safeCurrentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleNext}
              >
                {safeCurrentStep === steps.length - 1
                  ? 'Complete Setup'
                  : 'Next'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-1/2 bg-white border-l border-gray-200 p-8 overflow-y-auto">
        <div className="sticky top-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Live Preview
          </h3>
          <div className="h-[calc(100vh-6rem)]">{renderPreview()}</div>
        </div>
      </div>
    </div>
  );
}
