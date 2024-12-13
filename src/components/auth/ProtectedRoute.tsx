import { Navigate, useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { userAtom } from '../../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAtomValue(userAtom);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}