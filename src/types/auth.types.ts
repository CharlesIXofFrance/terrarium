import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface User extends SupabaseUser {
  profile?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    role?: string;
    onboarding_completed?: boolean;
  };
}

export interface AuthResult {
  session: Session | null;
  user: User | null;
  error?: AuthError;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error?: AuthError;
}
