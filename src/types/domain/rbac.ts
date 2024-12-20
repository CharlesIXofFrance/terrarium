export type Role = 'admin' | 'moderator' | 'member' | 'guest';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface RoleDefinition {
  name: Role;
  permissions: Permission[];
  inherits?: Role[];
}

export interface UserRole {
  user_id: string;
  role: Role;
  community_id: string;
}

export interface AccessControl {
  can: (permission: string) => boolean;
  hasRole: (role: Role) => boolean;
  getRoles: () => Role[];
  getPermissions: () => Permission[];
}

export const DEFAULT_ROLES: Record<Role, RoleDefinition> = {
  admin: {
    name: 'admin',
    permissions: [
      {
        id: 'all',
        name: 'all',
        description: 'Full access',
        resource: '*',
        action: 'manage',
      },
    ],
  },
  moderator: {
    name: 'moderator',
    permissions: [
      {
        id: 'content_manage',
        name: 'content_manage',
        description: 'Manage content',
        resource: 'content',
        action: 'manage',
      },
      {
        id: 'users_read',
        name: 'users_read',
        description: 'View users',
        resource: 'users',
        action: 'read',
      },
    ],
    inherits: ['member'],
  },
  member: {
    name: 'member',
    permissions: [
      {
        id: 'content_read',
        name: 'content_read',
        description: 'View content',
        resource: 'content',
        action: 'read',
      },
      {
        id: 'profile_manage',
        name: 'profile_manage',
        description: 'Manage own profile',
        resource: 'profile',
        action: 'manage',
      },
    ],
  },
  guest: {
    name: 'guest',
    permissions: [
      {
        id: 'content_read_public',
        name: 'content_read_public',
        description: 'View public content',
        resource: 'content',
        action: 'read',
      },
    ],
  },
};
