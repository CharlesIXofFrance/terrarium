import { Role, Permission, ROLE_PERMISSIONS, DEFAULT_ROLE } from '../types/rbac.types';

class RBACService {
  /**
   * Check if a role has a specific permission
   */
  hasPermission(role: Role, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[DEFAULT_ROLE];
    return permissions.some(
      (p) => p.action === permission.action && p.resource === permission.resource
    );
  }

  /**
   * Check if a role has all of the specified permissions
   */
  hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(role, permission));
  }

  /**
   * Check if a role has any of the specified permissions
   */
  hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(role, permission));
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[DEFAULT_ROLE];
  }

  /**
   * Check if a role can access a specific route based on required permissions
   */
  canAccessRoute(role: Role, requiredPermissions: Permission[]): boolean {
    return this.hasAllPermissions(role, requiredPermissions);
  }
}

export const rbacService = new RBACService();
