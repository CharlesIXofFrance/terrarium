/**
 * AI Context:
 * This is the main entry point for Terrarium's authentication system.
 * It exports two primary services:
 *
 * 1. ownerAuth: Password-based auth for owners/admins
 *    import { ownerAuth } from '@/services/auth';
 *    await ownerAuth.signUp({ email, password, ... });
 *
 * 2. memberAuth: Passwordless auth for members/employers
 *    import { memberAuth } from '@/services/auth';
 *    await memberAuth.signUp({ email, ... });
 *
 * Each service is designed for specific user types:
 * - ownerAuth: Community owners and platform admins
 * - memberAuth: Community members and employers
 *
 * Both services share common functionality through BaseAuthService
 * but implement their own auth flows (password vs passwordless).
 */

// Re-export auth services
export { memberAuth } from './passwordless';
export { passwordAuthService as ownerAuth } from './password';

// Re-export auth types from base
import { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/utils/types';
import { z } from 'zod';
import { BaseAuthService } from './base';

// Constants
const DEFAULT_ROLE = UserRole.MEMBER;
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes

// Type definitions
export interface AuthResult {
  user: {
    id: string;
    email: string | null;
    role: UserRole;
  };
  access_token: string;
  refresh_token: string;
  expires_at: number;
  profile?: Record<string, unknown>;
  community?: {
    id: string;
    slug: string;
    name: string;
    settings?: Record<string, unknown>;
  };
  isNewUser?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  result?: AuthResult;
}

interface CommunityMember {
  id: string;
  role: UserRole;
  status: 'active' | 'pending' | 'inactive';
  community: {
    id: string;
    slug: string;
    settings?: {
      roles?: {
        inheritance?: Record<string, string[]>;
      };
    };
  };
}

type Provider = 'google' | 'github';

interface AuthOptions {
  role?: UserRole;
  redirectTo?: string;
  communityId?: string;
  communitySlug?: string;
  firstName?: string;
  lastName?: string;
  scopes?: string;
}

// Validation schemas
const emailSchema = z.string().email();
const communitySlugSchema = z.string().min(3).max(50);

// Helper functions
export function mapUserToAuthResult(
  user: User,
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  community?: CommunityMember['community']
): AuthResult {
  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      role: (user.user_metadata?.role as UserRole) || DEFAULT_ROLE,
    },
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    community: community && {
      id: community.id,
      slug: community.slug,
      name: community.slug, // We'll fetch the actual name from the DB
      settings: community.settings,
    },
    isNewUser: user.user_metadata?.isNewUser,
  };
}

function mapErrorToAuthResponse(error: unknown): AuthResponse {
  const message =
    error instanceof Error ? error.message : 'An unknown error occurred';
  return {
    success: false,
    message,
    error: message,
  };
}

export class AuthService extends BaseAuthService {
  private rateLimitMap: Map<string, number[]>;

  constructor() {
    super();
    this.rateLimitMap = new Map();
  }

  private isRateLimited(email: string): boolean {
    const now = Date.now();
    const attempts = this.rateLimitMap.get(email) || [];
    const recentAttempts = attempts.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
    );
    return recentAttempts.length >= MAX_ATTEMPTS;
  }

  /**
   * Sign in with email using magic link
   * @param email User's email address
   * @param options Additional auth options
   */
  async signInWithEmail(
    email: string,
    options?: AuthOptions
  ): Promise<AuthResponse> {
    try {
      // Validate inputs
      emailSchema.parse(email);
      if (options?.communitySlug) {
        communitySlugSchema.parse(options.communitySlug);
      }

      // Check rate limiting
      if (this.isRateLimited(email)) {
        return {
          success: false,
          message: 'Too many attempts. Please try again later.',
        };
      }

      // Get or validate community
      let communityId = options?.communityId;
      let communityName = 'Your Community';
      if (options?.communitySlug && !communityId) {
        const { data: community } = await supabase
          .from('communities')
          .select('id, name')
          .eq('slug', options.communitySlug)
          .single();

        if (!community) {
          return {
            success: false,
            message: 'Community not found',
          };
        }
        communityId = community.id;
        communityName = community.name;
      }

      // Send magic link - we'll create the user if they don't exist
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(), // Update email type
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/confirm?type=email&subdomain=${options?.communitySlug}`,
          data: {
            role: options?.role || DEFAULT_ROLE,
            communityId: communityId || undefined,
            communitySlug: options?.communitySlug,
            communityName: communityName,
            firstName: options?.firstName || undefined,
            lastName: options?.lastName || undefined,
            isNewUser: String(Boolean(options?.firstName && options?.lastName)),
          },
        },
      });

      if (error) {
        // Update rate limit tracking
        const attempts = this.rateLimitMap.get(email) || [];
        attempts.push(Date.now());
        this.rateLimitMap.set(email, attempts);
        return mapErrorToAuthResponse(error);
      }

      return {
        success: true,
        message: 'Check your email for the magic link.',
      };
    } catch (error) {
      return mapErrorToAuthResponse(error);
    }
  }

  /**
   * Sign in with OAuth provider
   * @param provider OAuth provider (google, github)
   * @param options Additional auth options
   */
  async signInWithProvider(
    provider: Provider,
    options?: AuthOptions
  ): Promise<AuthResponse> {
    try {
      // Validate community if provided
      if (options?.communitySlug) {
        communitySlugSchema.parse(options.communitySlug);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: options?.redirectTo,
          scopes: options?.scopes,
          queryParams: {
            role: options?.role || DEFAULT_ROLE,
            communityId: options?.communityId || '',
            firstName: options?.firstName || '',
            lastName: options?.lastName || '',
            isNewUser: String(Boolean(options?.firstName && options?.lastName)),
          },
        },
      });

      if (error) {
        return mapErrorToAuthResponse(error);
      }

      return {
        success: true,
        message: 'Redirecting to provider...',
      };
    } catch (error) {
      return mapErrorToAuthResponse(error);
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return mapErrorToAuthResponse(error);
      }
      return {
        success: true,
        message: 'Successfully signed out',
      };
    } catch (error) {
      return mapErrorToAuthResponse(error);
    }
  }

  /**
   * Check if a user has the required roles for a community
   * @param userId User ID to check
   * @param communityId Community ID to check against
   * @param requiredRoles Array of required roles
   */
  async checkRoleAccess(
    userId: string,
    communityId: string,
    requiredRoles: UserRole[]
  ): Promise<boolean> {
    try {
      const { data: member, error } = await supabase
        .from('community_members')
        .select('role, community:communities(settings)')
        .eq('profile_id', userId)
        .eq('community_id', communityId)
        .single();

      if (error || !member) return false;

      const userRole = member.role as UserRole;
      const roleInheritance =
        member.community?.settings?.roles?.inheritance || {};

      // Platform owners and community owners have full access
      if (userRole === UserRole.OWNER || userRole === UserRole.ADMIN) {
        return true;
      }

      // Check if user's role matches or inherits any of the required roles
      return requiredRoles.some(
        (role) =>
          userRole === role ||
          (roleInheritance[userRole] &&
            roleInheritance[userRole].includes(role))
      );
    } catch (error) {
      console.error('Error checking role access:', error);
      return false;
    }
  }

  /**
   * Get a community member's details
   * @param userId User ID
   * @param communityId Community ID
   */
  async getCommunityMember(
    userId: string,
    communityId: string
  ): Promise<CommunityMember | null> {
    const { data, error } = await supabase
      .from('community_members')
      .select('*, community:communities(*)')
      .eq('profile_id', userId)
      .eq('community_id', communityId)
      .single();

    if (error || !data) return null;
    return data as CommunityMember;
  }

  private async getCommunityId(slug: string): Promise<string | null> {
    const { data } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .single();
    return data?.id || null;
  }
}

// Export instances
export const authService = new AuthService();
export * from './passwordless';
