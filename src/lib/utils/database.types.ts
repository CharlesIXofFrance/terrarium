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
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          created_at: string;
          updated_at: string;
          owner_id: string;
          settings: Json | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          created_at?: string;
          updated_at?: string;
          owner_id: string;
          settings?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          created_at?: string;
          updated_at?: string;
          owner_id?: string;
          settings?: Json | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: 'admin' | 'owner' | 'employer' | 'member';
          created_at: string;
          updated_at: string;
          profile_complete: number;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: 'admin' | 'owner' | 'employer' | 'member';
          created_at?: string;
          updated_at?: string;
          profile_complete?: number;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: 'admin' | 'owner' | 'employer' | 'member';
          created_at?: string;
          updated_at?: string;
          profile_complete?: number;
        };
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          profile_id: string;
          role: 'admin' | 'owner' | 'employer' | 'member';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          profile_id: string;
          role?: 'admin' | 'owner' | 'employer' | 'member';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          profile_id?: string;
          role?: 'admin' | 'owner' | 'employer' | 'member';
          created_at?: string;
          updated_at?: string;
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
  };
}
