import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAtom } from 'jotai';
import { currentCommunityAtom } from '../../stores/community';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const brandingSchema = z.object({
  name: z.string().min(1, 'Community name is required'),
  description: z.string(),
  branding: z.object({
    primaryColor: z.string().regex(/^#/, 'Must be a valid hex color'),
    secondaryColor: z.string().regex(/^#/, 'Must be a valid hex color'),
    logo: z.string().url().optional(),
    favicon: z.string().url().optional(),
  }),
  customDomain: z.string().optional(),
});

type BrandingSettings = z.infer<typeof brandingSchema>;

export function BrandingSettings() {
  const [community] = useAtom(currentCommunityAtom);
  
  const { register, handleSubmit, formState: { errors } } = useForm<BrandingSettings>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      name: community?.name,
      description: community?.description,
      branding: community?.settings.branding,
    },
  });

  const onSubmit = async (data: BrandingSettings) => {
    console.log('Form data:', data);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Community Branding
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
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
            Assets
          </h2>
          
          <div className="space-y-4">
            <Input
              label="Logo URL"
              {...register('branding.logo')}
              error={errors.branding?.logo?.message}
            />

            <Input
              label="Favicon URL"
              {...register('branding.favicon')}
              error={errors.branding?.favicon?.message}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Domain Settings
          </h2>
          
          <Input
            label="Custom Domain"
            {...register('customDomain')}
            error={errors.customDomain?.message}
            placeholder="jobs.yourcommunity.com"
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter your custom domain to brand your job board URL.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}