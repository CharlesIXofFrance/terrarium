import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userAtom } from '@/lib/stores/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/hooks/useToast';
import {
  careerSettingsFormSchema,
  type CareerSettings,
} from '@/lib/types/profile';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Select } from '@/components/ui/atoms/Select';
import { MultiSelect } from '@/components/ui/atoms/MultiSelect';
import { Dialog } from '@/components/ui/atoms/Dialog';
import { CustomFields } from '@/components/ui/organisms/CustomFields';
import { getFieldDefinitions } from '@/lib/utils/fieldDefinitions';

export function CareerSettingsTab() {
  const [user] = useAtom(userAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [careerSettings, setCareerSettings] = useState<CareerSettings | null>(
    null
  );
  const toast = useToast();
  const customFields = true; // Assuming customFields is true

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(careerSettingsFormSchema),
  });

  useEffect(() => {
    if (user?.id) {
      fetchCareerSettings();
    }
  }, [user?.id]);

  const fetchCareerSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('career_settings')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      if (error) throw error;

      setCareerSettings(data);
      reset(data);
    } catch (error) {
      console.error('Error fetching career settings:', error);
    }
  };

  const onSubmit = async (data: Partial<CareerSettings>) => {
    if (!user?.id) return;

    try {
      if (careerSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('career_settings')
          .update(data)
          .eq('profile_id', user.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase.from('career_settings').insert({
          profile_id: user.id,
          ...data,
        });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Career settings updated successfully',
        type: 'success',
      });
      setIsEditing(false);
      fetchCareerSettings();
    } catch (error) {
      console.error('Error updating career settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update career settings',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Career Settings
          </h2>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsEditing(true)}
          >
            <Plus className="w-4 h-4" />
            <span>{careerSettings ? 'Edit Settings' : 'Add Settings'}</span>
          </Button>
        </div>

        {careerSettings ? (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Openness to Opportunities
              </h3>
              <p className="mt-1 text-gray-900">
                {careerSettings.openness_to_opportunities
                  ?.replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not provided'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Desired Salary
              </h3>
              <p className="mt-1 text-gray-900">
                {careerSettings.desired_salary
                  ? `${careerSettings.desired_salary} ${
                      careerSettings.desired_salary_currency
                    } per ${careerSettings.desired_salary_interval || 'year'}`
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Desired Roles
              </h3>
              <p className="mt-1 text-gray-900">
                {careerSettings.desired_roles?.length
                  ? careerSettings.desired_roles.join(', ')
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Desired Attendance Models
              </h3>
              <p className="mt-1 text-gray-900">
                {careerSettings.desired_attendance_models?.length
                  ? careerSettings.desired_attendance_models
                      .map((model) =>
                        model
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())
                      )
                      .join(', ')
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Desired Locations
              </h3>
              <p className="mt-1 text-gray-900">
                {careerSettings.desired_locations?.length
                  ? careerSettings.desired_locations.join(', ')
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Desired Company Types
              </h3>
              <p className="mt-1 text-gray-900">
                {careerSettings.desired_company_types?.length
                  ? careerSettings.desired_company_types.join(', ')
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Desired Industry Types
              </h3>
              <p className="mt-1 text-gray-900">
                {careerSettings.desired_industry_types?.length
                  ? careerSettings.desired_industry_types.join(', ')
                  : 'Not provided'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No career settings provided.</p>
        )}
      </section>

      {/* Edit Dialog */}
      <Dialog
        open={isEditing}
        onClose={() => {
          setIsEditing(false);
          reset();
        }}
        title="Edit Career Settings"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            {/* Standard fields */}
            <Select
              label="Openness to Opportunities"
              {...register('openness_to_opportunities')}
              error={errors.openness_to_opportunities?.message}
            >
              <option value="">Select your status</option>
              <option value="looking_actively">Actively Looking</option>
              <option value="open_to_opportunities">
                Open to Opportunities
              </option>
              <option value="not_open">Not Open</option>
            </Select>

            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Desired Salary"
                type="number"
                {...register('desired_salary', { valueAsNumber: true })}
                error={errors.desired_salary?.message}
              />
              <Select
                label="Salary Interval"
                {...register('desired_salary_interval')}
                error={errors.desired_salary_interval?.message}
              >
                <option value="">Select interval</option>
                <option value="yearly">Per Year</option>
                <option value="monthly">Per Month</option>
              </Select>
            </div>

            <Input
              label="Salary Currency"
              {...register('desired_salary_currency')}
              error={errors.desired_salary_currency?.message}
            />

            <MultiSelect
              label="Desired Roles"
              options={[
                'Software Engineer',
                'Product Manager',
                'Data Scientist',
                'UX Designer',
                'Project Manager',
                'Business Analyst',
                'DevOps Engineer',
                'Technical Lead',
              ]}
              value={watch('desired_roles') || []}
              onChange={(value) => setValue('desired_roles', value)}
              error={errors.desired_roles?.message}
            />

            <MultiSelect
              label="Desired Attendance Models"
              options={[
                { label: 'Office', value: 'office' },
                { label: 'Hybrid', value: 'hybrid' },
                { label: 'Remote', value: 'remote' },
              ]}
              value={watch('desired_attendance_models') || []}
              onChange={(value) => setValue('desired_attendance_models', value)}
              error={errors.desired_attendance_models?.message}
            />

            <MultiSelect
              label="Desired Locations"
              options={[
                'London',
                'New York',
                'San Francisco',
                'Berlin',
                'Singapore',
                'Tokyo',
                'Remote',
              ]}
              value={watch('desired_locations') || []}
              onChange={(value) => setValue('desired_locations', value)}
              error={errors.desired_locations?.message}
            />

            <MultiSelect
              label="Desired Company Types"
              options={[
                'Startup',
                'Scale-up',
                'Enterprise',
                'Consulting',
                'Agency',
                'Non-profit',
              ]}
              value={watch('desired_company_types') || []}
              onChange={(value) => setValue('desired_company_types', value)}
              error={errors.desired_company_types?.message}
            />

            <MultiSelect
              label="Desired Industry Types"
              options={[
                'Technology',
                'Finance',
                'Healthcare',
                'Education',
                'E-commerce',
                'Manufacturing',
                'Entertainment',
              ]}
              value={watch('desired_industry_types') || []}
              onChange={(value) => setValue('desired_industry_types', value)}
              error={errors.desired_industry_types?.message}
            />

            {/* Custom fields */}
            {customFields && (
              <CustomFields
                fieldDefinitions={getFieldDefinitions('career_settings')}
                namespace="community_metadata"
              />
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
