/**
 * AI Context:
 * This file defines the core types for Terrarium's authentication system.
 * We have two distinct auth flows:
 *
 * 1. Password-based (Community Owners & Admins):
 *    - Traditional email/password signup and login
 *    - Requires email verification
 *    - Used by platform and community administrators
 *
 * 2. Passwordless (Members & Employers):
 *    - Magic link based signup and login
 *    - Email verification built into the flow
 *    - Used by community members and employers
 *
 * The types here support both flows while maintaining type safety
 * and preventing incorrect usage (e.g. passwordless for admins).
 */

import type { Session, User } from '@supabase/supabase-js';

export enum UserRole {
  MEMBER = 'member',
  EMPLOYER = 'employer',
  OWNER = 'owner',
  ADMIN = 'admin',
}

export interface AuthUser extends User {
  role: UserRole;
  community_id?: string;
  community_slug?: string;
}

// Base interfaces
interface BaseAuthData {
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

interface CommunityAuthData extends BaseAuthData {
  communityId: string;
  communitySlug: string;
}

// Password auth (owners/admins)
export interface PasswordSignUpData extends CommunityAuthData {
  password: string;
}

export interface PasswordSignInData {
  email: string;
  password: string;
}

// Passwordless auth (members/employers)
export interface PasswordlessSignUpData extends CommunityAuthData {}
export interface PasswordlessSignInData {
  email: string;
}

// Invite types
export interface InviteData extends CommunityAuthData {
  redirectUrl?: string;
}

export interface BulkInviteData {
  invites: InviteData[];
}

// Results
export interface AuthResult {
  user: AuthUser | null;
  session: Session | null;
  tempProfileId?: string | null;
  error: Error | null;
}

export interface BulkInviteResult {
  results: (AuthResult & { email: string })[];
}
