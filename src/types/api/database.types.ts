export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['users']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      communities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description?: string;
          logo_url?: string;
          created_at: string;
          updated_at: string;
          owner_id: string;
          settings?: Record<string, any>;
        };
        Insert: Omit<
          Database['public']['Tables']['communities']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['communities']['Insert']>;
      };
      community_members: {
        Row: {
          user_id: string;
          community_id: string;
          role: string;
          joined_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['community_members']['Row'],
          'joined_at'
        >;
        Update: Partial<
          Database['public']['Tables']['community_members']['Insert']
        >;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string[];
    };
  };
}
