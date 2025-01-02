import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAtom } from 'jotai';
import { currentCommunityAtom } from '@/lib/stores/community';
import { userAtom } from '@/lib/stores/auth';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { FileUpload } from '@/components/ui/atoms/FileUpload';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Label } from '@/components/ui/atoms/Label';
import { ColorPicker } from '@/components/ui/atoms/ColorPicker';
import { useToast } from '@/lib/hooks/useToast';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { SUPPORTED_IMAGE_TYPES } from '@/lib/constants/images';

const brandingSchema = z.object({
  name: z.string().min(1, 'Community name is required'),
  description: z.string(),
  branding: z.object({
    primaryColor: z.string().regex(/^#/, 'Must be a valid hex color'),
    secondaryColor: z.string().regex(/^#/, 'Must be a valid hex color'),
    logo: z.any().optional(),
    logoUrl: z.string().nullable(),
    banner: z.any().optional(),
    bannerUrl: z.string().nullable(),
    favicon: z.any().optional(),
    faviconUrl: z.string().nullable(),
    memberNaming: z
      .object({
        singular: z.string().min(1, 'Singular name is required'),
        plural: z.string().min(1, 'Plural name is required'),
      })
      .optional(),
  }),
  login: z.object({
    title: z.string(),
    subtitle: z.string(),
    welcomeMessage: z.string().optional(),
    buttonText: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
    sideImage: z.any().optional(),
    sideImageUrl: z.string().optional(),
  }),
  customDomain: z.string().optional(),
});

type BrandingSettings = z.infer<typeof brandingSchema>;

export function BrandingSettings() {
  const [community, setCommunity] = useAtom(currentCommunityAtom);
  const [user] = useAtom(userAtom);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>(
    {}
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BrandingSettings>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      name: community?.name || '',
      description: community?.description || '',
      branding: {
        primaryColor: community?.settings?.branding?.primaryColor || '#4F46E5',
        secondaryColor:
          community?.settings?.branding?.secondaryColor || '#818CF8',
        logo: null,
        logoUrl: null,
        banner: null,
        bannerUrl: null,
        favicon: null,
        faviconUrl: null,
        memberNaming: {
          singular:
            community?.settings?.branding?.memberNaming?.singular || 'Member',
          plural:
            community?.settings?.branding?.memberNaming?.plural || 'Members',
        },
      },
      login: {
        title: community?.settings?.login?.title || '',
        subtitle: community?.settings?.login?.subtitle || '',
        welcomeMessage: community?.settings?.login?.welcomeMessage || '',
        buttonText: community?.settings?.login?.buttonText || 'Sign In',
        backgroundColor:
          community?.settings?.login?.backgroundColor || '#FFFFFF',
        textColor: community?.settings?.login?.textColor || '#000000',
        sideImage: null,
        sideImageUrl: community?.settings?.login?.sideImageUrl || '',
      },
      customDomain: community?.custom_domain || '',
    },
  });

  // Load existing images and settings
  useEffect(() => {
    if (!community) return;

    setValue('name', community.name);
    setValue('description', community.description || '');
    setValue('customDomain', community.custom_domain || '');

    // Set branding values
    if (community.settings?.branding) {
      const { branding } = community.settings;
      setValue('branding.primaryColor', branding.primaryColor || '#4F46E5');
      setValue('branding.secondaryColor', branding.secondaryColor || '#818CF8');

      // Set member naming
      if (branding.memberNaming) {
        setValue(
          'branding.memberNaming.singular',
          branding.memberNaming.singular || 'Member'
        );
        setValue(
          'branding.memberNaming.plural',
          branding.memberNaming.plural || 'Members'
        );
      }
    }

    // Set image paths directly from community
    setValue('branding.logoUrl', community.logo_url);
    setValue('branding.bannerUrl', community.banner_url);
    setValue('branding.faviconUrl', community.favicon_url);

    // Fetch and set login settings
    async function fetchLoginSettings() {
      const { data: loginSettings, error } = await supabase
        .from('community_login_settings')
        .select('*')
        .eq('community_id', community.id)
        .single();

      if (error) {
        console.error('Error fetching login settings:', error);
        return;
      }

      if (loginSettings) {
        setValue('login.title', loginSettings.title || '');
        setValue('login.subtitle', loginSettings.subtitle || '');
        setValue('login.welcomeMessage', loginSettings.welcome_message || '');
        setValue('login.buttonText', loginSettings.button_text || 'Sign In');
        setValue(
          'login.backgroundColor',
          loginSettings.background_color || '#FFFFFF'
        );
        setValue('login.textColor', loginSettings.text_color || '#000000');
        setValue('login.sideImageUrl', loginSettings.side_image_url || '');
      }
    }

    fetchLoginSettings();
  }, [community, setValue]);

  // Use the useSignedUrl hook for each image
  const { signedUrl: logoSignedUrl } = useSignedUrl(watch('branding.logoUrl'));
  const { signedUrl: bannerSignedUrl } = useSignedUrl(
    watch('branding.bannerUrl')
  );
  const { signedUrl: faviconSignedUrl } = useSignedUrl(
    watch('branding.faviconUrl')
  );
  const { signedUrl: sideImageSignedUrl } = useSignedUrl(
    watch('login.sideImageUrl')
  );

  const handleImageUpload = async (
    type: keyof typeof SUPPORTED_IMAGE_TYPES,
    file: File | null
  ) => {
    if (!file || !community) return;

    try {
      if (!SUPPORTED_IMAGE_TYPES[type].includes(file.type)) {
        const supportedTypes = SUPPORTED_IMAGE_TYPES[type]
          .map((t) => t.replace('image/', '.'))
          .join(', ');
        toast({
          title: 'Invalid file type',
          description: `Please upload a ${supportedTypes} file.`,
          type: 'error',
        });
        return;
      }

      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      setLocalPreviews((prev) => ({ ...prev, [type]: previewUrl }));

      // Upload file
      const fileName = `${community.slug}/${type}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('community-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update database based on image type
      if (type === 'sideImage') {
        const { error: updateError } = await supabase
          .from('community_login_settings')
          .update({ side_image_url: fileName })
          .eq('community_id', community.id);

        if (updateError) throw updateError;
        setValue('login.sideImageUrl', fileName);
      } else {
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
          .eq('id', community.id);

        if (updateError) throw updateError;
        setValue(`branding.${type}Url`, fileName);
      }

      // Refetch community data to update the UI
      const { data: updatedCommunity, error: fetchError } = await supabase
        .from('communities')
        .select('*, community_login_settings(*)')
        .eq('id', community.id)
        .single();

      if (fetchError) throw fetchError;
      if (updatedCommunity) {
        setCommunity(updatedCommunity);
      }

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        type: 'error',
      });
    }
  };

  useEffect(() => {
    return () => {
      Object.values(localPreviews).forEach(URL.revokeObjectURL);
    };
  }, [localPreviews]);

  const onSubmit = async (data: BrandingSettings) => {
    if (!community || !user) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Update community branding settings
      const { error: brandingError } = await supabase
        .from('communities')
        .update({
          name: data.name,
          description: data.description,
          settings: {
            ...community.settings,
            branding: {
              ...community.settings?.branding,
              ...data.branding,
            },
          },
        })
        .eq('id', community.id)
        .eq('owner_id', user.id);

      if (brandingError) throw brandingError;

      // Update login settings
      const { error: loginError } = await supabase
        .from('community_login_settings')
        .upsert(
          {
            community_id: community.id,
            title: data.login.title,
            subtitle: data.login.subtitle,
            welcome_message: data.login.welcomeMessage,
            button_text: data.login.buttonText,
            background_color: data.login.backgroundColor,
            text_color: data.login.textColor,
            side_image_url: data.login.sideImageUrl,
          },
          {
            onConflict: 'community_id',
            ignoreDuplicates: false,
          }
        );

      if (loginError) throw loginError;

      // Only include custom_domain if it's not empty
      if (data.customDomain?.trim()) {
        const { error: customDomainError } = await supabase
          .from('communities')
          .update({
            custom_domain: data.customDomain.trim(),
          })
          .eq('id', community.id)
          .eq('owner_id', user.id);

        if (customDomainError) throw customDomainError;
      }

      // Refresh community data
      const { data: updatedCommunity, error: fetchError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', community.id)
        .eq('owner_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!updatedCommunity)
        throw new Error('Failed to fetch updated community');

      // Update the community atom with new data
      setCommunity(updatedCommunity);
      toast({
        title: 'Success',
        description: 'Your branding settings have been updated successfully.',
      });
    } catch (err: any) {
      console.error('Error updating branding:', err);
      toast({
        title: 'Error',
        description: err.message || 'Error updating branding settings',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const brandingData = watch('branding');

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Community Branding</h1>
        <Link
          to="/settings/onboarding"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Onboarding Flow
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <Input
              label="Community Name"
              {...register('name')}
              error={errors.name?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.description?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Brand Colors
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  {...register('branding.primaryColor')}
                  className="h-10 w-10 rounded border border-gray-300"
                />
                <Input
                  {...register('branding.primaryColor')}
                  error={errors.branding?.primaryColor?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  {...register('branding.secondaryColor')}
                  className="h-10 w-10 rounded border border-gray-300"
                />
                <Input
                  {...register('branding.secondaryColor')}
                  error={errors.branding?.secondaryColor?.message}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Brand Assets
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <FileUpload
                accept={SUPPORTED_IMAGE_TYPES.logo.join(',')}
                onChange={(file) => handleImageUpload('logo', file)}
                helpText="PNG, JPG, GIF, SVG up to 10MB (SVG recommended for logo)"
                previewUrl={
                  localPreviews.logo ||
                  (watch('branding.logoUrl') ? logoSignedUrl : undefined)
                }
                imageClassName="h-20 w-20 object-contain rounded border border-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner
              </label>
              <FileUpload
                accept={SUPPORTED_IMAGE_TYPES.banner.join(',')}
                onChange={(file) => handleImageUpload('banner', file)}
                helpText="PNG, JPG, GIF, SVG up to 10MB"
                previewUrl={
                  localPreviews.banner ||
                  (watch('branding.bannerUrl') ? bannerSignedUrl : undefined)
                }
                imageClassName="w-full h-32 object-cover rounded border border-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              <FileUpload
                accept={SUPPORTED_IMAGE_TYPES.favicon.join(',')}
                onChange={(file) => handleImageUpload('favicon', file)}
                helpText="PNG, ICO, SVG up to 10MB (SVG or ICO recommended for favicon)"
                previewUrl={
                  localPreviews.favicon ||
                  (watch('branding.faviconUrl') ? faviconSignedUrl : undefined)
                }
                imageClassName="h-10 w-10 object-contain rounded border border-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Login Page Customization
          </h2>

          <div className="space-y-6">
            <Input
              label="Title"
              {...register('login.title')}
              error={errors.login?.title?.message}
              placeholder="Welcome Back"
            />

            <Input
              label="Subtitle"
              {...register('login.subtitle')}
              error={errors.login?.subtitle?.message}
              placeholder="Sign in to your account"
            />

            <Input
              label="Welcome Message (Optional)"
              {...register('login.welcomeMessage')}
              error={errors.login?.welcomeMessage?.message}
              placeholder="Welcome to our community!"
            />

            <Input
              label="Button Text"
              {...register('login.buttonText')}
              error={errors.login?.buttonText?.message}
              placeholder="Sign In"
            />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="login.backgroundColor">Background Color</Label>
                <ColorPicker
                  color={watch('login.backgroundColor')}
                  onChange={(color) => setValue('login.backgroundColor', color)}
                />
              </div>
              <div>
                <Label htmlFor="login.textColor">Text Color</Label>
                <ColorPicker
                  color={watch('login.textColor')}
                  onChange={(color) => setValue('login.textColor', color)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="login.sideImage">Side Image</Label>
              <FileUpload
                accept={SUPPORTED_IMAGE_TYPES.sideImage.join(',')}
                onChange={(file) => handleImageUpload('sideImage', file)}
                helpText="PNG, JPG, GIF, SVG up to 10MB"
                previewUrl={
                  localPreviews.sideImage ||
                  (watch('login.sideImageUrl') ? sideImageSignedUrl : undefined)
                }
                imageClassName="w-full h-32 object-cover rounded border border-gray-200"
              />
              <p className="mt-1 text-sm text-gray-500">
                Recommended size: 800x600px. Will be displayed next to the login
                form.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Member Naming
          </h2>

          <div className="space-y-4">
            <Input
              label="Singular Name"
              {...register('branding.memberNaming.singular')}
              error={errors.branding?.memberNaming?.singular?.message}
              placeholder="Member"
              helperText="How do you refer to a single member? (e.g., Member, Professional, Expert)"
            />

            <Input
              label="Plural Name"
              {...register('branding.memberNaming.plural')}
              error={errors.branding?.memberNaming?.plural?.message}
              placeholder="Members"
              helperText="How do you refer to multiple members? (e.g., Members, Professionals, Experts)"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Custom Domain
          </h2>

          <Input
            label="Custom Domain"
            {...register('customDomain')}
            error={errors.customDomain?.message}
            placeholder="e.g., community.yourdomain.com"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter your custom domain if you want to use it instead of the
            default subdomain
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
