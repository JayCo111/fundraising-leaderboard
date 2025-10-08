// packages/core/src/rbac/index.ts
import { Role, Permission, UserScopes } from '../types';

export class RBACService {
  private static readonly ROLE_HIERARCHY: Record<Role, Role[]> = {
    OWNER: ['CEO', 'REGIONAL_DIRECTOR', 'STATE_DIRECTOR', 'TERRITORY_DIRECTOR', 'SALES_REP', 'ORG_OWNER', 'PROGRAM_DIRECTOR', 'HEAD_COACH', 'PARENT_STUDENT'],
    CEO: ['REGIONAL_DIRECTOR', 'STATE_DIRECTOR', 'TERRITORY_DIRECTOR', 'SALES_REP', 'ORG_OWNER', 'PROGRAM_DIRECTOR', 'HEAD_COACH', 'PARENT_STUDENT'],
    REGIONAL_DIRECTOR: ['STATE_DIRECTOR', 'TERRITORY_DIRECTOR', 'SALES_REP', 'ORG_OWNER', 'PROGRAM_DIRECTOR', 'HEAD_COACH', 'PARENT_STUDENT'],
    STATE_DIRECTOR: ['TERRITORY_DIRECTOR', 'SALES_REP', 'ORG_OWNER', 'PROGRAM_DIRECTOR', 'HEAD_COACH', 'PARENT_STUDENT'],
    TERRITORY_DIRECTOR: ['SALES_REP', 'ORG_OWNER', 'PROGRAM_DIRECTOR', 'HEAD_COACH', 'PARENT_STUDENT'],
    SALES_REP: ['ORG_OWNER', 'PROGRAM_DIRECTOR', 'HEAD_COACH', 'PARENT_STUDENT'],
    ORG_OWNER: ['PROGRAM_DIRECTOR', 'HEAD_COACH', 'PARENT_STUDENT'],
    PROGRAM_DIRECTOR: ['HEAD_COACH', 'PARENT_STUDENT'],
    HEAD_COACH: ['PARENT_STUDENT'],
    PARENT_STUDENT: []
  };

  private static readonly ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    OWNER: [
      { resource: '*', action: '*' }, // Can do everything
    ],
    CEO: [
      { resource: 'users', action: 'read', scope: { type: 'national' } },
      { resource: 'users', action: 'update', scope: { type: 'national' } },
      { resource: 'organizations', action: 'read', scope: { type: 'national' } },
      { resource: 'organizations', action: 'update', scope: { type: 'national' } },
      { resource: 'campaigns', action: '*', scope: { type: 'national' } },
      { resource: 'leaderboards', action: 'read', scope: { type: 'national' } },
      { resource: 'payouts', action: '*', scope: { type: 'national' } },
      { resource: 'messages', action: 'send', scope: { type: 'national' } },
      { resource: 'exports', action: '*', scope: { type: 'national' } },
    ],
    REGIONAL_DIRECTOR: [
      { resource: 'users', action: 'read', scope: { type: 'region' } },
      { resource: 'organizations', action: 'read', scope: { type: 'region' } },
      { resource: 'campaigns', action: 'read', scope: { type: 'region' } },
      { resource: 'leaderboards', action: 'read', scope: { type: 'region' } },
      { resource: 'messages', action: 'send', scope: { type: 'region' } },
    ],
    STATE_DIRECTOR: [
      { resource: 'users', action: 'read', scope: { type: 'state' } },
      { resource: 'organizations', action: 'read', scope: { type: 'state' } },
      { resource: 'campaigns', action: 'read', scope: { type: 'state' } },
      { resource: 'leaderboards', action: 'read', scope: { type: 'state' } },
      { resource: 'messages', action: 'send', scope: { type: 'state' } },
    ],
    TERRITORY_DIRECTOR: [
      { resource: 'users', action: 'read', scope: { type: 'territory' } },
      { resource: 'organizations', action: 'read', scope: { type: 'territory' } },
      { resource: 'campaigns', action: 'read', scope: { type: 'territory' } },
      { resource: 'leaderboards', action: 'read', scope: { type: 'territory' } },
      { resource: 'messages', action: 'send', scope: { type: 'territory' } },
    ],
    SALES_REP: [
      { resource: 'prospects', action: '*', scope: { type: 'territory' } },
      { resource: 'organizations', action: 'read', scope: { type: 'territory' } },
      { resource: 'messages', action: 'send', scope: { type: 'territory' } },
      { resource: 'leaderboards', action: 'read', scope: { type: 'territory' } },
    ],
    ORG_OWNER: [
      { resource: 'users', action: 'read', scope: { type: 'org' } },
      { resource: 'programs', action: '*', scope: { type: 'org' } },
      { resource: 'teams', action: '*', scope: { type: 'org' } },
      { resource: 'campaigns', action: '*', scope: { type: 'org' } },
      { resource: 'prospects', action: '*', scope: { type: 'org' } },
      { resource: 'leaderboards', action: 'read', scope: { type: 'org' } },
      { resource: 'messages', action: 'send', scope: { type: 'org' } },
    ],
    PROGRAM_DIRECTOR: [
      { resource: 'users', action: 'read', scope: { type: 'program' } },
      { resource: 'teams', action: '*', scope: { type: 'program' } },
      { resource: 'campaigns', action: '*', scope: { type: 'program' } },
      { resource: 'prospects', action: '*', scope: { type: 'program' } },
      { resource: 'leaderboards', action: 'read', scope: { type: 'program' } },
      { resource: 'messages', action: 'send', scope: { type: 'program' } },
    ],
    HEAD_COACH: [
      { resource: 'users', action: 'read', scope: { type: 'team' } },
      { resource: 'athlete_profiles', action: '*', scope: { type: 'team' } },
      { resource: 'campaigns', action: 'read', scope: { type: 'team' } },
      { resource: 'prospects', action: '*', scope: { type: 'team' } },
      { resource: 'leaderboards', action: 'read', scope: { type: 'program' } }, // Can see peer teams
      { resource: 'messages', action: 'send', scope: { type: 'team' } },
    ],
    PARENT_STUDENT: [
      { resource: 'users', action: 'read', scope: { type: 'team' } },
      { resource: 'leaderboards', action: 'read', scope: { type: 'program' } },
      { resource: 'prospects', action: 'create', scope: { type: 'team' } },
      { resource: 'prospects', action: 'read', scope: { type: 'team' } },
    ],
  };

  /**
   * Check if a user has permission to perform an action on a resource
   */
  static hasPermission(
    userRole: Role,
    userScopes: UserScopes,
    resource: string,
    action: string,
    targetScope?: { type: string; id?: string }
  ): boolean {
    const permissions = this.ROLE_PERMISSIONS[userRole] || [];
    
    // Check for exact permission match
    for (const permission of permissions) {
      if (this.matchesPermission(permission, resource, action, userScopes, targetScope)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get all permissions for a user role
   */
  static getPermissions(userRole: Role): Permission[] {
    return this.ROLE_PERMISSIONS[userRole] || [];
  }

  /**
   * Check if a user can manage another user based on role hierarchy
   */
  static canManageUser(managerRole: Role, targetRole: Role): boolean {
    const manageableRoles = this.ROLE_HIERARCHY[managerRole] || [];
    return manageableRoles.includes(targetRole);
  }

  /**
   * Get the scope ID for a user based on their role and scopes
   */
  static getScopeId(userScopes: UserScopes, scopeType: string): string | undefined {
    switch (scopeType) {
      case 'org':
        return userScopes.org_id;
      case 'program':
        return userScopes.program_id;
      case 'team':
        return userScopes.team_id;
      case 'territory':
        return userScopes.territory_id;
      case 'state':
        return userScopes.state_code;
      case 'region':
        return userScopes.region_code;
      default:
        return undefined;
    }
  }

  /**
   * Check if a user can access a specific scope
   */
  static canAccessScope(
    userScopes: UserScopes,
    targetScope: { type: string; id?: string }
  ): boolean {
    const userScopeId = this.getScopeId(userScopes, targetScope.type);
    
    if (!userScopeId || !targetScope.id) {
      return false;
    }
    
    // For hierarchical scopes, check if user's scope contains the target scope
    switch (targetScope.type) {
      case 'national':
        return true; // Everyone can see national scope
      case 'region':
        return userScopes.region_code === targetScope.id;
      case 'state':
        return userScopes.state_code === targetScope.id;
      case 'territory':
        return userScopes.territory_id === targetScope.id;
      case 'org':
        return userScopes.org_id === targetScope.id;
      case 'program':
        return userScopes.program_id === targetScope.id;
      case 'team':
        return userScopes.team_id === targetScope.id;
      default:
        return false;
    }
  }

  /**
   * Private helper to check if a permission matches the requested resource/action
   */
  private static matchesPermission(
    permission: Permission,
    resource: string,
    action: string,
    userScopes: UserScopes,
    targetScope?: { type: string; id?: string }
  ): boolean {
    // Check resource match
    if (permission.resource !== '*' && permission.resource !== resource) {
      return false;
    }
    
    // Check action match
    if (permission.action !== '*' && permission.action !== action) {
      return false;
    }
    
    // Check scope match
    if (permission.scope && targetScope) {
      if (permission.scope.type !== targetScope.type) {
        return false;
      }
      
      if (permission.scope.id && permission.scope.id !== targetScope.id) {
        return false;
      }
      
      // Check if user can access this scope
      if (!this.canAccessScope(userScopes, targetScope)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get the effective scope for a user based on their role
   */
  static getEffectiveScope(userScopes: UserScopes): { type: string; id?: string } {
    // Return the most specific scope the user has access to
    if (userScopes.team_id) {
      return { type: 'team', id: userScopes.team_id };
    }
    if (userScopes.program_id) {
      return { type: 'program', id: userScopes.program_id };
    }
    if (userScopes.org_id) {
      return { type: 'org', id: userScopes.org_id };
    }
    if (userScopes.territory_id) {
      return { type: 'territory', id: userScopes.territory_id };
    }
    if (userScopes.state_code) {
      return { type: 'state', id: userScopes.state_code };
    }
    if (userScopes.region_code) {
      return { type: 'region', id: userScopes.region_code };
    }
    
    return { type: 'national' };
  }
}

export default RBACService;
