import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthGuard } from '../features/auth/AuthGuard';
import { CommunityLoginPage } from '@/pages/auth/CommunityLoginPage';
import { AuthCallback } from '@/pages/auth/AuthCallback';
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { OwnerOnboarding } from '@/components/features/onboarding/OwnerOnboarding';
import { PlatformRegister } from '@/pages/auth/PlatformRegister';
import { PlatformLogin } from '@/pages/auth/PlatformLogin';

// Platform-specific components
const PlatformDashboard = () => <div>Platform Dashboard</div>;
const CommunitiesList = () => <div>Communities List</div>;
const UsersList = () => <div>Users List</div>;
const PlatformSettings = () => <div>Platform Settings</div>;

export const PlatformRoutes: React.FC = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PlatformLogin />} />
      <Route path="/register" element={<PlatformRegister />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <PlatformDashboard />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <PlatformDashboard />
          </AuthGuard>
        }
      />
      <Route
        path="/communities"
        element={
          <AuthGuard>
            <CommunitiesList />
          </AuthGuard>
        }
      />
      <Route
        path="/users"
        element={
          <AuthGuard>
            <UsersList />
          </AuthGuard>
        }
      />
      <Route
        path="/settings"
        element={
          <AuthGuard>
            <PlatformSettings />
          </AuthGuard>
        }
      />
      <Route
        path="/onboarding"
        element={
          <AuthGuard>
            <OwnerOnboarding />
          </AuthGuard>
        }
      />

      {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
