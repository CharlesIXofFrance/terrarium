import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../ui/atoms/Input';
import { Button } from '../../ui/atoms/Button';
import { useAtom } from 'jotai';
import { currentCommunityAtom } from '../../../lib/stores/community';
import type { Job } from '../../../lib/types/jobs';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company name is required'),
  companyLogo: z.string().optional(),
  coverImage: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Internship']),
  salary: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
      currency: z.string().default('USD'),
    })
    .optional(),
  experience: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string()),
  roleBenefits: z.array(z.string()),
  status: z.enum(['draft', 'active', 'closed']).default('draft'),
  isEarlyApplicant: z.boolean().default(false),
  sisterScore: z.number().min(0).max(100).optional(),
  benefits: z
    .array(
      z.object({
        icon: z.string(),
        label: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),
  companyInsights: z
    .object({
      founded: z.number(),
      size: z.string(),
      funding: z.string(),
      industry: z.string(),
      genderDiversity: z.object({
        male: z.number(),
        female: z.number(),
      }),
      description: z.string(),
      teamPhoto: z
        .object({
          url: z.string(),
          alt: z.string().optional(),
        })
        .optional(),
      locations: z.array(
        z.object({
          name: z.string(),
          coordinates: z.tuple([z.number(), z.number()]),
        })
      ),
      employeeGrowth: z.object({
        percentage: z.number(),
        period: z.string(),
      }),
      awards: z.array(
        z.object({
          title: z.string(),
        })
      ),
    })
    .optional(),
  workingPhotos: z
    .array(
      z.object({
        url: z.string(),
        caption: z.string(),
        category: z.enum(['collaboration', 'culture', 'office']).optional(),
        size: z.enum(['large', 'medium', 'small']).optional(),
      })
    )
    .optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

export function JobPostingForm() {
  const [community] = useAtom(currentCommunityAtom);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });

  const onSubmit = async (data: JobFormData) => {
    const job: Job = {
      ...data,
      id: '', // Will be set by the backend
      communityId: community?.id || '',
      postedAt: new Date().toISOString(),
    };
    console.log('Form data:', job);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Basic Information
        </h2>

        <div className="space-y-4">
          <Input
            label="Job Title"
            {...register('title')}
            error={errors.title?.message}
          />

          <Input
            label="Company"
            {...register('company')}
            error={errors.company?.message}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type
              </label>
              <select
                {...register('type')}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="Full-Time">Full-time</option>
                <option value="Part-Time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <Input
              label="Location"
              {...register('location')}
              error={errors.location?.message}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('isEarlyApplicant')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Early Applicant
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Salary Range</h2>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Minimum"
            type="number"
            {...register('salary.min', { valueAsNumber: true })}
            error={errors.salary?.min?.message}
          />
          <Input
            label="Maximum"
            type="number"
            {...register('salary.max', { valueAsNumber: true })}
            error={errors.salary?.max?.message}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Company Insights
        </h2>

        <div className="space-y-4">
          <Input
            label="Founded"
            type="number"
            {...register('companyInsights.founded', { valueAsNumber: true })}
            error={errors.companyInsights?.founded?.message}
          />

          <Input
            label="Size"
            {...register('companyInsights.size')}
            error={errors.companyInsights?.size?.message}
          />

          <Input
            label="Funding"
            {...register('companyInsights.funding')}
            error={errors.companyInsights?.funding?.message}
          />

          <Input
            label="Industry"
            {...register('companyInsights.industry')}
            error={errors.companyInsights?.industry?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('companyInsights.description')}
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.companyInsights?.description?.message && (
              <p className="mt-1 text-sm text-red-600">
                {errors.companyInsights.description.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Post Job</Button>
      </div>
    </form>
  );
}
