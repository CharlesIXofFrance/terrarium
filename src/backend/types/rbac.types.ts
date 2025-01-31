export type Role = 'admin' | 'owner' | 'member' | 'employer';

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  resource:
    | 'jobs'
    | 'profiles'
    | 'community'
    | 'settings'
    | 'members'
    | 'communities'
    | 'platform';
}

export interface RolePermissions {
  [role: string]: Permission[];
}

export const DEFAULT_ROLE = 'member';

export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    // Full access to everything including platform management
    { action: 'manage', resource: 'platform' }, // Special permission for platform-wide settings
    { action: 'create', resource: 'communities' },
    { action: 'read', resource: 'communities' },
    { action: 'update', resource: 'communities' },
    { action: 'delete', resource: 'communities' },
    { action: 'create', resource: 'jobs' },
    { action: 'read', resource: 'jobs' },
    { action: 'update', resource: 'jobs' },
    { action: 'delete', resource: 'jobs' },
    { action: 'create', resource: 'profiles' },
    { action: 'read', resource: 'profiles' },
    { action: 'update', resource: 'profiles' },
    { action: 'delete', resource: 'profiles' },
    { action: 'create', resource: 'settings' },
    { action: 'read', resource: 'settings' },
    { action: 'update', resource: 'settings' },
    { action: 'delete', resource: 'settings' },
    { action: 'create', resource: 'members' },
    { action: 'read', resource: 'members' },
    { action: 'update', resource: 'members' },
    { action: 'delete', resource: 'members' },
  ],
  owner: [
    // Full access to their community's resources
    { action: 'create', resource: 'jobs' },
    { action: 'read', resource: 'jobs' },
    { action: 'update', resource: 'jobs' },
    { action: 'delete', resource: 'jobs' },
    { action: 'create', resource: 'members' },
    { action: 'read', resource: 'members' },
    { action: 'update', resource: 'members' },
    { action: 'delete', resource: 'members' },
    { action: 'create', resource: 'community' },
    { action: 'read', resource: 'community' },
    { action: 'update', resource: 'community' },
  ],
  member: [
    { action: 'read', resource: 'jobs' },
    { action: 'read', resource: 'profiles' },
    { action: 'read', resource: 'community' },
  ],
  employer: [
    { action: 'create', resource: 'jobs' },
    { action: 'read', resource: 'jobs' },
    { action: 'update', resource: 'jobs' },
    { action: 'read', resource: 'profiles' },
  ],
};
