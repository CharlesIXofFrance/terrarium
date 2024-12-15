import { RBACRoute } from '../../components/auth/RBACRoute';
import { useRBAC } from '../../lib/hooks/useRBAC';

export function AdminSettings() {
  const { hasPermission } = useRBAC();

  return (
    <RBACRoute
      requiredPermissions={[
        { action: 'read', resource: 'settings' },
        { action: 'update', resource: 'settings' },
      ]}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
        
        {/* Example of conditional rendering based on permissions */}
        {hasPermission({ action: 'update', resource: 'settings' }) && (
          <button className="bg-primary text-white px-4 py-2 rounded">
            Update Settings
          </button>
        )}

        {/* Settings content */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Community Settings</h2>
          {/* Add your settings form here */}
        </div>
      </div>
    </RBACRoute>
  );
}
