/**
 * Role hierarchy utilities for hierarchical role checking
 */

/**
 * Role hierarchy configuration
 * 
 * Defines parent-child relationships between roles.
 * Child roles inherit permissions from parent roles.
 * 
 * @example
 * ```typescript
 * const hierarchy: RoleHierarchy = {
 *   'superadmin': ['admin', 'manager', 'user'],
 *   'admin': ['manager', 'user'],
 *   'manager': ['user'],
 *   'user': [],
 * };
 * ```
 */
export interface RoleHierarchy {
  /**
   * Map of role name to array of parent roles
   * Parent roles are roles that this role inherits from
   */
  [roleName: string]: string[];
}

/**
 * Resolves all roles for a user including inherited roles from hierarchy
 * 
 * @param userRoles - Array of roles the user has
 * @param hierarchy - Role hierarchy configuration
 * @returns Array of all roles including inherited roles
 * 
 * @example
 * ```typescript
 * const hierarchy: RoleHierarchy = {
 *   'admin': ['manager', 'user'],
 *   'manager': ['user'],
 * };
 * 
 * resolveRoles(['admin'], hierarchy)
 * // Returns: ['admin', 'manager', 'user']
 * 
 * resolveRoles(['manager'], hierarchy)
 * // Returns: ['manager', 'user']
 * ```
 */
export function resolveRoles(
  userRoles: string[],
  hierarchy?: RoleHierarchy
): string[] {
  if (!Array.isArray(userRoles)) {
    return [];
  }

  if (!hierarchy || Object.keys(hierarchy).length === 0) {
    return [...userRoles];
  }

  const resolvedRoles = new Set<string>(userRoles);
  const processed = new Set<string>();

  /**
   * Recursively adds parent roles
   */
  function addParentRoles(role: string): void {
    if (processed.has(role)) {
      return; // Avoid infinite loops
    }
    processed.add(role);

    if (!hierarchy) return;
    const parents = hierarchy[role];
    if (Array.isArray(parents)) {
      for (const parent of parents) {
        if (!resolvedRoles.has(parent)) {
          resolvedRoles.add(parent);
          addParentRoles(parent); // Recursively add parent's parents
        }
      }
    }
  }

  // Process all user roles
  for (const role of userRoles) {
    addParentRoles(role);
  }

  return Array.from(resolvedRoles);
}

/**
 * Checks if a user has a role, considering role hierarchy
 * 
 * @param userRoles - Array of roles the user has
 * @param requiredRole - Role to check for
 * @param hierarchy - Optional role hierarchy configuration
 * @returns true if user has the role or inherits it
 * 
 * @example
 * ```typescript
 * const hierarchy: RoleHierarchy = {
 *   'admin': ['manager', 'user'],
 * };
 * 
 * hasRole(['admin'], 'manager', hierarchy) // true (admin inherits manager)
 * hasRole(['admin'], 'user', hierarchy)    // true (admin inherits user)
 * hasRole(['manager'], 'admin', hierarchy) // false
 * ```
 */
export function hasRole(
  userRoles: string[],
  requiredRole: string,
  hierarchy?: RoleHierarchy
): boolean {
  if (!Array.isArray(userRoles) || !requiredRole) {
    return false;
  }

  // Direct role check
  if (userRoles.includes(requiredRole)) {
    return true;
  }

  // Check hierarchy if provided
  if (hierarchy) {
    const resolvedRoles = resolveRoles(userRoles, hierarchy);
    return resolvedRoles.includes(requiredRole);
  }

  return false;
}

/**
 * Checks if a user has any of the required roles, considering role hierarchy
 * 
 * @param userRoles - Array of roles the user has
 * @param requiredRoles - Array of roles to check for
 * @param hierarchy - Optional role hierarchy configuration
 * @returns true if user has at least one required role
 */
export function hasAnyRole(
  userRoles: string[],
  requiredRoles: string[],
  hierarchy?: RoleHierarchy
): boolean {
  if (!Array.isArray(userRoles) || !Array.isArray(requiredRoles)) {
    return false;
  }

  const resolvedRoles = hierarchy ? resolveRoles(userRoles, hierarchy) : userRoles;

  return requiredRoles.some((role) => resolvedRoles.includes(role));
}

/**
 * Checks if a user has all of the required roles, considering role hierarchy
 * 
 * @param userRoles - Array of roles the user has
 * @param requiredRoles - Array of roles to check for
 * @param hierarchy - Optional role hierarchy configuration
 * @returns true if user has all required roles
 */
export function hasAllRoles(
  userRoles: string[],
  requiredRoles: string[],
  hierarchy?: RoleHierarchy
): boolean {
  if (!Array.isArray(userRoles) || !Array.isArray(requiredRoles)) {
    return false;
  }

  const resolvedRoles = hierarchy ? resolveRoles(userRoles, hierarchy) : userRoles;

  return requiredRoles.every((role) => resolvedRoles.includes(role));
}

