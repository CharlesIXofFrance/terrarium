export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      communities: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          slug: string;
          description: string | null;
          owner_id: string;
          logo_url: string | null;
          banner_url: string | null;
          is_active: boolean;
          settings: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          slug: string;
          description?: string | null;
          owner_id: string;
          logo_url?: string | null;
          banner_url?: string | null;
          is_active?: boolean;
          settings?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          owner_id?: string;
          logo_url?: string | null;
          banner_url?: string | null;
          is_active?: boolean;
          settings?: Json | null;
        };
      };
      community_members: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          community_id: string;
          profile_id: string;
          role: string;
          status: string;
          settings: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          community_id: string;
          profile_id: string;
          role?: string;
          status?: string;
          settings?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          community_id?: string;
          profile_id?: string;
          role?: string;
          status?: string;
          settings?: Json | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: string;
          profile_complete: boolean;
          settings: Json | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: string;
          profile_complete?: boolean;
          settings?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: string;
          profile_complete?: boolean;
          settings?: Json | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
