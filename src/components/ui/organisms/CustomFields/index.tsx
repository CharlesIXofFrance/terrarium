/**
 * AI Context: CustomFields Component
 *
 * This is a reusable form component that renders dynamic form fields based on field definitions.
 * It's part of our organism-level components as it composes multiple atomic components
 * into a more complex form structure.
 *
 * Location: /src/components/ui/organisms/CustomFields
 * - Part of the atomic design system at organism level
 * - Used across various features for dynamic form generation
 *
 * Responsibilities:
 * - Render different types of form fields based on field definitions
 * - Handle form state through React Hook Form
 * - Support validation and error states
 * - Support various field types (text, number, date, dropdown, multi-select, boolean)
 * - Maintain accessibility standards
 *
 * Design Constraints:
 * - Must use atomic UI components
 * - Must maintain consistent styling
 * - Must preserve accessibility features
 */

import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { FieldDefinition } from '@/lib/types/profile';
import { Input } from '@/components/ui/atoms/Input';
import { Select } from '@/components/ui/atoms/Select';
import { MultiSelect } from '@/components/ui/atoms/MultiSelect';
import { Switch } from '@/components/ui/atoms/Switch';

interface CustomFieldsProps {
  /** Array of field definitions that describe the form fields to render */
  fieldDefinitions: FieldDefinition[];
  /** Namespace for the form fields, used as a prefix for field names */
  namespace: string;
}

export function CustomFields({
  fieldDefinitions,
  namespace,
}: CustomFieldsProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const renderField = (field: FieldDefinition) => {
    const fieldName = `${namespace}.${field.name}`;
    const error = errors[namespace]?.[field.name]?.message as
      | string
      | undefined;

    switch (field.type) {
      case 'text':
        return (
          <Input
            key={field.name}
            label={field.name}
            {...register(fieldName)}
            error={error}
            helperText={field.help_text}
          />
        );

      case 'number':
        return (
          <Input
            key={field.name}
            type="number"
            label={field.name}
            {...register(fieldName, { valueAsNumber: true })}
            error={error}
            helperText={field.help_text}
          />
        );

      case 'date':
        return (
          <Input
            key={field.name}
            type="date"
            label={field.name}
            {...register(fieldName)}
            error={error}
            helperText={field.help_text}
          />
        );

      case 'dropdown':
        return (
          <Select
            key={field.name}
            label={field.name}
            {...register(fieldName)}
            error={error}
            helperText={field.help_text}
          >
            <option value="">Select {field.name}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        );

      case 'multi_select':
        return (
          <MultiSelect
            key={field.name}
            label={field.name}
            options={(field.options || []).map((option) => ({
              value: option,
              label: option,
            }))}
            value={watch(fieldName) || []}
            onChange={(value) => setValue(fieldName, value)}
            error={error}
          />
        );

      case 'boolean':
        return (
          <div key={field.name} className="flex items-center gap-2">
            <Switch {...register(fieldName)} error={error} />
            <span className="text-sm text-gray-700">{field.name}</span>
            {field.help_text && (
              <span className="text-xs text-gray-500">{field.help_text}</span>
            )}
          </div>
        );

      default:
        console.warn(`Unsupported field type: ${field.type}`);
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {fieldDefinitions.map((field) => (
        <div key={field.name}>{renderField(field)}</div>
      ))}
    </div>
  );
}
