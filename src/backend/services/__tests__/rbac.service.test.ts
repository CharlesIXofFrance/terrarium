import { rbacService } from '../rbac.service';
import type { Role, Permission } from '../../types/rbac.types';

describe('RBAC Service', () => {
  describe('Platform Owner Permissions', () => {
    const role: Role = 'platform_owner';

    it('should grant platform management access', () => {
      const permission: Permission = { action: 'manage', resource: 'platform' };
      expect(rbacService.hasPermission(role, permission)).toBe(true);
    });

    it('should grant access to all community operations', () => {
      const permissions: Permission[] = [
        { action: 'create', resource: 'communities' },
        { action: 'read', resource: 'communities' },
        { action: 'update', resource: 'communities' },
        { action: 'delete', resource: 'communities' },
      ];
      expect(rbacService.hasAllPermissions(role, permissions)).toBe(true);
    });

    it('should grant access to all user operations', () => {
      const permissions: Permission[] = [
        { action: 'create', resource: 'profiles' },
        { action: 'read', resource: 'profiles' },
        { action: 'update', resource: 'profiles' },
        { action: 'delete', resource: 'profiles' },
      ];
      expect(rbacService.hasAllPermissions(role, permissions)).toBe(true);
    });
  });

  describe('Community Owner Permissions', () => {
    const role: Role = 'community_owner';

    it('should grant community management access', () => {
      const permission: Permission = { action: 'manage', resource: 'community' };
      expect(rbacService.hasPermission(role, permission)).toBe(true);
    });

    it('should grant access to all job operations', () => {
      const permissions: Permission[] = [
        { action: 'create', resource: 'jobs' },
        { action: 'read', resource: 'jobs' },
        { action: 'update', resource: 'jobs' },
        { action: 'delete', resource: 'jobs' },
      ];
      expect(rbacService.hasAllPermissions(role, permissions)).toBe(true);
    });

    it('should grant access to all member operations', () => {
      const permissions: Permission[] = [
        { action: 'create', resource: 'members' },
        { action: 'read', resource: 'members' },
        { action: 'update', resource: 'members' },
        { action: 'delete', resource: 'members' },
      ];
      expect(rbacService.hasAllPermissions(role, permissions)).toBe(true);
    });

    it('should not grant platform management access', () => {
      const permission: Permission = { action: 'manage', resource: 'platform' };
      expect(rbacService.hasPermission(role, permission)).toBe(false);
    });
  });

  describe('Member Permissions', () => {
    const role: Role = 'member';

    it('should grant read access to jobs', () => {
      const permission: Permission = { action: 'read', resource: 'jobs' };
      expect(rbacService.hasPermission(role, permission)).toBe(true);
    });

    it('should not grant management access', () => {
      const permissions: Permission[] = [
        { action: 'manage', resource: 'platform' },
        { action: 'manage', resource: 'community' },
      ];
      expect(rbacService.hasAnyPermission(role, permissions)).toBe(false);
    });
  });
});
