/**
 * Permission utilities for parsing and matching permissions
 */

/**
 * Parses a permission string into resource and action parts
 * 
 * @param permission - Permission string in format "resource.action" (e.g., "invoice.read")
 * @returns Object with resource and action, or null if invalid format
 * 
 * @example
 * ```typescript
 * parsePermission('invoice.read') // { resource: 'invoice', action: 'read' }
 * parsePermission('user.write')  // { resource: 'user', action: 'write' }
 * parsePermission('invalid')     // null
 * ```
 */
export function parsePermission(permission: string): { resource: string; action: string } | null {
  if (typeof permission !== 'string' || !permission.includes('.')) {
    return null;
  }

  const parts = permission.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [resource, action] = parts;
  if (!resource || !action) {
    return null;
  }

  return { resource, action };
}

/**
 * Checks if a permission matches a pattern (supports wildcards)
 * 
 * @param permission - Permission to check (e.g., "invoice.read")
 * @param pattern - Pattern to match (e.g., "invoice.*", "*.read", "invoice.read")
 * @returns true if permission matches the pattern
 * 
 * @example
 * ```typescript
 * matchesPermission('invoice.read', 'invoice.*')  // true
 * matchesPermission('invoice.write', 'invoice.*') // true
 * matchesPermission('invoice.read', '*.read')      // true
 * matchesPermission('user.read', '*.read')       // true
 * matchesPermission('invoice.read', 'invoice.read') // true
 * matchesPermission('invoice.read', 'user.*')     // false
 * ```
 */
export function matchesPermission(permission: string, pattern: string): boolean {
  if (permission === pattern) {
    return true;
  }

  // Handle wildcards
  if (pattern.includes('*')) {
    const permissionParts = parsePermission(permission);
    const patternParts = parsePermission(pattern);

    if (!permissionParts || !patternParts) {
      return false;
    }

    // Resource wildcard: *.action
    if (patternParts.resource === '*' && patternParts.action === permissionParts.action) {
      return true;
    }

    // Action wildcard: resource.*
    if (patternParts.action === '*' && patternParts.resource === permissionParts.resource) {
      return true;
    }

    // Full wildcard: *.* (matches everything)
    if (patternParts.resource === '*' && patternParts.action === '*') {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a user has any of the required permissions
 * 
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermissions - Array of required permissions (supports wildcards)
 * @returns true if user has at least one required permission
 * 
 * @example
 * ```typescript
 * hasPermission(
 *   ['invoice.read', 'invoice.write'],
 *   ['invoice.read']
 * ) // true
 * 
 * hasPermission(
 *   ['invoice.read'],
 *   ['invoice.*']
 * ) // true (wildcard match)
 * 
 * hasPermission(
 *   ['invoice.read'],
 *   ['user.read']
 * ) // false
 * ```
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) {
    return false;
  }

  // Check if user has any of the required permissions
  for (const required of requiredPermissions) {
    // Direct match
    if (userPermissions.includes(required)) {
      return true;
    }

    // Wildcard pattern match
    for (const userPerm of userPermissions) {
      if (matchesPermission(userPerm, required)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if a user has all of the required permissions
 * 
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermissions - Array of required permissions (supports wildcards)
 * @returns true if user has all required permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) {
    return false;
  }

  // Check if user has all required permissions
  return requiredPermissions.every((required) => {
    // Direct match
    if (userPermissions.includes(required)) {
      return true;
    }

    // Wildcard pattern match
    return userPermissions.some((userPerm) => matchesPermission(userPerm, required));
  });
}

