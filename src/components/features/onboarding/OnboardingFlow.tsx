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

interface FormData {
  name: string;
  description: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: File | null;
    banner: File | null;
    favicon: File | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    faviconUrl: string | null;
    login: {
      title: string;
      subtitle: string;
      welcomeMessage: string;
      buttonText: string;
      backgroundColor: string;
      textColor: string;
    };
    memberNaming: {
      singular: string;
      plural: string;
    };
  };
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    website: string;
  };
  jobBoardSettings: {
    requireApproval: boolean;
    categories: string[];
    allowRemote: boolean;
    customFields: any[];
  };
  eventSettings: {
    enableRegistration: boolean;
    enableVirtual: boolean;
    requireApproval: boolean;
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
    title: 'Feature Setup',
    description: 'Configure your community features.',
    icon: Eye,
  },
  {
    title: 'Almost Done!',
    description: 'Review your settings and launch your community.',
    icon: Globe,
  },
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<
    'desktop' | 'mobile' | 'tablet'
  >('desktop');
  const [previewPage, setPreviewPage] = useState('member-hub');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    branding: {
      primaryColor: '#4F46E5',
      secondaryColor: '#818CF8',
      logo: null,
      banner: null,
      favicon: null,
      logoUrl: null,
      bannerUrl: null,
      faviconUrl: null,
      login: {
        title: '',
        subtitle: '',
        welcomeMessage: '',
        buttonText: 'Sign In',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
      },
      memberNaming: {
        singular: 'Member',
        plural: 'Members',
      },
    },
    social: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      website: '',
    },
    jobBoardSettings: {
      requireApproval: true,
      categories: ['Engineering', 'Design', 'Product'],
      allowRemote: true,
      customFields: [],
    },
    eventSettings: {
      enableRegistration: true,
      enableVirtual: true,
      requireApproval: false,
    },
  });

  const [user, setUser] = useAtom(userAtom);
  const [, setUserCommunity] = useAtom(userCommunityAtom);
  const navigate = useNavigate();

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
    const initializeFormData = async () => {
      try {
        const { data: existingCommunity } = await supabase
          .from('communities')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (existingCommunity) {
          // Initialize form data with paths from the database
          setFormData({
            name: existingCommunity.name,
            description: existingCommunity.description || '',
            branding: {
              primaryColor:
                existingCommunity.settings?.branding?.primaryColor || '#4F46E5',
              secondaryColor:
                existingCommunity.settings?.branding?.secondaryColor ||
                '#818CF8',
              logo: null,
              banner: null,
              favicon: null,
              logoUrl: existingCommunity.logo_url,
              bannerUrl: existingCommunity.banner_url,
              faviconUrl: existingCommunity.favicon_url,
              login: {
                title: existingCommunity.settings?.login?.title || '',
                subtitle: existingCommunity.settings?.login?.subtitle || '',
                welcomeMessage:
                  existingCommunity.settings?.login?.welcomeMessage || '',
                buttonText: existingCommunity.settings?.login?.buttonText || '',
                backgroundColor:
                  existingCommunity.settings?.login?.backgroundColor ||
                  '#FFFFFF',
                textColor:
                  existingCommunity.settings?.login?.textColor || '#000000',
              },
              memberNaming: {
                singular:
                  existingCommunity.settings?.memberNaming?.singular ||
                  'Member',
                plural:
                  existingCommunity.settings?.memberNaming?.plural || 'Members',
              },
            },
            social: {
              facebook: existingCommunity.settings?.social?.facebook || '',
              twitter: existingCommunity.settings?.social?.twitter || '',
              linkedin: existingCommunity.settings?.social?.linkedin || '',
              instagram: existingCommunity.settings?.social?.instagram || '',
              website: existingCommunity.settings?.social?.website || '',
            },
            jobBoardSettings: {
              requireApproval:
                existingCommunity.settings?.jobBoard?.requireApproval ?? true,
              categories: existingCommunity.settings?.jobBoard?.categories || [
                'Engineering',
                'Design',
                'Product',
              ],
              allowRemote:
                existingCommunity.settings?.jobBoard?.allowRemote ?? true,
              customFields:
                existingCommunity.settings?.jobBoard?.customFields || [],
            },
            eventSettings: {
              enableRegistration:
                existingCommunity.settings?.events?.enableRegistration ?? true,
              enableVirtual:
                existingCommunity.settings?.events?.enableVirtual ?? true,
              requireApproval:
                existingCommunity.settings?.events?.requireApproval ?? false,
            },
          });
          setUserCommunity(existingCommunity);

          // If not in onboarding, redirect to dashboard
          if (!window.location.pathname.includes('/onboarding')) {
            navigate(`/c/${existingCommunity.slug}/dashboard`);
          }
        }
      } catch (error) {
        console.error('Error initializing form data:', error);
      }
    };

    initializeFormData();
  }, [user, navigate, currentStep]);

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

  const handleNext = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Get existing community if we're past step 1
      const { data: existingCommunity } = await supabase
        .from('communities')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      // Create community in step 2 when name is set
      if (currentStep === 1 && !existingCommunity) {
        if (!formData.name) {
          setError('Community name is required');
          setIsSubmitting(false);
          return;
        }

        const communitySlug = slugify(formData.name);
        const newCommunity = {
          name: formData.name,
          slug: communitySlug,
          description: formData.description,
          owner_id: user.id,
        };

        const { data: community, error: createError } = await supabase
          .from('communities')
          .insert([newCommunity])
          .select()
          .single();

        if (createError) throw createError;
        if (!community) throw new Error('Failed to create community');

        setUserCommunity(community);
      }

      // Update existing community in subsequent steps
      if (existingCommunity && currentStep > 1) {
        const updates: any = {};
        const communitySlug = existingCommunity.slug;

        if (currentStep === 2) {
          updates.settings = {
            ...existingCommunity.settings,
            branding: {
              ...existingCommunity.settings?.branding,
              primaryColor: formData.branding.primaryColor,
              secondaryColor: formData.branding.secondaryColor,
              login: formData.branding.login,
              memberNaming: formData.branding.memberNaming,
            },
          };

          // Handle image uploads
          const imageUpdates: any = {};

          if (formData.branding.logo) {
            const logoUrl = await uploadImage(
              formData.branding.logo,
              'logo',
              existingCommunity
            );
            if (logoUrl) imageUpdates.logo_url = logoUrl;
          }

          if (formData.branding.banner) {
            const bannerUrl = await uploadImage(
              formData.branding.banner,
              'banner',
              existingCommunity
            );
            if (bannerUrl) imageUpdates.banner_url = bannerUrl;
          }

          if (formData.branding.favicon) {
            const faviconUrl = await uploadImage(
              formData.branding.favicon,
              'favicon',
              existingCommunity
            );
            if (faviconUrl) imageUpdates.favicon_url = faviconUrl;
          }

          Object.assign(updates, imageUpdates);
        }

        if (currentStep === 3) {
          updates.settings = {
            ...existingCommunity.settings,
            branding: {
              ...existingCommunity.settings?.branding,
              memberNaming: formData.branding.memberNaming,
            },
          };
        }

        if (currentStep === 4) {
          updates.settings = {
            ...existingCommunity.settings,
            social: formData.social,
          };
        }

        if (currentStep === 5) {
          updates.settings = {
            ...existingCommunity.settings,
            jobBoard: formData.jobBoardSettings,
            events: formData.eventSettings,
          };
        }

        const { error: updateError } = await supabase
          .from('communities')
          .update(updates)
          .eq('id', existingCommunity.id);

        if (updateError) throw updateError;
      }

      // If this is the last step, update profile completion and redirect
      if (currentStep === steps.length - 1) {
        try {
          // Update profile completion status
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ profile_complete: true })
            .eq('id', user.id);

          if (profileUpdateError) throw profileUpdateError;

          // Update local user state
          setUser({
            ...user,
            profile_complete: true,
          });

          // Get the latest community data
          const { data: community } = await supabase
            .from('communities')
            .select('*')
            .eq('owner_id', user.id)
            .single();

          if (!community) throw new Error('Community not found');

          // Navigate to the community dashboard
          navigate(`/c/${community.slug}/dashboard`);
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
              <TabsTrigger value="events">Events</TabsTrigger>
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

          <div className="space-y-6">
            {safeCurrentStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Community Name
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Input
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
                            updateFormData('branding', {
                              ...formData.branding,
                              primaryColor: color,
                            })
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
                            updateFormData('branding', {
                              ...formData.branding,
                              secondaryColor: color,
                            })
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
                      onChange={(e) =>
                        updateFormData('branding', {
                          ...formData.branding,
                          memberNaming: {
                            ...formData.branding.memberNaming,
                            singular: e.target.value,
                          },
                        })
                      }
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
                      onChange={(e) =>
                        updateFormData('branding', {
                          ...formData.branding,
                          memberNaming: {
                            ...formData.branding.memberNaming,
                            plural: e.target.value,
                          },
                        })
                      }
                      placeholder="members"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {safeCurrentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Social Media Links
                  </label>
                  <div className="space-y-3 mt-2">
                    {Object.entries({
                      facebook: { icon: Facebook, label: 'Facebook' },
                      twitter: { icon: Twitter, label: 'Twitter' },
                      linkedin: { icon: Linkedin, label: 'LinkedIn' },
                      instagram: { icon: Instagram, label: 'Instagram' },
                      website: { icon: Globe, label: 'Website' },
                    }).map(([key, { icon: Icon, label }]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <Input
                          type="url"
                          placeholder={label}
                          value={
                            formData.social[key as keyof typeof formData.social]
                          }
                          onChange={(e) =>
                            updateFormData('social', {
                              ...formData.social,
                              [key]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
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
                          updateFormData('jobBoardSettings', {
                            ...formData.jobBoardSettings,
                            requireApproval: e.target.checked,
                          })
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
                          updateFormData('jobBoardSettings', {
                            ...formData.jobBoardSettings,
                            allowRemote: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Allow remote job listings
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Events</h3>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.eventSettings.enableRegistration}
                        onChange={(e) =>
                          updateFormData('eventSettings', {
                            ...formData.eventSettings,
                            enableRegistration: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Enable event registration
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.eventSettings.enableVirtual}
                        onChange={(e) =>
                          updateFormData('eventSettings', {
                            ...formData.eventSettings,
                            enableVirtual: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Enable virtual events
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {safeCurrentStep > 0 && (
                <Button onClick={handleBack} disabled={isSubmitting}>
                  Back
                </Button>
              )}
              <Button onClick={handleNext} disabled={isSubmitting}>
                {safeCurrentStep === steps.length - 1
                  ? 'Launch Community'
                  : 'Next'}
              </Button>
            </div>
          </div>
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
