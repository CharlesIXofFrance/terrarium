import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthGuard } from '../features/auth/AuthGuard';
import { CommunityLoginPage } from '@/pages/auth/CommunityLoginPage';
import { AuthCallback } from '@/pages/auth/AuthCallback';
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { OwnerOnboarding } from '@/components/features/onboarding/OwnerOnboarding';

// Platform-specific components
const PlatformDashboard = () => <div>Platform Dashboard</div>;
const CommunitiesList = () => <div>Communities List</div>;
const UsersList = () => <div>Users List</div>;
const PlatformSettings = () => <div>Platform Settings</div>;

export const PlatformRoutes: React.FC = () => {
  const { user } = useAuth();

  if (user?.role !== 'platform_owner') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<CommunityLoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected routes */}
      <Route path="/" element={<PlatformDashboard />} />
      <Route path="/dashboard" element={<PlatformDashboard />} />
      <Route path="/communities" element={<CommunitiesList />} />
      <Route path="/users" element={<UsersList />} />
      <Route path="/settings" element={<PlatformSettings />} />
      <Route
        path="/onboarding"
        element={
          <AuthGuard>
            <OwnerOnboarding />
          </AuthGuard>
        }
      />

      {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/platform" replace />} />
    </Routes>
  );
};
