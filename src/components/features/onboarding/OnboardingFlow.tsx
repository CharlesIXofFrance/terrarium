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

interface FormData {
  name: string;
  description: string;
  memberNaming: {
    singular: string;
    plural: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: File | null;
    banner: File | null;
    favicon: File | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    faviconUrl: string | null;
    fontFamily: string;
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
    title: 'Member Naming',
    description: 'How would you like to call your community members?',
    icon: Users,
  },
  {
    title: 'Brand Your Community',
    description: 'Customize your community look and feel.',
    icon: Palette,
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
    memberNaming: {
      singular: 'member',
      plural: 'members',
    },
    branding: {
      primaryColor: '#4F46E5',
      secondaryColor: '#818CF8',
      logo: null,
      banner: null,
      favicon: null,
      logoUrl: null,
      bannerUrl: null,
      faviconUrl: null,
      fontFamily: 'Inter',
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

  useEffect(() => {
    const initializeFormData = async () => {
      if (!user) return;

      // Only check for existing community if user is a community owner
      if (user.role === 'community_owner') {
        const { data: existingCommunity } = await supabase
          .from('communities')
          .select('*, settings')
          .eq('owner_id', user.id)
          .single();

        if (existingCommunity) {
          // Load all community data
          const getSignedUrl = async (path: string | null) => {
            if (!path) return null;
            try {
              const {
                data: { signedUrl },
                error,
              } = await supabase.storage
                .from('community-assets')
                .createSignedUrl(
                  path.replace(/^.*community-assets\//, ''),
                  3600
                );

              if (error) {
                console.error('Error creating signed URL:', error);
                return null;
              }
              return signedUrl;
            } catch (error) {
              console.error('Error getting signed URL:', error);
              return null;
            }
          };

          const [logoUrl, bannerUrl, faviconUrl] = await Promise.all([
            getSignedUrl(existingCommunity.logo_url),
            getSignedUrl(existingCommunity.banner_url),
            getSignedUrl(existingCommunity.favicon_url),
          ]);

          setFormData({
            name: existingCommunity.name,
            description: existingCommunity.description || '',
            memberNaming: {
              singular: existingCommunity.member_singular_name || 'member',
              plural: existingCommunity.member_plural_name || 'members',
            },
            branding: {
              primaryColor:
                existingCommunity.settings?.branding?.primaryColor || '#4F46E5',
              secondaryColor:
                existingCommunity.settings?.branding?.secondaryColor ||
                '#818CF8',
              logo: null,
              banner: null,
              favicon: null,
              logoUrl,
              bannerUrl,
              faviconUrl,
              fontFamily:
                existingCommunity.settings?.branding?.fontFamily || 'Inter',
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
      }
    };

    initializeFormData();
  }, [user, navigate, currentStep]);

  const SUPPORTED_IMAGE_TYPES = {
    logo: ['image/png', 'image/jpeg', 'image/gif'],
    banner: ['image/png', 'image/jpeg', 'image/gif'],
    favicon: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
  };

  const uploadImage = async (
    file: File,
    path: string,
    oldPath: string | null = null
  ) => {
    if (!file) return null;

    const imageType = path.split('/')[1] as keyof typeof SUPPORTED_IMAGE_TYPES;

    // Validate file type
    if (!SUPPORTED_IMAGE_TYPES[imageType].includes(file.type)) {
      const supportedTypes = SUPPORTED_IMAGE_TYPES[imageType]
        .map((type) => type.replace('image/', '').toUpperCase())
        .join(', ');
      setError(
        `Unsupported file type. Please use ${supportedTypes} for ${imageType}`
      );
      return null;
    }

    try {
      // Delete old file if it exists
      if (oldPath) {
        await supabase.storage
          .from('community-assets')
          .remove([oldPath.replace(/^.*community-assets\//, '')]);
      }

      // Upload new file
      const { data, error } = await supabase.storage
        .from('community-assets')
        .upload(`${path}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;
      if (!data) throw new Error('Upload failed');

      // Get the URL for the uploaded file
      const {
        data: { signedUrl },
        error: urlError,
      } = await supabase.storage
        .from('community-assets')
        .createSignedUrl(data.path, 3600);

      if (urlError) throw urlError;

      // Update the community with the new image URL
      const { data: existingCommunity } = await supabase
        .from('communities')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!existingCommunity) throw new Error('Community not found');

      const imageField =
        path.split('/')[1] === 'logo'
          ? 'logo_url'
          : path.split('/')[1] === 'banner'
            ? 'banner_url'
            : 'favicon_url';

      const { error: updateError } = await supabase
        .from('communities')
        .update({ [imageField]: `community-assets/${data.path}` })
        .eq('id', existingCommunity.id);

      if (updateError) throw updateError;

      // Update user community state
      setUserCommunity({
        ...existingCommunity,
        [imageField]: `community-assets/${data.path}`,
      });

      return signedUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      if (error.message === 'invalid_mime_type') {
        const supportedTypes = SUPPORTED_IMAGE_TYPES[imageType].join(', ');
        setError(
          `Unsupported file type. Please use ${supportedTypes} for ${imageType}`
        );
      } else {
        setError(error.message || 'Error uploading image');
      }
      return null;
    }
  };

  const handleImageUpload = async (
    type: 'logo' | 'banner' | 'favicon',
    file: File
  ) => {
    setError(null); // Clear any previous errors
    const { data: existingCommunity } = await supabase
      .from('communities')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (!existingCommunity) {
      setError('Please save your community details first');
      return;
    }

    const path = `${existingCommunity.slug}/${type}`;
    const oldPath = existingCommunity[`${type}_url`] || null;

    const signedUrl = await uploadImage(file, path, oldPath);

    if (signedUrl) {
      updateFormData('branding', {
        ...formData.branding,
        [`${type}`]: file,
        [`${type}Url`]: signedUrl,
      });
    }
  };

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
          updates.member_singular_name = formData.memberNaming.singular;
          updates.member_plural_name = formData.memberNaming.plural;
        }

        if (currentStep === 3) {
          updates.settings = {
            ...existingCommunity.settings,
            branding: {
              ...existingCommunity.settings?.branding,
              primaryColor: formData.branding.primaryColor,
              secondaryColor: formData.branding.secondaryColor,
              fontFamily: formData.branding.fontFamily,
            },
          };

          // Handle image uploads
          const imageUpdates: any = {};

          if (formData.branding.logo) {
            const logoUrl = await uploadImage(
              formData.branding.logo,
              `${communitySlug}/logo`,
              existingCommunity.logo_url
            );
            if (logoUrl) imageUpdates.logo_url = logoUrl;
          }

          if (formData.branding.banner) {
            const bannerUrl = await uploadImage(
              formData.branding.banner,
              `${communitySlug}/banner`,
              existingCommunity.banner_url
            );
            if (bannerUrl) imageUpdates.banner_url = bannerUrl;
          }

          if (formData.branding.favicon) {
            const faviconUrl = await uploadImage(
              formData.branding.favicon,
              `${communitySlug}/favicon`,
              existingCommunity.favicon_url
            );
            if (faviconUrl) imageUpdates.favicon_url = faviconUrl;
          }

          Object.assign(updates, imageUpdates);
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
        bodyFont: formData.branding.fontFamily,
        headingFont: formData.branding.fontFamily,
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
                      value={formData.memberNaming.singular}
                      onChange={(e) =>
                        updateFormData('memberNaming', {
                          ...formData.memberNaming,
                          singular: e.target.value,
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
                      value={formData.memberNaming.plural}
                      onChange={(e) =>
                        updateFormData('memberNaming', {
                          ...formData.memberNaming,
                          plural: e.target.value,
                        })
                      }
                      placeholder="members"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {safeCurrentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Branding</h3>
                <div className="space-y-4">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Logo
                    </label>
                    <div className="mt-1 flex flex-col items-start space-y-2">
                      {formData.branding.logoUrl || formData.branding.logo ? (
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                handleImageUpload('logo', file);
                              }
                            };
                            input.click();
                          }}
                        >
                          <img
                            src={
                              formData.branding.logo
                                ? URL.createObjectURL(formData.branding.logo)
                                : formData.branding.logoUrl || ''
                            }
                            alt="Logo preview"
                            className="h-20 w-20 object-contain rounded border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                            <span className="text-white text-sm">Change</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg
                                className="w-8 h-8 mb-4 text-gray-500"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 16"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{' '}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG or GIF (MAX. 800x400px)
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload('logo', file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner Upload with similar pattern */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Banner
                    </label>
                    <div className="mt-1 flex flex-col items-start space-y-2">
                      {formData.branding.bannerUrl ||
                      formData.branding.banner ? (
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                handleImageUpload('banner', file);
                              }
                            };
                            input.click();
                          }}
                        >
                          <img
                            src={
                              formData.branding.banner
                                ? URL.createObjectURL(formData.branding.banner)
                                : formData.branding.bannerUrl || ''
                            }
                            alt="Banner preview"
                            className="w-full h-32 object-cover rounded border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                            <span className="text-white text-sm">Change</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg
                                className="w-8 h-8 mb-4 text-gray-500"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 16"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{' '}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG or GIF (MAX. 1920x480px)
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload('banner', file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Favicon Upload with similar pattern */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Favicon
                    </label>
                    <div className="mt-1 flex flex-col items-start space-y-2">
                      {formData.branding.faviconUrl ||
                      formData.branding.favicon ? (
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                handleImageUpload('favicon', file);
                              }
                            };
                            input.click();
                          }}
                        >
                          <img
                            src={
                              formData.branding.favicon
                                ? URL.createObjectURL(formData.branding.favicon)
                                : formData.branding.faviconUrl || ''
                            }
                            alt="Favicon preview"
                            className="h-10 w-10 object-contain rounded border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                            <span className="text-white text-sm">Change</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg
                                className="w-8 h-8 mb-4 text-gray-500"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 16"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{' '}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, ICO (MAX. 64x64px)
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload('favicon', file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
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
