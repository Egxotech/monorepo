/**
 * System-wide Permission Definitions
 * 
 * Naming Convention: RESOURCE_ACTION
 * Example: USERS_CREATE = "users.create"
 * 
 * Permission Format: "resource.action"
 * - resource: users, posts, roles, system
 * - action: create, read, update, delete, assign
 */

export const PERMISSIONS = {
  // ==========================================
  // USER PERMISSIONS
  // ==========================================
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_BAN: 'users.ban',

  // ==========================================
  // ROLE PERMISSIONS
  // ==========================================
  ROLES_CREATE: 'roles.create',
  ROLES_READ: 'roles.read',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_ASSIGN: 'roles.assign',

  // ==========================================
  // POST PERMISSIONS
  // ==========================================
  POSTS_CREATE: 'posts.create',
  POSTS_READ: 'posts.read',
  POSTS_UPDATE: 'posts.update',
  POSTS_DELETE: 'posts.delete',
  POSTS_PUBLISH: 'posts.publish',

  // ==========================================
  // SYSTEM PERMISSIONS (Admin only)
  // ==========================================
  SYSTEM_ADMIN: 'system.admin',           // Wildcard - all permissions
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_LOGS: 'system.logs',
} as const;

// Type for autocomplete
export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Helper: Get all permission values as array
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// Helper: Check if permission exists
export function isValidPermission(code: string): code is PermissionCode {
  return ALL_PERMISSIONS.includes(code as PermissionCode);
}

// Default permission sets for roles
export const DEFAULT_PERMISSION_SETS = {
  BASIC: [
    PERMISSIONS.POSTS_READ,
    PERMISSIONS.POSTS_CREATE,
    PERMISSIONS.USERS_READ,
  ],
  ADMIN: ALL_PERMISSIONS, // Admin has all permissions
} as const;