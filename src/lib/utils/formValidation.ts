import { z } from 'zod';
import type { FieldDefinition } from '@/lib/types/profile';
import {
  profileFormSchema,
  currentStatusFormSchema,
  careerSettingsFormSchema,
} from '@/lib/types/profile';
import { createCustomFieldsSchema } from './fieldDefinitions';

// Create a schema that includes both standard and custom fields
export function createFormSchema(
  baseSchema: z.ZodObject<any>,
  customFields: FieldDefinition[]
) {
  const customSchema = createCustomFieldsSchema(customFields);

  return baseSchema.extend({
    metadata: z.record(z.unknown()).default({}),
    community_metadata: customSchema.default({}),
  });
}

// Create validation schemas for each section
export function createProfileFormSchema(customFields: FieldDefinition[]) {
  return createFormSchema(profileFormSchema, customFields);
}

export function createCurrentStatusFormSchema(customFields: FieldDefinition[]) {
  return createFormSchema(currentStatusFormSchema, customFields);
}

export function createCareerSettingsFormSchema(
  customFields: FieldDefinition[]
) {
  return createFormSchema(careerSettingsFormSchema, customFields);
}

// Helper function to validate form data
export function validateFormData(
  data: any,
  schema: z.ZodObject<any>
): { success: boolean; errors?: z.ZodError } {
  try {
    schema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}
