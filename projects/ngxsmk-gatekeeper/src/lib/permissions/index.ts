/**
 * Permission and role matrix exports for ngxsmk-gatekeeper
 * 
 * Provides utilities for permission-based access control with support for:
 * - Resource.action format permissions (e.g., 'invoice.read')
 * - Wildcard permissions (e.g., 'invoice.*', '*.read')
 * - Role-based permissions
 * - Hierarchical roles
 */

export * from './permission.utils';
export * from './role-hierarchy';
export * from './permission.middleware';

