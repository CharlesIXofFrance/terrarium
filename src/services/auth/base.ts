/**
 * Base authentication service that provides common functionality
 * for both password and passwordless authentication flows.
 */

import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/utils/types';

export interface AuthResult {
  success: boolean;
  error?: Error;
  data?: any;
  message?: string;
}

export abstract class BaseAuthService {
  /**
   * Gets a user profile by email
   */
  protected async getUserProfile(email: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
