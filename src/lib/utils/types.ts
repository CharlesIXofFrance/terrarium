/**
 * Core types for the Terrarium application
 */

import { User as SupabaseUser } from '@supabase/supabase-js';

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  EMPLOYER = 'employer',
}

// Type guard for UserRole
export const isUserRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

export interface ExtendedUser extends SupabaseUser {
  role: UserRole;
  firstName?: string;
  lastName?: string;
  onboardingComplete: boolean;
  emailVerified: boolean;
  accessToken?: string;
  mfaEnabled: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  communityId?: string;
  communitySlug?: string;
  metadata?: Record<string, unknown>;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  coverImage?: string;
  location: string;
  type: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'yearly' | 'monthly' | 'hourly';
  };
  experience?: string;
  description: string;
  requirements: string[];
  status: 'draft' | 'active' | 'closed';
  postedAt: string;
  communityId: string;
  isEarlyApplicant?: boolean;
  sisterScore?: number;
  source?: 'recruitcrm' | 'local';
  benefits?: Array<{
    icon: string;
    label: string;
  }>;
  companyInsights?: {
    founded: number;
    size: string;
    funding: string;
    industry: string;
  };
  scores?: {
    culture: number;
    fairness: number;
    leadership: number;
    workLife: number;
  };
}
