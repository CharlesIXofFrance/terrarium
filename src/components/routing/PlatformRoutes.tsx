import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';

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
      <Route path="/" element={<PlatformDashboard />} />
      <Route path="/dashboard" element={<PlatformDashboard />} />
      <Route path="/communities" element={<CommunitiesList />} />
      <Route path="/users" element={<UsersList />} />
      <Route path="/settings" element={<PlatformSettings />} />
      <Route path="*" element={<Navigate to="/platform" replace />} />
    </Routes>
  );
};
