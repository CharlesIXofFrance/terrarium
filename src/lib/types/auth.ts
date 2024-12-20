import type { Database } from '../database.types';
import { Role } from './rbac';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  full_name: string;
  role?: Role;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
  } | null;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
