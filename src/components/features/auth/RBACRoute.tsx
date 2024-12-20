import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../lib/hooks/useAuth';
import { Permission } from '../../../types/domain/rbac';
import { rbacService } from '../../../lib/api/rbac';

interface RBACRouteProps {
  children: ReactNode;
  requiredPermissions: Permission[];
  fallbackPath?: string;
}

export function RBACRoute({
  children,
  requiredPermissions,
  fallbackPath = '/unauthorized',
}: RBACRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!rbacService.canAccessRoute(user.role, requiredPermissions)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
