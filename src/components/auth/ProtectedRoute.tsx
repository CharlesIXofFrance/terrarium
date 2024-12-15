import { Navigate, useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { userAtom } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAtomValue(userAtom);
  const location = useLocation();
  const [isEmailConfirmed, setIsEmailConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setIsEmailConfirmed(authUser?.email_confirmed_at != null);
    };

    if (user) {
      checkEmailConfirmation();
    }
  }, [user]);

  // Show nothing while checking email confirmation
  if (isEmailConfirmed === null && user) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isEmailConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-4 p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Please verify your email</h2>
            <p className="mt-2 text-sm text-gray-600">
              Check your email for a verification link. You need to verify your email before accessing this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}