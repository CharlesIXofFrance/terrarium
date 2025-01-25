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

// Re-export auth types
export { type AuthResult } from './base';
export { type User } from '@/lib/utils/types';

// Re-export user roles
import { UserRole } from '@/lib/utils/types';
export { UserRole };
