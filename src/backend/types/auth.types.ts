import type { Session, User } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  needsEmailVerification: boolean;
}
