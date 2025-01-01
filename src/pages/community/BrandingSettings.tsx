import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAtom } from 'jotai';
import { currentCommunityAtom } from '@/lib/stores/community';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { FileUpload } from '@/components/ui/atoms/FileUpload';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

const brandingSchema = z.object({
  name: z.string().min(1, 'Community name is required'),
  description: z.string(),
  branding: z.object({
    primaryColor: z.string().regex(/^#/, 'Must be a valid hex color'),
    secondaryColor: z.string().regex(/^#/, 'Must be a valid hex color'),
    logo: z.any().optional(),
    banner: z.any().optional(),
    favicon: z.any().optional(),
    logoUrl: z.string().nullable(),
    bannerUrl: z.string().nullable(),
    faviconUrl: z.string().nullable(),
    login: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        welcomeMessage: z.string().optional(),
        buttonText: z.string().optional(),
        backgroundColor: z
          .string()
          .regex(/^#/, 'Must be a valid hex color')
          .optional(),
        textColor: z
          .string()
          .regex(/^#/, 'Must be a valid hex color')
          .optional(),
      })
      .optional(),
    memberNaming: z
      .object({
        singular: z.string().min(1, 'Singular name is required'),
        plural: z.string().min(1, 'Plural name is required'),
      })
      .optional(),
  }),
  customDomain: z.string().optional(),
});

type BrandingSettings = z.infer<typeof brandingSchema>;

const SUPPORTED_IMAGE_TYPES = {
  logo: ['image/png', 'image/jpeg', 'image/gif'],
  banner: ['image/png', 'image/jpeg', 'image/gif'],
  favicon: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
};

export function BrandingSettings() {
  const [community, setCommunity] = useAtom(currentCommunityAtom);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        banner: null,
        favicon: null,
        logoUrl: null,
        bannerUrl: null,
        faviconUrl: null,
        login: {
          title: community?.settings?.branding?.login?.title || '',
          subtitle: community?.settings?.branding?.login?.subtitle || '',
          welcomeMessage:
            community?.settings?.branding?.login?.welcomeMessage || '',
          buttonText:
            community?.settings?.branding?.login?.buttonText || 'Sign In',
          backgroundColor:
            community?.settings?.branding?.login?.backgroundColor || '#FFFFFF',
          textColor:
            community?.settings?.branding?.login?.textColor || '#000000',
        },
        memberNaming: {
          singular:
            community?.settings?.branding?.memberNaming?.singular || 'Member',
          plural:
            community?.settings?.branding?.memberNaming?.plural || 'Members',
        },
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

      // Set login settings
      if (branding.login) {
        setValue('branding.login.title', branding.login.title || '');
        setValue('branding.login.subtitle', branding.login.subtitle || '');
        setValue(
          'branding.login.welcomeMessage',
          branding.login.welcomeMessage || ''
        );
        setValue(
          'branding.login.buttonText',
          branding.login.buttonText || 'Sign In'
        );
        setValue(
          'branding.login.backgroundColor',
          branding.login.backgroundColor || '#FFFFFF'
        );
        setValue(
          'branding.login.textColor',
          branding.login.textColor || '#000000'
        );
      }

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

    const loadExistingImages = async () => {
      const getSignedUrl = async (path: string | null) => {
        if (!path) return null;
        try {
          const {
            data: { signedUrl },
            error,
          } = await supabase.storage
            .from('community-assets')
            .createSignedUrl(path.replace(/^.*community-assets\//, ''), 3600);

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
        getSignedUrl(community.logo_url),
        getSignedUrl(community.banner_url),
        getSignedUrl(community.favicon_url),
      ]);

      setValue('branding.logoUrl', logoUrl);
      setValue('branding.bannerUrl', bannerUrl);
      setValue('branding.faviconUrl', faviconUrl);
    };

    loadExistingImages();
  }, [community, setValue]);

  const uploadImage = async (
    file: File,
    type: 'logo' | 'banner' | 'favicon'
  ) => {
    if (!file || !community) return null;

    // Validate file type
    if (!SUPPORTED_IMAGE_TYPES[type].includes(file.type)) {
      const supportedTypes = SUPPORTED_IMAGE_TYPES[type]
        .map((t) => t.replace('image/', '').toUpperCase())
        .join(', ');
      setError(
        `Unsupported file type. Please use ${supportedTypes} for ${type}`
      );
      return null;
    }

    try {
      const path = `${community.slug}/${type}`;
      const oldPath = community[`${type}_url`];

      // Delete old file if it exists
      if (oldPath) {
        await supabase.storage
          .from('community-assets')
          .remove([oldPath.replace(/^.*community-assets\//, '')]);
      }

      // Upload new file
      const { data, error: uploadError } = await supabase.storage
        .from('community-assets')
        .upload(`${path}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;
      if (!data) throw new Error('Upload failed');

      // Get signed URL for the uploaded file
      const {
        data: { signedUrl },
        error: urlError,
      } = await supabase.storage
        .from('community-assets')
        .createSignedUrl(data.path, 3600);

      if (urlError) throw urlError;

      // Update form values
      setValue(`branding.${type}`, file);
      setValue(`branding.${type}Url`, signedUrl);

      // Update the community with the new image URL
      const { error: updateError } = await supabase
        .from('communities')
        .update({
          [`${type}_url`]: `community-assets/${data.path}`,
        })
        .eq('id', community.id);

      if (updateError) throw updateError;

      return signedUrl;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Error uploading image');
      return null;
    }
  };

  const handleImageUpload = async (
    type: 'logo' | 'banner' | 'favicon',
    file: File | null
  ) => {
    if (!file) return;
    await uploadImage(file, type);
  };

  const onSubmit = async (data: BrandingSettings) => {
    if (!community) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from('communities')
        .update({
          name: data.name,
          description: data.description,
          settings: {
            ...community.settings,
            branding: {
              ...community.settings?.branding,
              primaryColor: data.branding.primaryColor,
              secondaryColor: data.branding.secondaryColor,
              login: data.branding.login,
              memberNaming: data.branding.memberNaming,
            },
          },
          custom_domain: data.customDomain,
        })
        .eq('id', community.id)
        .select();

      if (updateError) throw updateError;

      // Refresh community data
      const { data: updatedCommunity, error: fetchError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', community.id)
        .single();

      if (fetchError) throw fetchError;
      if (!updatedCommunity)
        throw new Error('Failed to fetch updated community');

      // Update the community atom with new data
      setCommunity(updatedCommunity);
      setSuccess('Your branding settings have been updated successfully.');
    } catch (err: any) {
      console.error('Error updating branding:', err);
      setError(err.message || 'Error updating branding settings');
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
              {brandingData.logoUrl && (
                <div className="mb-4">
                  <img
                    src={brandingData.logoUrl}
                    alt="Community logo"
                    className="h-16 w-16 object-contain"
                  />
                </div>
              )}
              <FileUpload
                accept={SUPPORTED_IMAGE_TYPES.logo.join(',')}
                onChange={(file) => handleImageUpload('logo', file)}
              />
              <p className="mt-1 text-sm text-gray-500">
                Recommended: PNG or JPEG, at least 512x512px
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner
              </label>
              {brandingData.bannerUrl && (
                <div className="mb-4">
                  <img
                    src={brandingData.bannerUrl}
                    alt="Community banner"
                    className="h-32 w-full object-cover rounded-lg"
                  />
                </div>
              )}
              <FileUpload
                accept={SUPPORTED_IMAGE_TYPES.banner.join(',')}
                onChange={(file) => handleImageUpload('banner', file)}
              />
              <p className="mt-1 text-sm text-gray-500">
                Recommended: PNG or JPEG, 1920x480px
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              {brandingData.faviconUrl && (
                <div className="mb-4">
                  <img
                    src={brandingData.faviconUrl}
                    alt="Community favicon"
                    className="h-8 w-8 object-contain"
                  />
                </div>
              )}
              <FileUpload
                accept={SUPPORTED_IMAGE_TYPES.favicon.join(',')}
                onChange={(file) => handleImageUpload('favicon', file)}
              />
              <p className="mt-1 text-sm text-gray-500">
                Recommended: ICO or PNG, 32x32px
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Login Page Customization
          </h2>

          <div className="space-y-4">
            <Input
              label="Login Page Title"
              {...register('branding.login.title')}
              error={errors.branding?.login?.title?.message}
              placeholder="Welcome to Our Community"
            />

            <Input
              label="Login Page Subtitle"
              {...register('branding.login.subtitle')}
              error={errors.branding?.login?.subtitle?.message}
              placeholder="Join our thriving community of professionals"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Message
              </label>
              <textarea
                {...register('branding.login.welcomeMessage')}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter a welcoming message for your login page"
              />
              {errors.branding?.login?.welcomeMessage?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.branding?.login?.welcomeMessage?.message}
                </p>
              )}
            </div>

            <Input
              label="Sign In Button Text"
              {...register('branding.login.buttonText')}
              error={errors.branding?.login?.buttonText?.message}
              placeholder="Sign In"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    {...register('branding.login.backgroundColor')}
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <Input
                    {...register('branding.login.backgroundColor')}
                    error={errors.branding?.login?.backgroundColor?.message}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    {...register('branding.login.textColor')}
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <Input
                    {...register('branding.login.textColor')}
                    error={errors.branding?.login?.textColor?.message}
                  />
                </div>
              </div>
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
