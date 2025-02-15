import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthGuard } from '../features/auth/AuthGuard';
import { CommunityLoginPage } from '@/pages/auth/CommunityLoginPage';
import { AuthCallback } from '@/pages/auth/AuthCallback';
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage';
import { LogoutPage } from '@/pages/auth/LogoutPage';
import { OwnerOnboarding } from '@/components/features/onboarding/OwnerOnboarding';
import { PlatformRegister } from '@/pages/auth/PlatformRegister';
import { PlatformLogin } from '@/pages/auth/PlatformLogin';

// Platform-specific components
const PlatformDashboard = () => <div>Platform Dashboard</div>;

export const PlatformRoutes: React.FC = () => {
  const { user } = useAuth();

  // If user is not logged in, show login page
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<PlatformLogin />} />
        <Route path="/register" element={<PlatformRegister />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If user is logged in but not an owner, show unauthorized
  if (user.role !== 'owner') {
    return (
      <Routes>
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="*" element={<Navigate to="/unauthorized" replace />} />
      </Routes>
    );
  }

  // User is logged in and is an owner
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Navigate to="/dashboard" replace />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/logout" element={<LogoutPage />} />

      {/* Protected routes - require platform owner role */}
      <Route element={<AuthGuard allowedRoles={['owner']} />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PlatformDashboard />} />
        <Route path="/onboarding" element={<OwnerOnboarding />} />
      </Route>

      {/* Catch-all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
