export type Role = 'admin' | 'member' | 'employer';

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: 'jobs' | 'profiles' | 'community' | 'settings' | 'members';
}

export interface RolePermissions {
  [role: string]: Permission[];
}

export const DEFAULT_ROLE = 'member';

export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    // Full access to everything
    { action: 'create', resource: 'jobs' },
    { action: 'read', resource: 'jobs' },
    { action: 'update', resource: 'jobs' },
    { action: 'delete', resource: 'jobs' },
    { action: 'create', resource: 'profiles' },
    { action: 'read', resource: 'profiles' },
    { action: 'update', resource: 'profiles' },
    { action: 'delete', resource: 'profiles' },
    { action: 'create', resource: 'community' },
    { action: 'read', resource: 'community' },
    { action: 'update', resource: 'community' },
    { action: 'delete', resource: 'community' },
    { action: 'create', resource: 'settings' },
    { action: 'read', resource: 'settings' },
    { action: 'update', resource: 'settings' },
    { action: 'delete', resource: 'settings' },
    { action: 'create', resource: 'members' },
    { action: 'read', resource: 'members' },
    { action: 'update', resource: 'members' },
    { action: 'delete', resource: 'members' },
  ],
  employer: [
    // Can manage their own jobs and view profiles
    { action: 'create', resource: 'jobs' },
    { action: 'read', resource: 'jobs' },
    { action: 'update', resource: 'jobs' },
    { action: 'delete', resource: 'jobs' },
    { action: 'read', resource: 'profiles' },
    { action: 'read', resource: 'community' },
  ],
  member: [
    // Can manage their own profile and view jobs
    { action: 'read', resource: 'jobs' },
    { action: 'create', resource: 'profiles' },
    { action: 'read', resource: 'profiles' },
    { action: 'update', resource: 'profiles' },
    { action: 'read', resource: 'community' },
  ],
};
