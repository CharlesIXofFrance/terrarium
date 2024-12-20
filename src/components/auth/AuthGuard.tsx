import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../lib/stores/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [user] = useAtom(userAtom);
  const location = useLocation();

  useEffect(() => {
    // Check if user exists in localStorage but not in atom
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      try {
        userAtom.set(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
