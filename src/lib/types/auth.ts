import type { Database } from '../database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: Profile;
  session: {
    access_token: string;
    refresh_token: string;
  } | null;
}
