import { Database } from '../api/database.types';

export type User = Database['public']['Tables']['users']['Row'];
export type Community = Database['public']['Tables']['communities']['Row'];

export interface UserWithCommunity extends User {
  community?: Community;
}

export interface AuthState {
  user: User | null;
  community: Community | null;
  isLoading: boolean;
  error: string | null;
}
