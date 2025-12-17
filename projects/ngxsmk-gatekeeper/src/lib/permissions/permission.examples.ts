/**
 * Example permission configurations
 * 
 * These are examples showing how to use the permission middleware.
 * They are not exported by default - copy and adapt for your use case.
 */

import { permissionMiddleware } from './permission.middleware';
import { RoleHierarchy } from './role-hierarchy';

/**
 * Example: Simple permission check
 */
export const invoiceReadExample = permissionMiddleware(['invoice.read']);

/**
 * Example: Multiple permissions (any)
 */
export const invoiceAccessExample = permissionMiddleware([
  'invoice.read',
  'invoice.write',
]);

/**
 * Example: All permissions required
 */
export const strictInvoiceExample = permissionMiddleware({
  permissions: ['invoice.read', 'invoice.write'],
  mode: 'all',
});

/**
 * Example: Wildcard permissions
 */
export const invoiceAllActionsExample = permissionMiddleware(['invoice.*']);

/**
 * Example: All read permissions
 */
export const allReadPermissionsExample = permissionMiddleware(['*.read']);

/**
 * Example: Role-based permissions
 */
export const roleBasedExample = permissionMiddleware({
  permissions: ['invoice.read'],
  rolePermissions: {
    admin: ['*.*'], // Admin has all permissions
    manager: ['invoice.*', 'user.read'],
    user: ['invoice.read'],
  },
});

/**
 * Example: Hierarchical roles
 */
const hierarchicalRolePermissions: RoleHierarchy = {
  superadmin: ['admin', 'manager', 'user'],
  admin: ['manager', 'user'],
  manager: ['user'],
  user: [],
};

export const hierarchicalExample = permissionMiddleware({
  permissions: ['invoice.write'],
  rolePermissions: {
    superadmin: ['*.*'],
    admin: ['invoice.*', 'user.*'],
    manager: ['invoice.read', 'user.read'],
    user: ['invoice.read'],
  },
  roleHierarchy: hierarchicalRolePermissions,
});

/**
 * Example: Complex permission matrix
 * 
 * This example shows a comprehensive permission system with:
 * - Multiple resources (invoice, user, report)
 * - Multiple actions (read, write, delete)
 * - Role hierarchy
 * - Wildcard support
 */
export const complexPermissionMatrix = permissionMiddleware({
  permissions: ['invoice.write', 'user.read'],
  permissionsPath: 'user.permissions',
  rolesPath: 'user.roles',
  rolePermissions: {
    // Super admin has all permissions
    superadmin: ['*.*'],
    
    // Admin has full access to invoices and users, read-only for reports
    admin: ['invoice.*', 'user.*', 'report.read'],
    
    // Manager can read/write invoices, read users, no report access
    manager: ['invoice.read', 'invoice.write', 'user.read'],
    
    // User can only read invoices
    user: ['invoice.read'],
  },
  roleHierarchy: {
    superadmin: ['admin', 'manager', 'user'],
    admin: ['manager', 'user'],
    manager: ['user'],
    user: [],
  },
  mode: 'any', // User needs at least one of the required permissions
  redirect: '/unauthorized',
});

