import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userAtom } from '@/lib/stores/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/hooks/useToast';
import { profileFormSchema, type Profile } from '@/lib/types/profile';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { FileUpload } from '@/components/ui/atoms/FileUpload';
import { Dialog } from '@/components/ui/atoms/Dialog';
import { CustomFields } from '@/components/ui/organisms/CustomFields';
import { CustomFieldsDisplay } from '@/components/features/members/profile/CustomFieldsDisplay';
import { getFieldDefinitions } from '@/lib/utils/fieldDefinitions';

export function BackgroundTab() {
  const [user] = useAtom(userAtom);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: user?.full_name?.split(' ')[0] || '',
      last_name: user?.full_name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || '',
      linkedin_url: user?.linkedin_url || '',
      city: user?.city || '',
      nationality: user?.nationality || '',
    },
  });

  const onSubmit = async (data: Partial<Profile>) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        type: 'success',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        type: 'error',
      });
    }
  };

  const handleAvatarUpload = async (file: File | null) => {
    if (!file || !user?.id) return;

    try {
      const fileName = `${user.id}/avatar/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: fileName })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload avatar',
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
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900">
                {user?.full_name || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">
                {user?.email || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm text-gray-900">
                {user?.phone || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">LinkedIn</dt>
              <dd className="text-sm text-gray-900">
                {user?.linkedin_url || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">City</dt>
              <dd className="text-sm text-gray-900">
                {user?.city || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Nationality</dt>
              <dd className="text-sm text-gray-900">
                {user?.nationality || 'Not set'}
              </dd>
            </div>
          </div>

          {/* Display custom fields */}
          <CustomFieldsDisplay
            fieldDefinitions={getFieldDefinitions('background')}
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
          title="Edit Background"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              {/* Standard fields */}
              <Input
                label="First Name"
                {...register('first_name')}
                error={errors.first_name?.message}
              />
              <Input
                label="Last Name"
                {...register('last_name')}
                error={errors.last_name?.message}
              />
              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
              <Input
                label="Phone"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
              />
              <Input
                label="LinkedIn URL"
                type="url"
                {...register('linkedin_url')}
                error={errors.linkedin_url?.message}
              />
              <Input
                label="City"
                {...register('city')}
                error={errors.city?.message}
              />
              <Input
                label="Nationality"
                {...register('nationality')}
                error={errors.nationality?.message}
              />
              {/* Custom fields */}
              <CustomFields
                fieldDefinitions={getFieldDefinitions('background')}
                namespace="community_metadata"
              />

              <FileUpload
                label="Profile Picture"
                accept="image/*"
                onFileSelect={handleAvatarUpload}
              />
            </div>
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
