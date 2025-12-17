import { createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

/**
 * Role-based middleware for <%- fileName %>
 * 
 * Checks if the user has the required roles before allowing access.
 * 
 * @example
 * ```typescript
 * // Use in route configuration
 * {
 *   path: '<%= fileName %>',
 *   canActivate: [gatekeeperGuard],
 *   data: {
 *     gatekeeper: {
 *       middlewares: [<%= fileName %>RoleMiddleware]
 *     }
 *   }
 * }
 * ```
 */
export const <%= fileName %>RoleMiddleware = createRoleMiddleware({
  roles: ['admin'], // TODO: Update with your required roles
  mode: 'any', // 'any' = OR, 'all' = AND
  requireUser: true,
});

