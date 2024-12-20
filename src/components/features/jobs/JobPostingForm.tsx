import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAtom } from 'jotai';
import { currentCommunityAtom } from '../../stores/community';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['full-time', 'part-time', 'contract']),
  location: z.string().min(1, 'Location is required'),
  remote: z.boolean(),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default('USD'),
  }),
  requirements: z.array(z.string()),
  benefits: z.array(z.string()),
  customFields: z.record(z.any()),
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
    console.log('Form data:', data);
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
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
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
              {...register('remote')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Remote position
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

      {community?.settings.jobBoard.customFields?.map((field) => (
        <div key={field.name} className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {field.name}
          </h2>

          {field.type === 'text' && (
            <Input
              {...register(`customFields.${field.name}`)}
              required={field.required}
            />
          )}

          {field.type === 'select' && (
            <select
              {...register(`customFields.${field.name}`)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              required={field.required}
            >
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      <div className="flex justify-end">
        <Button type="submit">Post Job</Button>
      </div>
    </form>
  );
}
