import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { authService } from '@/backend/services/auth.service';

export function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await authService.logout();
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, redirect to login
        navigate('/login', { replace: true });
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">Signing you out...</p>
    </div>
  );
}
