import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userAtom } from '@/lib/stores/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/hooks/useToast';
import {
  currentStatusFormSchema,
  type CurrentStatus,
} from '@/lib/types/profile';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Select } from '@/components/ui/atoms/Select';
import { Dialog } from '@/components/ui/atoms/Dialog';
import { CustomFields } from '@/components/ui/organisms/CustomFields';
import { CustomFieldsDisplay } from '@/components/features/members/profile/CustomFieldsDisplay';
import { getFieldDefinitions } from '@/lib/utils/fieldDefinitions';

export function CurrentStatusTab() {
  const [user] = useAtom(userAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus | null>(
    null
  );
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(currentStatusFormSchema),
  });

  useEffect(() => {
    if (user?.id) {
      fetchCurrentStatus();
    }
  }, [user?.id]);

  const fetchCurrentStatus = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('current_status')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      if (error) throw error;

      setCurrentStatus(data);
      reset(data);
    } catch (error) {
      console.error('Error fetching current status:', error);
    }
  };

  const onSubmit = async (data: Partial<CurrentStatus>) => {
    if (!user?.id) return;

    try {
      if (currentStatus) {
        // Update existing status
        const { error } = await supabase
          .from('current_status')
          .update(data)
          .eq('profile_id', user.id);

        if (error) throw error;
      } else {
        // Insert new status
        const { error } = await supabase.from('current_status').insert({
          profile_id: user.id,
          ...data,
        });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Current status updated successfully',
        type: 'success',
      });
      setIsEditing(false);
      fetchCurrentStatus();
    } catch (error) {
      console.error('Error updating current status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update current status',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Current Role
              </dt>
              <dd className="text-sm text-gray-900">
                {user?.current_role || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Company</dt>
              <dd className="text-sm text-gray-900">
                {user?.current_company || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Experience Level
              </dt>
              <dd className="text-sm text-gray-900">
                {user?.experience_level || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Skills</dt>
              <dd className="text-sm text-gray-900">
                {user?.skills?.join(', ') || 'Not set'}
              </dd>
            </div>
          </div>

          {/* Display custom fields */}
          <CustomFieldsDisplay
            fieldDefinitions={getFieldDefinitions('current_status')}
            values={user?.community_metadata || {}}
            className="mt-6"
          />

          <div className="flex justify-end">
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          </div>
        </>
      ) : (
        <Dialog
          open={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Current Status"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Standard fields */}
            <Select
              label="Job Satisfaction"
              {...register('job_satisfaction')}
              error={errors.job_satisfaction?.message}
            >
              <option value="">Select satisfaction level</option>
              <option value="very_satisfied">Very Satisfied</option>
              <option value="satisfied">Satisfied</option>
              <option value="neutral">Neutral</option>
              <option value="not_satisfied">Not Satisfied</option>
              <option value="very_not_satisfied">Very Not Satisfied</option>
            </Select>
            <Input
              label="Current Job Title"
              {...register('current_job_title')}
              error={errors.current_job_title?.message}
            />
            <Input
              label="Employer"
              {...register('employer')}
              error={errors.employer?.message}
            />
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Gross Salary"
                type="number"
                {...register('gross_salary', { valueAsNumber: true })}
                error={errors.gross_salary?.message}
              />
              <Select
                label="Salary Interval"
                {...register('salary_interval')}
                error={errors.salary_interval?.message}
              >
                <option value="">Select interval</option>
                <option value="yearly">Per Year</option>
                <option value="monthly">Per Month</option>
              </Select>
            </div>
            <Input
              label="Salary Currency"
              {...register('salary_currency')}
              error={errors.salary_currency?.message}
            />

            {/* Custom fields */}
            <CustomFields
              fieldDefinitions={getFieldDefinitions('current_status')}
              namespace="community_metadata"
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
