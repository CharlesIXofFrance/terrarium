import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, Lock, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useToast } from '@/lib/hooks/useToast';
import { useCommunityDataSettings } from '@/lib/hooks/useCommunityDataSettings';
import {
  fieldDefinitionSchema,
  type FieldDefinition,
  type ProfileSection,
} from '@/lib/types/profile';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Switch } from '@/components/ui/atoms/Switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/atoms/Dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/atoms/Tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/atoms/Table';
import { cn } from '@/lib/utils';

/**
 * AI CONTEXT - DON'T DELETE
 * AI Context: Community Settings
 * User Types: COMMUNITY_OWNER
 *
 * Settings component for community owners to customize member profile fields.
 * Allows defining required and optional fields for member profiles.
 *
 * Location: /src/components/features/community/settings/
 * - Part of community settings
 * - Affects member onboarding flow
 *
 * Responsibilities:
 * - Configure custom member fields
 * - Set field requirements
 * - Define field validation rules
 * - Save field configurations
 *
 * Design Constraints:
 * - Must use form validation
 * - Must preserve existing member data
 * - Must sync with member onboarding
 */

export interface MemberFieldsSettingsProps {
  communityId: string;
  isAddingField?: boolean;
  onAddField?: () => void;
  onSave?: () => void;
}

// Platform mandatory fields by section
const PLATFORM_FIELDS = {
  profile: [
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'text', required: true },
    { name: 'city', label: 'City', type: 'text', required: false },
    { name: 'birthdate', label: 'Birthdate', type: 'date', required: false },
    { name: 'gender', label: 'Gender', type: 'text', required: false },
    {
      name: 'nationality',
      label: 'Nationality',
      type: 'text',
      required: false,
    },
    { name: 'phone', label: 'Phone', type: 'text', required: false },
    {
      name: 'linkedin_url',
      label: 'LinkedIn URL',
      type: 'text',
      required: false,
    },
  ],
  current_status: [
    {
      name: 'job_satisfaction',
      label: 'Job Satisfaction',
      type: 'dropdown',
      required: false,
    },
    {
      name: 'current_job_title',
      label: 'Current Job Title',
      type: 'text',
      required: false,
    },
    {
      name: 'employer',
      label: 'Current Employer',
      type: 'text',
      required: false,
    },
    {
      name: 'gross_salary',
      label: 'Gross Salary',
      type: 'number',
      required: false,
    },
    {
      name: 'salary_currency',
      label: 'Salary Currency',
      type: 'text',
      required: false,
    },
    {
      name: 'salary_interval',
      label: 'Salary Interval',
      type: 'dropdown',
      required: false,
    },
  ],
  career_settings: [
    {
      name: 'openness_to_opportunities',
      label: 'Open to Opportunities',
      type: 'dropdown',
      required: false,
    },
    {
      name: 'desired_salary',
      label: 'Desired Salary',
      type: 'number',
      required: false,
    },
    {
      name: 'desired_salary_currency',
      label: 'Desired Salary Currency',
      type: 'text',
      required: false,
    },
    {
      name: 'desired_salary_interval',
      label: 'Desired Salary Interval',
      type: 'dropdown',
      required: false,
    },
    {
      name: 'desired_roles',
      label: 'Desired Roles',
      type: 'multi_select',
      required: false,
    },
    {
      name: 'desired_attendance_models',
      label: 'Desired Work Models',
      type: 'multi_select',
      required: false,
    },
    {
      name: 'desired_locations',
      label: 'Desired Locations',
      type: 'multi_select',
      required: false,
    },
    {
      name: 'desired_company_types',
      label: 'Desired Company Types',
      type: 'multi_select',
      required: false,
    },
    {
      name: 'desired_industry_types',
      label: 'Desired Industries',
      type: 'multi_select',
      required: false,
    },
  ],
};

export function MemberFieldsSettings({
  communityId,
  isAddingField: isAddingFieldProp = false,
  onAddField,
  onSave,
}: MemberFieldsSettingsProps) {
  const [isAddingFieldLocal, setIsAddingFieldLocal] = useState(false);
  const isAddingField = isAddingFieldProp || isAddingFieldLocal;
  const [selectedSection, setSelectedSection] =
    useState<ProfileSection>('profile');
  const [selectedField, setSelectedField] = useState<FieldDefinition | null>(
    null
  );
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [localFields, setLocalFields] = useState<
    Record<ProfileSection, FieldDefinition[]>
  >({
    profile: [],
    current_status: [],
    career_settings: [],
  });
  const { toast } = useToast();

  const { settings, isLoading, updateSettings, getFieldDefinitions } =
    useCommunityDataSettings(communityId);

  const {
    register,
    control,
    formState: { errors },
    reset,
    watch,
    getValues,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(fieldDefinitionSchema.omit({ display_order: true })),
  });

  const fieldType = watch('type');

  const getLocalFieldDefinitions = (section: ProfileSection) => {
    console.log('Getting field definitions for section:', section);
    console.log('Current local fields:', localFields);
    const fields = localFields[section] || [];
    console.log('Fields found:', fields);
    return fields.sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0)
    );
  };

  // Update local fields when settings change
  useEffect(() => {
    if (settings) {
      console.log('Settings changed:', settings);
      const newLocalFields: Record<ProfileSection, FieldDefinition[]> = {
        profile: [],
        current_status: [],
        career_settings: [],
      };

      // Initialize with empty arrays for all sections
      settings.forEach((setting) => {
        if (setting.field_definitions) {
          newLocalFields[setting.section] = [...setting.field_definitions];
        }
      });

      // Ensure all sections exist in the database
      const sections: ProfileSection[] = [
        'profile',
        'current_status',
        'career_settings',
      ];
      sections.forEach(async (section) => {
        if (!settings.find((s) => s.section === section)) {
          console.log('Initializing missing section:', section);
          try {
            await updateSettings({
              section,
              fieldDefinitions: [],
            });
            newLocalFields[section] = [];
          } catch (error) {
            console.error(`Error initializing section ${section}:`, error);
          }
        }
      });

      console.log('Setting new local fields:', newLocalFields);
      setLocalFields(newLocalFields);
    }
  }, [settings, communityId]);

  const handleUpdateSettings = async ({
    section,
    fieldDefinitions,
    showToast = false,
  }: {
    section: ProfileSection;
    fieldDefinitions: FieldDefinition[];
    showToast?: boolean;
  }) => {
    console.log('handleUpdateSettings called with:', {
      section,
      fieldDefinitions,
    });
    if (!communityId) {
      console.error('No communityId found');
      return;
    }

    try {
      await updateSettings({
        section,
        fieldDefinitions,
      });

      // Update local state to ensure it's in sync
      setLocalFields((prev) => ({
        ...prev,
        [section]: fieldDefinitions,
      }));

      console.log('Settings updated successfully');

      // Close dialog and reset form
      setIsAddingFieldLocal(false);
      setSelectedField(null);

      // Only show toast when explicitly requested (adding/editing fields)
      if (showToast) {
        toast({
          title: 'Success',
          description: `Field ${selectedField ? 'updated' : 'added'} successfully`,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error in handleUpdateSettings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save field',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Initialize form with selected field data
  useEffect(() => {
    if (selectedField) {
      reset({
        ...selectedField,
        section: selectedSection,
      });
      // Set options if field is dropdown or multi-select
      if (selectedField.options) {
        setOptions(selectedField.options);
      }
    } else {
      reset({
        section: selectedSection,
        required: false,
      });
      setOptions([]);
    }
  }, [selectedField, selectedSection, reset]);

  const handleAddField = async (data: any) => {
    console.log('handleAddField called with data:', data);
    if (!communityId) {
      console.error('No communityId found');
      return;
    }

    try {
      // Get the section from the form data or use the current selected section
      const section = (data.section as ProfileSection) || selectedSection;
      console.log('Using section:', section);

      // Create a new field definition without the section
      const fieldDefinition = { ...data };
      delete fieldDefinition.section;

      // Use the options from state for dropdown/multi-select
      if (
        fieldDefinition.type === 'dropdown' ||
        fieldDefinition.type === 'multi_select'
      ) {
        if (options.length === 0) {
          toast({
            title: 'Error',
            description:
              'Please add at least one option for dropdown/multi-select fields',
            variant: 'destructive',
          });
          return;
        }
        fieldDefinition.options = options;
      }

      const currentFields = getLocalFieldDefinitions(section);
      console.log('Current fields:', currentFields);

      let newFields: FieldDefinition[];

      if (selectedField) {
        // Update existing field
        newFields = currentFields.map((f) =>
          f.name === selectedField.name
            ? { ...fieldDefinition, display_order: f.display_order }
            : f
        );
        console.log('Updated fields:', newFields);
      } else {
        // Add new field
        newFields = [
          ...currentFields,
          {
            ...fieldDefinition,
            display_order: currentFields.length,
          },
        ];
        console.log('Added new field:', newFields);
      }

      // Optimistically update local state
      setLocalFields((prev) => {
        const updated = {
          ...prev,
          [section]: newFields,
        };
        console.log('Updated local fields:', updated);
        return updated;
      });

      console.log('Updating settings with:', {
        section,
        fieldDefinitions: newFields,
      });
      await handleUpdateSettings({
        section,
        fieldDefinitions: newFields,
        showToast: true,
      });

      // Let onSubmit handle the dialog closing and form reset
    } catch (error) {
      console.error('Error saving field:', error);
      toast({
        title: 'Error',
        description: 'Failed to save field',
        variant: 'destructive',
      });
      throw error; // Propagate error to onSubmit
    }
  };

  const onFormSubmit = async (data: FieldDefinition) => {
    try {
      if (selectedField) {
        // Update existing field
        await updateField(data);
      } else {
        // Add new field
        await addField(data);
      }

      // Close dialog and reset form
      setIsAddingFieldLocal(false);
      if (onSave) onSave();
      setSelectedField(null);
      reset();
      setOptions([]);
    } catch (error) {
      console.error('Error submitting field:', error);
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedOptions = Array.from(options);
    const [removed] = reorderedOptions.splice(result.source.index, 1);
    reorderedOptions.splice(result.destination.index, 0, removed);

    setOptions(reorderedOptions);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const currentFields = getLocalFieldDefinitions(selectedSection);
    const items = Array.from(currentFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display order
    const newFields = items.map((field, index) => ({
      ...field,
      display_order: index,
    }));

    // Optimistically update local state
    setLocalFields((prev) => {
      const updated = {
        ...prev,
        [selectedSection]: newFields,
      };
      console.log('Updated local fields:', updated);
      return updated;
    });

    try {
      // Update server state without showing toast
      await handleUpdateSettings({
        section: selectedSection,
        fieldDefinitions: newFields,
        showToast: false,
      });
    } catch (error) {
      console.error('Error updating field order:', error);
      // Revert local state on error
      setLocalFields((prev) => ({
        ...prev,
        [selectedSection]: currentFields,
      }));
      toast({
        title: 'Error',
        description: 'Failed to update field order',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteField = async (fieldName: string) => {
    console.log('Deleting field:', fieldName, 'from section:', selectedSection);
    const currentFields = getLocalFieldDefinitions(selectedSection);
    console.log('Current fields:', currentFields);
    const newFields = currentFields.filter((f) => f.name !== fieldName);
    console.log('New fields after deletion:', newFields);

    // Optimistically update local state
    setLocalFields((prev) => {
      const updated = {
        ...prev,
        [selectedSection]: newFields,
      };
      console.log('Updated local fields:', updated);
      return updated;
    });

    try {
      await handleUpdateSettings({
        section: selectedSection,
        fieldDefinitions: newFields,
        showToast: false, // Don't show toast yet
      });

      // Only show success toast after server update succeeds
      toast({
        title: 'Success',
        description: 'Field deleted successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting field:', error);
      // Revert local state on error
      setLocalFields((prev) => ({
        ...prev,
        [selectedSection]: currentFields,
      }));
      toast({
        title: 'Error',
        description: 'Failed to delete field',
        variant: 'destructive',
      });
    }
  };

  const handleSectionChange = async (newSection: ProfileSection) => {
    console.log('Changing section to:', newSection);
    setSelectedSection(newSection);

    // Ensure the section exists in the database
    if (!settings?.find((s) => s.section === newSection)) {
      console.log('Section not found in settings, initializing:', newSection);
      try {
        await updateSettings({
          section: newSection,
          fieldDefinitions: [],
        });

        // Update local fields
        setLocalFields((prev) => ({
          ...prev,
          [newSection]: [],
        }));
      } catch (error) {
        console.error('Error initializing section:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize section',
          variant: 'destructive',
        });
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Tabs
        value={selectedSection}
        onValueChange={(value) => handleSectionChange(value as ProfileSection)}
      >
        <div className="flex items-center justify-between mb-6">
          <TabsList className="border border-gray-200 rounded-lg p-1 bg-gray-50">
            <TabsTrigger
              value="profile"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all cursor-pointer"
            >
              Profile Information
            </TabsTrigger>
            <TabsTrigger
              value="current_status"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all cursor-pointer"
            >
              Current Status
            </TabsTrigger>
            <TabsTrigger
              value="career_settings"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all cursor-pointer"
            >
              Career Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {(['profile', 'current_status', 'career_settings'] as const).map(
          (section) => (
            <TabsContent key={section} value={section}>
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="w-[40%] py-3 font-medium">
                          Field Name
                        </TableHead>
                        <TableHead className="w-[30%] py-3 font-medium">
                          Type
                        </TableHead>
                        <TableHead className="w-[20%] py-3 font-medium">
                          Required
                        </TableHead>
                        <TableHead className="w-[10%] py-3"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <Droppable droppableId={`fields-${section}`}>
                      {(provided, snapshot) => (
                        <TableBody
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={cn(
                            'divide-y divide-gray-200',
                            snapshot.isDraggingOver && 'bg-gray-50/50'
                          )}
                        >
                          {/* Platform Fields */}
                          {PLATFORM_FIELDS[section].map((field) => (
                            <TableRow key={`platform-${field.name}`}>
                              <TableCell className="w-[40%]">
                                <div className="flex items-center gap-3">
                                  <Lock className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">
                                    {field.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="w-[30%] capitalize">
                                {field.type.replace('_', ' ')}
                              </TableCell>
                              <TableCell className="w-[20%]">
                                {field.required ? 'Yes' : 'No'}
                              </TableCell>
                              <TableCell className="w-[10%]"></TableCell>
                            </TableRow>
                          ))}
                          {getLocalFieldDefinitions(section).map(
                            (field, index) => (
                              <Draggable
                                key={`custom-${field.name}`}
                                draggableId={`custom-${field.name}`}
                                index={index}
                                isDragDisabled={field.source === 'platform'}
                              >
                                {(provided, snapshot) => (
                                  <TableRow
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                      'hover:bg-gray-50/50 transition-colors w-full',
                                      snapshot.isDragging &&
                                        'bg-gray-50/80 shadow-sm'
                                    )}
                                  >
                                    <TableCell className="w-[40%]">
                                      <div className="flex items-center gap-3">
                                        <div
                                          {...provided.dragHandleProps}
                                          className={cn(
                                            'cursor-grab hover:bg-gray-100 p-1 rounded transition-colors',
                                            field.source === 'platform' &&
                                              'opacity-50 cursor-not-allowed'
                                          )}
                                        >
                                          <GripVertical className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {field.source === 'platform' && (
                                            <Lock className="h-3.5 w-3.5 text-gray-400" />
                                          )}
                                          <span className="font-medium text-gray-900">
                                            {field.name}
                                          </span>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="w-[30%] capitalize text-gray-600">
                                      {field.type
                                        ? field.type.replace('_', ' ')
                                        : 'Unknown Type'}
                                    </TableCell>
                                    <TableCell className="w-[20%] text-gray-600">
                                      {field.required ? 'Yes' : 'No'}
                                    </TableCell>
                                    <TableCell className="w-[10%]">
                                      <div className="flex justify-end gap-2">
                                        {field.source !== 'platform' && (
                                          <>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setSelectedField(field);
                                                setIsAddingFieldLocal(true);
                                              }}
                                              className="text-gray-600 hover:text-gray-900"
                                            >
                                              Edit
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleDeleteField(field.name)
                                              }
                                              className="text-gray-600 hover:text-red-600"
                                            >
                                              Delete
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </Draggable>
                            )
                          )}
                          {provided.placeholder}
                          {getLocalFieldDefinitions(section).length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-32 text-center"
                              >
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                  <p className="font-medium">
                                    No custom fields added yet
                                  </p>
                                  <p className="text-sm mt-1">
                                    Click "Add Field" to create one
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      )}
                    </Droppable>
                  </Table>
                </DragDropContext>
              </div>
            </TabsContent>
          )
        )}
      </Tabs>

      <Dialog
        open={isAddingField}
        onOpenChange={(open) => {
          setIsAddingFieldLocal(open);
          if (!open) {
            setSelectedField(null);
            if (onSave) onSave();
            reset();
            setOptions([]);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedField ? 'Edit Field' : 'Add Field'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="grid gap-4 py-4">
              {!selectedField && (
                <div className="grid gap-2">
                  <label
                    htmlFor="section"
                    className="text-sm font-medium text-gray-700"
                  >
                    Section
                  </label>
                  <select
                    id="section"
                    {...register('section', { required: true })}
                    defaultValue={selectedSection}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Select a section</option>
                    <option value="profile">Profile Information</option>
                    <option value="current_status">Current Status</option>
                    <option value="career_settings">Career Settings</option>
                  </select>
                  {errors.section && (
                    <p className="text-sm text-red-600">Section is required</p>
                  )}
                </div>
              )}

              <div className="grid gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Field Name
                </label>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                  defaultValue={selectedField?.name}
                  placeholder="e.g., Work Experience"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">Field name is required</p>
                )}
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="type"
                  className="text-sm font-medium text-gray-700"
                >
                  Field Type
                </label>
                <select
                  id="type"
                  {...register('type', { required: true })}
                  defaultValue={selectedField?.type}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select a type</option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="multi_select">Multi Select</option>
                  <option value="boolean">Yes/No</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-red-600">Field type is required</p>
                )}
              </div>

              {(fieldType === 'dropdown' || fieldType === 'multi_select') && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Options
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Enter an option"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddOption}
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>

                    <DragDropContext onDragEnd={handleOptionDragEnd}>
                      <Droppable droppableId="options">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                          >
                            {options.map((option, index) => (
                              <Draggable
                                key={option}
                                draggableId={option}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center gap-2 bg-white p-2 rounded-md border"
                                  >
                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                    <span className="flex-1">{option}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveOption(index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    {options.length === 0 && (
                      <p className="text-sm text-red-600">
                        Please add at least one option
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <label
                  htmlFor="help_text"
                  className="text-sm font-medium text-gray-700"
                >
                  Help Text
                </label>
                <Input
                  id="help_text"
                  {...register('help_text')}
                  defaultValue={selectedField?.help_text}
                  placeholder="Explain what this field is for..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  {...register('required')}
                  defaultChecked={selectedField?.required}
                />
                <label htmlFor="required" className="text-sm text-gray-700">
                  This field is required
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsAddingFieldLocal(false);
                  if (onSave) onSave();
                  setSelectedField(null);
                  reset();
                  setOptions([]);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedField ? 'Save Changes' : 'Add Field'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
