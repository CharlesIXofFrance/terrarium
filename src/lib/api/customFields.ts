import { supabase } from '@/lib/supabase';
import type { FieldDefinition } from '@/lib/types/profile';

interface CustomFieldError extends Error {
  code: string;
  details?: string;
}

export async function getFieldDefinitions(
  communityId: string,
  section: 'background' | 'current_status' | 'career_settings'
): Promise<{ data: FieldDefinition[] | null; error: CustomFieldError | null }> {
  try {
    const { data, error } = await supabase
      .from('community_profile_settings')
      .select('field_definitions')
      .eq('community_id', communityId)
      .eq('section', section)
      .single();

    if (error) {
      throw {
        name: 'FetchError',
        message: 'Failed to fetch field definitions',
        code: error.code,
        details: error.message,
      };
    }

    return { data: data?.field_definitions || null, error: null };
  } catch (err) {
    const error = err as CustomFieldError;
    return {
      data: null,
      error: {
        name: error.name || 'UnknownError',
        message: error.message || 'An unknown error occurred',
        code: error.code || 'UNKNOWN',
        details: error.details,
      },
    };
  }
}

export async function updateFieldDefinitions(
  communityId: string,
  section: 'background' | 'current_status' | 'career_settings',
  fieldDefinitions: FieldDefinition[]
): Promise<{ data: null; error: CustomFieldError | null }> {
  try {
    const { error } = await supabase.from('community_profile_settings').upsert(
      {
        community_id: communityId,
        section,
        field_definitions: fieldDefinitions,
      },
      { onConflict: 'community_id,section' }
    );

    if (error) {
      throw {
        name: 'UpdateError',
        message: 'Failed to update field definitions',
        code: error.code,
        details: error.message,
      };
    }

    return { data: null, error: null };
  } catch (err) {
    const error = err as CustomFieldError;
    return {
      data: null,
      error: {
        name: error.name || 'UnknownError',
        message: error.message || 'An unknown error occurred',
        code: error.code || 'UNKNOWN',
        details: error.details,
      },
    };
  }
}

export async function updateCustomFields(
  userId: string,
  section: 'background' | 'current_status' | 'career_settings',
  values: Record<string, any>
): Promise<{ data: null; error: CustomFieldError | null }> {
  try {
    const table =
      section === 'background'
        ? 'profiles'
        : section === 'current_status'
          ? 'current_status'
          : 'career_settings';

    const { error } = await supabase
      .from(table)
      .update({ community_metadata: values })
      .eq('user_id', userId);

    if (error) {
      throw {
        name: 'UpdateError',
        message: 'Failed to update custom field values',
        code: error.code,
        details: error.message,
      };
    }

    return { data: null, error: null };
  } catch (err) {
    const error = err as CustomFieldError;
    return {
      data: null,
      error: {
        name: error.name || 'UnknownError',
        message: error.message || 'An unknown error occurred',
        code: error.code || 'UNKNOWN',
        details: error.details,
      },
    };
  }
}
