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

  // Platform-wide permissions (Platform Owner only)
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
            onClick={() => changeRole('owner')}
            className={`px-4 py-2 rounded ${
              testRole === 'owner' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Community Owner Role
          </button>
          <button
            onClick={() => changeRole('platform_owner')}
            className={`px-4 py-2 rounded ${
              testRole === 'platform_owner'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            Platform Owner Role
          </button>
        </div>
      </div>

      {/* Community Selector (for Community Owner testing) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Community Selection</h2>
        <select
          value={selectedCommunityId}
          onChange={(e) => setSelectedCommunityId(e.target.value)}
          className="p-2 border rounded"
        >
          {testCommunities.map((community) => (
            <option key={community.id} value={community.id}>
              {community.name}
            </option>
          ))}
        </select>
      </div>

      {/* Platform-wide Permissions (Platform Owner) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Platform-wide Permissions
        </h2>
        <div className="space-y-4">
          <div
            className={`p-4 rounded ${
              canManagePlatform ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <p>Can Manage Platform: {canManagePlatform ? 'Yes' : 'No'}</p>
          </div>
          <div
            className={`p-4 rounded ${
              canManageAllCommunities ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <p>
              Can Manage All Communities:{' '}
              {canManageAllCommunities ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* Community-specific Permissions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Community-specific Permissions
        </h2>
        <div className="space-y-4">
          <div
            className={`p-4 rounded ${
              canManageCommunity ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <p>Can Manage Community: {canManageCommunity ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Regular Permissions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Regular Permissions</h2>
        <div className="space-y-4">
          <div
            className={`p-4 rounded ${
              canReadJobs ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <p>Can Read Jobs: {canReadJobs ? 'Yes' : 'No'}</p>
          </div>
          <div
            className={`p-4 rounded ${
              canCreateJobs ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <p>Can Create Jobs: {canCreateJobs ? 'Yes' : 'No'}</p>
          </div>
          <div
            className={`p-4 rounded ${
              canManageSettings ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <p>Can Manage Settings: {canManageSettings ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Platform Owner Only */}
      {canManagePlatform && (
        <div className="mb-8 p-4 bg-blue-100 rounded">
          <h3 className="font-semibold">Platform Owner Dashboard</h3>
          <p>This content is only visible to platform owners.</p>
        </div>
      )}

      {/* Community Owner Only */}
      {canManageCommunity && (
        <div className="mb-8 p-4 bg-green-100 rounded">
          <h3 className="font-semibold">Community Owner Dashboard</h3>
          <p>
            This content is visible to community owners and platform owners.
          </p>
        </div>
      )}

      {/* Employer Only */}
      {canCreateJobs && (
        <div className="mb-8 p-4 bg-yellow-100 rounded">
          <h3 className="font-semibold">Employer Dashboard</h3>
          <p>
            This content is visible to employers, community owners, and platform
            owners.
          </p>
        </div>
      )}
    </div>
  );
}
