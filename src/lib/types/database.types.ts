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
          description: string | null;
          owner_id: string;
          logo_url: string | null;
          slug: string;
          settings: Json;
          banner_url: string | null;
          favicon_url: string | null;
          custom_domain: string | null;
          onboarding_completed: boolean;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          description?: string | null;
          owner_id: string;
          logo_url?: string | null;
          slug: string;
          settings?: Json;
          banner_url?: string | null;
          favicon_url?: string | null;
          custom_domain?: string | null;
          onboarding_completed?: boolean;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          description?: string | null;
          owner_id?: string;
          logo_url?: string | null;
          slug?: string;
          settings?: Json;
          banner_url?: string | null;
          favicon_url?: string | null;
          custom_domain?: string | null;
          onboarding_completed?: boolean;
          is_active?: boolean;
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
          full_name: string | null;
          email: string | null;
          role: string;
          onboarding_completed: boolean;
          onboarding_step: string | null;
          city: string | null;
          birthdate: string | null;
          gender: string | null;
          nationality: string | null;
          phone: string | null;
          linkedin_url: string | null;
          avatar_url: string | null;
          profile_complete: boolean;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          email?: string | null;
          role?: string;
          onboarding_completed?: boolean;
          onboarding_step?: string | null;
          city?: string | null;
          birthdate?: string | null;
          gender?: string | null;
          nationality?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          avatar_url?: string | null;
          profile_complete?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          email?: string | null;
          role?: string;
          onboarding_completed?: boolean;
          onboarding_step?: string | null;
          city?: string | null;
          birthdate?: string | null;
          gender?: string | null;
          nationality?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          avatar_url?: string | null;
          profile_complete?: boolean;
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
