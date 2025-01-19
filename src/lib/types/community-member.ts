/**
 * Types for community member onboarding and configuration
 */

export interface CommunityMemberConfig {
  welcomeVideoUrl?: string;
  identityPactTemplate?: string;
  customFields: CustomField[];
  requiresApproval: boolean;
  rewardsConfig: {
    welcomeMeme?: string;
    completionAnimation: 'confetti' | 'fireworks' | 'none';
  };
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'select' | 'date' | 'number';
  required: boolean;
  options?: string[]; // For select fields
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface OnboardingStatus {
  welcome_completed: boolean;
  identity_pact_completed: boolean;
  profile_completed: boolean;
  rewards_claimed: boolean;
}

export interface CommunityMemberProfile {
  basic: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  career: {
    current_role?: string;
    company?: string;
    years_of_experience?: number;
    preferences: {
      desired_roles?: string[];
      desired_locations?: string[];
      salary_range?: {
        min: number;
        max: number;
        currency: string;
        interval: 'yearly' | 'monthly';
      };
      openness_to_opportunities:
        | 'looking_actively'
        | 'open_to_opportunities'
        | 'not_open';
    };
  };
  community_fields: Record<string, any>;
}

export interface CommunityApplication {
  status: 'pending' | 'approved' | 'rejected';
  custom_fields: Record<string, any>;
  identity_pact_response: string;
  created_at: Date;
  updated_at: Date;
}
