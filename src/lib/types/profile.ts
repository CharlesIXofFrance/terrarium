import { z } from 'zod';

export type JobSatisfaction =
  | 'very_satisfied'
  | 'satisfied'
  | 'neutral'
  | 'not_satisfied'
  | 'very_not_satisfied';
export type OpportunityStatus =
  | 'looking_actively'
  | 'open_to_opportunities'
  | 'not_open';
export type AttendanceModel = 'office' | 'hybrid' | 'remote';
export type SalaryInterval = 'yearly' | 'monthly';
export type CustomFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'dropdown'
  | 'multi_select'
  | 'boolean';
export type ProfileSection = 'profile' | 'current_status' | 'career_settings';

// Field definition for community custom fields
export const fieldDefinitionSchema = z.object({
  section: z.enum(['profile', 'current_status', 'career_settings'], {
    required_error: 'Please select a section',
  }),
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(
    ['text', 'number', 'date', 'dropdown', 'multi_select', 'boolean'],
    {
      required_error: 'Please select a field type',
    }
  ),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  help_text: z.string().optional(),
  display_order: z.number(),
});

export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>;

// Community data settings
export const communityDataSettingsSchema = z.object({
  id: z.string().uuid(),
  community_id: z.string().uuid(),
  section: z.enum(['profile', 'current_status', 'career_settings']),
  field_definitions: z.array(fieldDefinitionSchema),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CommunityDataSettings = z.infer<typeof communityDataSettingsSchema>;

// Base profile schemas with metadata support
export const profileSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  city: z.string().optional(),
  birthdate: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional(),
  avatar_url: z.string().optional(),
  onboarding_completed: z.boolean().default(false),
  onboarding_step: z.number().default(1),
  metadata: z.record(z.unknown()).default({}),
  community_metadata: z.record(z.unknown()).default({}),
  signup_community_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const currentStatusSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  job_satisfaction: z
    .enum([
      'very_satisfied',
      'satisfied',
      'neutral',
      'not_satisfied',
      'very_not_satisfied',
    ])
    .optional(),
  current_job_title: z.string().optional(),
  employer: z.string().optional(),
  gross_salary: z.number().optional(),
  salary_currency: z.string().optional(),
  salary_interval: z.enum(['yearly', 'monthly']).optional(),
  perks: z.record(z.boolean()).optional(),
  metadata: z.record(z.unknown()).default({}),
  community_metadata: z.record(z.unknown()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
});

export const careerSettingsSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  openness_to_opportunities: z
    .enum(['looking_actively', 'open_to_opportunities', 'not_open'])
    .default('not_open'),
  desired_salary: z.number().optional(),
  desired_salary_currency: z.string().optional(),
  desired_salary_interval: z.enum(['yearly', 'monthly']).optional(),
  desired_roles: z.array(z.string()).default([]),
  desired_attendance_models: z
    .array(z.enum(['office', 'hybrid', 'remote']))
    .default([]),
  desired_locations: z.array(z.string()).default([]),
  desired_company_types: z.array(z.string()).default([]),
  desired_industry_types: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
  community_metadata: z.record(z.unknown()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;
export type CurrentStatus = z.infer<typeof currentStatusSchema>;
export type CareerSettings = z.infer<typeof careerSettingsSchema>;

// Form schemas (for data input/update)
export const profileFormSchema = profileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  onboarding_completed: true,
  onboarding_step: true,
  metadata: true,
  community_metadata: true,
});

export const currentStatusFormSchema = currentStatusSchema.omit({
  id: true,
  profile_id: true,
  created_at: true,
  updated_at: true,
  metadata: true,
  community_metadata: true,
});

export const careerSettingsFormSchema = careerSettingsSchema.omit({
  id: true,
  profile_id: true,
  created_at: true,
  updated_at: true,
  metadata: true,
  community_metadata: true,
});

// Helper function to validate custom field value based on type
export const validateCustomFieldValue = (
  value: unknown,
  fieldDef: FieldDefinition
): boolean => {
  try {
    switch (fieldDef.type) {
      case 'text':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'date':
        return !isNaN(Date.parse(String(value)));
      case 'dropdown':
        return (
          typeof value === 'string' &&
          fieldDef.options?.includes(value as string) === true
        );
      case 'multi_select':
        return (
          Array.isArray(value) &&
          value.every(
            (item) => fieldDef.options?.includes(item as string) === true
          )
        );
      case 'boolean':
        return typeof value === 'boolean';
      default:
        return false;
    }
  } catch {
    return false;
  }
};
