import { z } from 'zod';
import type {
  FieldDefinition,
  ProfileSection,
  CustomFieldType,
} from '@/lib/types/profile';

// Create a dynamic Zod schema based on field type
export function createFieldSchema(field: FieldDefinition) {
  let schema: z.ZodType<any>;

  switch (field.type) {
    case 'text':
      schema = z.string();
      break;
    case 'number':
      schema = z.number();
      break;
    case 'date':
      schema = z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      });
      break;
    case 'dropdown':
      schema = z.enum(field.options as [string, ...string[]]);
      break;
    case 'multi_select':
      schema = z.array(z.enum(field.options as [string, ...string[]]));
      break;
    case 'boolean':
      schema = z.boolean();
      break;
    default:
      schema = z.any();
  }

  return field.required ? schema : schema.optional();
}

// Create a Zod schema for all custom fields in a section
export function createCustomFieldsSchema(fields: FieldDefinition[]) {
  const schemaObj: Record<string, z.ZodType<any>> = {};

  fields.forEach((field) => {
    schemaObj[field.name] = createFieldSchema(field);
  });

  return z.object(schemaObj);
}

// Convert a value to the correct type based on field definition
export function convertFieldValue(value: any, type: CustomFieldType) {
  if (value === null || value === undefined) return value;

  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return Boolean(value);
    case 'multi_select':
      return Array.isArray(value) ? value : [value].filter(Boolean);
    case 'date':
      return value instanceof Date ? value.toISOString() : value;
    default:
      return value;
  }
}

// Format a field value for display
export function formatFieldValue(value: any, field: FieldDefinition): string {
  if (value === null || value === undefined) return '';

  switch (field.type) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'multi_select':
      return Array.isArray(value) ? value.join(', ') : String(value);
    default:
      return String(value);
  }
}

// Get field definitions for a specific section from community settings
export function getFieldDefinitions(
  section: ProfileSection,
  communitySettings?: any[]
): FieldDefinition[] {
  if (!communitySettings) return [];

  const sectionSettings = communitySettings.find((s) => s.section === section);
  return sectionSettings?.field_definitions || [];
}

// Validate a single field value
export function validateFieldValue(
  value: any,
  field: FieldDefinition
): { isValid: boolean; error?: string } {
  try {
    const schema = createFieldSchema(field);
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Invalid value',
      };
    }
    return { isValid: false, error: 'Invalid value' };
  }
}

// Get required custom fields for a section
export function getRequiredFields(
  fields: FieldDefinition[]
): FieldDefinition[] {
  return fields.filter((field) => field.required);
}

// Check if all required fields are filled
export function areRequiredFieldsFilled(
  values: Record<string, any>,
  fields: FieldDefinition[]
): boolean {
  const requiredFields = getRequiredFields(fields);
  return requiredFields.every((field) => {
    const value = values[field.name];
    return value !== null && value !== undefined && value !== '';
  });
}

// Create an empty values object with default values based on field types
export function createEmptyValues(
  fields: FieldDefinition[]
): Record<string, any> {
  const values: Record<string, any> = {};

  fields.forEach((field) => {
    switch (field.type) {
      case 'multi_select':
        values[field.name] = [];
        break;
      case 'boolean':
        values[field.name] = false;
        break;
      default:
        values[field.name] = null;
    }
  });

  return values;
}
