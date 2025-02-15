import { User as SupabaseUser } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResult {
  user: SupabaseUser | null;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  needsEmailVerification?: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export type User = SupabaseUser;
