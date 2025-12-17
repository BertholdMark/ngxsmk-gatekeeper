import { definePipeline, createMiddleware } from '../helpers';
import { createAuthMiddleware, AuthMiddlewareOptions } from '../middlewares/auth.middleware';
import { createRoleMiddleware, RoleMiddlewareOptions } from '../middlewares/role.middleware';
import { MiddlewareContext, MiddlewareResponse } from '../core';

/**
 * Configuration options for admin preset
 */
export interface AdminPresetOptions {
  /**
   * Authentication middleware options
   */
  auth?: AuthMiddlewareOptions;
  /**
   * Role middleware options
   * Default: { roles: ['admin'], mode: 'any' }
   */
  role?: RoleMiddlewareOptions;
  /**
   * Optional redirect path when access is denied
   */
  redirect?: string;
}

/**
 * Creates an admin preset pipeline
 * 
 * This preset includes both authentication and admin role checks.
 * Users must be authenticated AND have admin role.
 * 
 * @param options - Configuration options for the preset
 * @returns A middleware pipeline for admin access
 * 
 * @example
 * ```typescript
 * // Basic usage (requires 'admin' role)
 * const adminPreset = adminPreset();
 * 
 * // With custom configuration
 * const adminPreset = adminPreset({
 *   auth: {
 *     authPath: 'user.isAuthenticated'
 *   },
 *   role: {
 *     roles: ['admin', 'superadmin'],
 *     mode: 'any'
 *   },
 *   redirect: '/unauthorized'
 * });
 * 
 * // Use in GatekeeperConfig
 * provideGatekeeper({
 *   middlewares: [adminPreset],
 *   onFail: '/login'
 * });
 * ```
 */
export function adminPreset(
  options: AdminPresetOptions = {}
): ReturnType<typeof definePipeline> {
  const { auth = {}, role = { roles: ['admin'], mode: 'any' }, redirect } = options;
  
  const authMiddleware = createAuthMiddleware(auth);
  const roleMiddleware = createRoleMiddleware(role);
  
  // Wrap middlewares to add redirect if specified
  const middlewares = redirect
    ? [
        createMiddleware('authPreset', async (context: MiddlewareContext) => {
          const result = await authMiddleware(context);
          if (typeof result === 'boolean' && !result) {
            return { allow: false, redirect } as MiddlewareResponse;
          }
          if (typeof result === 'object' && result !== null && 'allow' in result && !result.allow) {
            return { allow: false, redirect: (result as MiddlewareResponse).redirect || redirect } as MiddlewareResponse;
          }
          return result;
        }),
        createMiddleware('rolePreset', async (context: MiddlewareContext) => {
          const result = await roleMiddleware(context);
          if (typeof result === 'boolean' && !result) {
            return { allow: false, redirect } as MiddlewareResponse;
          }
          if (typeof result === 'object' && result !== null && 'allow' in result && !result.allow) {
            return { allow: false, redirect: (result as MiddlewareResponse).redirect || redirect } as MiddlewareResponse;
          }
          return result;
        }),
      ]
    : [authMiddleware, roleMiddleware];

  return definePipeline('adminPreset', middlewares);
}

