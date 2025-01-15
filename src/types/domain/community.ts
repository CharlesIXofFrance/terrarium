export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  theme?: {
    primary_color?: string;
    secondary_color?: string;
  };
  settings?: {
    jobBoard?: {
      customFields?: Array<{
        name: string;
        type: 'text' | 'select' | 'multiselect' | 'number';
        label: string;
        required?: boolean;
        options?: string[];
      }>;
    };
  };
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  status: 'active' | 'inactive' | 'banned';
}

export interface CommunityInvite {
  id: string;
  community_id: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at: string;
  invited_by: string;
}
