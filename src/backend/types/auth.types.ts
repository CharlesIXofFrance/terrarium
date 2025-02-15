import { User as SupabaseUser } from '@supabase/supabase-js';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResult {
  user: SupabaseUser | null;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  needsEmailVerification?: boolean;
}

interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

type User = SupabaseUser;
