import { useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { useRBAC } from '../lib/hooks/useRBAC';
import { Role } from '../backend/types/rbac.types';
import { authService } from '../backend/services/auth.service';

export function RBACTest() {
  const { user } = useAuth();
  const { hasPermission, hasAllPermissions } = useRBAC();
  const [testRole, setTestRole] = useState<Role>('member');
  const [selectedCommunityId, setSelectedCommunityId] =
    useState<string>('community1');

  // Platform-wide permissions (App Admin only)
  const canManagePlatform = hasPermission({
    action: 'manage',
    resource: 'platform',
  });
  const canManageAllCommunities = hasAllPermissions([
    { action: 'create', resource: 'communities' },
    { action: 'update', resource: 'communities' },
    { action: 'delete', resource: 'communities' },
  ]);

  // Community-specific permissions
  const canManageCommunity = hasAllPermissions([
    { action: 'update', resource: 'community' },
    { action: 'manage', resource: 'members' },
  ]);

  // Regular permissions
  const canReadJobs = hasPermission({ action: 'read', resource: 'jobs' });
  const canCreateJobs = hasPermission({ action: 'create', resource: 'jobs' });
  const canManageSettings = hasAllPermissions([
    { action: 'read', resource: 'settings' },
    { action: 'update', resource: 'settings' },
  ]);

  // Function to simulate role change (in a real app, this would update the database)
  const changeRole = async (newRole: Role) => {
    try {
      setTestRole(newRole);
      if (user) {
        await authService.login({
          email: user.email,
          password: 'your-test-password', // You'll need to use a real password
        });
      }
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  // Mock communities for testing
  const testCommunities = [
    { id: 'community1', name: 'Tech Community' },
    { id: 'community2', name: 'Design Community' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">RBAC Test Page</h1>

      {/* User Info */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Current User</h2>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      {/* Role Switcher */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Different Roles</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => changeRole('member')}
            className={`px-4 py-2 rounded ${
              testRole === 'member' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Member Role
          </button>
          <button
            onClick={() => changeRole('employer')}
            className={`px-4 py-2 rounded ${
              testRole === 'employer' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Employer Role
          </button>
          <button
            onClick={() => changeRole('community_admin')}
            className={`px-4 py-2 rounded ${
              testRole === 'community_admin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            Community Admin Role
          </button>
          <button
            onClick={() => changeRole('app_admin')}
            className={`px-4 py-2 rounded ${
              testRole === 'app_admin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            App Admin Role
          </button>
        </div>
      </div>

      {/* Community Selector (for Community Admin testing) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Community Selection</h2>
        <select
          value={selectedCommunityId}
          onChange={(e) => setSelectedCommunityId(e.target.value)}
          className="border rounded p-2"
        >
          {testCommunities.map((community) => (
            <option key={community.id} value={community.id}>
              {community.name}
            </option>
          ))}
        </select>
      </div>

      {/* Permission Tests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Permission Tests</h2>

        {/* Platform-wide Permissions (App Admin) */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">
            Platform-wide Permissions
          </h3>
          <div className="space-y-2 ml-4">
            <div className="flex items-center gap-2">
              <span
                className={
                  canManagePlatform ? 'text-green-600' : 'text-red-600'
                }
              >
                ●
              </span>
              Can Manage Platform: {canManagePlatform ? 'Yes' : 'No'}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  canManageAllCommunities ? 'text-green-600' : 'text-red-600'
                }
              >
                ●
              </span>
              Can Manage All Communities:{' '}
              {canManageAllCommunities ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Community-specific Permissions */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">
            Community Permissions (for {selectedCommunityId})
          </h3>
          <div className="space-y-2 ml-4">
            <div className="flex items-center gap-2">
              <span
                className={
                  canManageCommunity ? 'text-green-600' : 'text-red-600'
                }
              >
                ●
              </span>
              Can Manage Community: {canManageCommunity ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Regular Permissions */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Regular Permissions</h3>
          <div className="space-y-2 ml-4">
            <div className="flex items-center gap-2">
              <span className={canReadJobs ? 'text-green-600' : 'text-red-600'}>
                ●
              </span>
              Can Read Jobs: {canReadJobs ? 'Yes' : 'No'}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={canCreateJobs ? 'text-green-600' : 'text-red-600'}
              >
                ●
              </span>
              Can Create Jobs: {canCreateJobs ? 'Yes' : 'No'}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  canManageSettings ? 'text-green-600' : 'text-red-600'
                }
              >
                ●
              </span>
              Can Manage Settings: {canManageSettings ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>

      {/* Protected Content Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Protected Content Examples</h2>

        {/* App Admin Only */}
        {canManagePlatform && (
          <div className="p-4 bg-purple-100 rounded">
            <h3 className="font-semibold">App Admin Dashboard</h3>
            <p>This content is only visible to app admins.</p>
            <div className="mt-2">
              <button className="bg-purple-500 text-white px-3 py-1 rounded text-sm">
                Manage Platform Settings
              </button>
            </div>
          </div>
        )}

        {/* Community Admin Only */}
        {canManageCommunity && (
          <div className="p-4 bg-indigo-100 rounded">
            <h3 className="font-semibold">Community Admin Dashboard</h3>
            <p>This content is visible to community admins and app admins.</p>
            <p className="text-sm text-gray-600">
              Managing: {selectedCommunityId}
            </p>
            <div className="mt-2">
              <button className="bg-indigo-500 text-white px-3 py-1 rounded text-sm">
                Manage Community
              </button>
            </div>
          </div>
        )}

        {/* Employer Only */}
        {hasPermission({ action: 'create', resource: 'jobs' }) && (
          <div className="p-4 bg-green-100 rounded">
            <h3 className="font-semibold">Employer Dashboard</h3>
            <p>
              This content is visible to employers, community admins, and app
              admins.
            </p>
            <div className="mt-2">
              <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                Post New Job
              </button>
            </div>
          </div>
        )}

        {/* Member Only */}
        {hasPermission({ action: 'read', resource: 'jobs' }) && (
          <div className="p-4 bg-blue-100 rounded">
            <h3 className="font-semibold">Member Dashboard</h3>
            <p>This content is visible to all authenticated users.</p>
            <div className="mt-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                View Jobs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
