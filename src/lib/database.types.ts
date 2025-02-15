type UserRole = 'platform_admin' | 'admin' | 'member' | 'owner';
type CommunityRole = 'admin' | 'member' | 'owner';

export interface Database {
  public: {
    Tables: {
      rate_limits: {
        Row: {
          id: string;
          entity_id: string;
          entity_type: string;
          action: string;
          count: number;
          window_start: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_id: string;
          entity_type: string;
          action: string;
          count?: number;
          window_start?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_id?: string;
          entity_type?: string;
          action?: string;
          count?: number;
          window_start?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      communities: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          owner_id: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          owner_id: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          owner_id?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          profile_id: string;
          role: CommunityRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          profile_id: string;
          role?: CommunityRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          profile_id?: string;
          role?: CommunityRole;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_rate_limit: {
        Args: {
          p_entity_id: string;
          p_entity_type: string;
          p_action: string;
        };
        Returns: void;
      };
      log_auth_event: {
        Args: {
          p_action: string;
          p_metadata: Record<string, unknown>;
        };
        Returns: void;
      };
      check_user_role: {
        Args: {
          user_email: string;
          required_role: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
