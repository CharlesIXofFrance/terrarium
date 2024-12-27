import { useAuth } from './useAuth';
import { Permission } from '../../backend/types/rbac.types';
import { rbacService } from '../../backend/services/rbac.service';

export function useRBAC() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return rbacService.hasPermission(user.role, permission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return rbacService.hasAllPermissions(user.role, permissions);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return rbacService.hasAnyPermission(user.role, permissions);
  };

  const canAccessRoute = (requiredPermissions: Permission[]): boolean => {
    if (!user) return false;
    return rbacService.canAccessRoute(user.role, requiredPermissions);
  };

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canAccessRoute,
    userRole: user?.role,
  };
}
