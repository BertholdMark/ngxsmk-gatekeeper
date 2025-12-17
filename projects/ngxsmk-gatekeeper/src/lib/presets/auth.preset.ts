import { definePipeline, createMiddleware } from '../helpers';
import { createAuthMiddleware, AuthMiddlewareOptions } from '../middlewares/auth.middleware';
import { MiddlewareContext, MiddlewareResponse } from '../core';

/**
 * Configuration options for authentication preset
 */
export interface AuthPresetOptions extends AuthMiddlewareOptions {
  /**
   * Optional redirect path when authentication fails
   */
  redirect?: string;
}

/**
 * Creates an authentication preset pipeline
 * 
 * This preset includes authentication middleware to ensure users are authenticated.
 * 
 * @param options - Configuration options for the preset
 * @returns A middleware pipeline for authentication
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const authPreset = authPreset();
 * 
 * // With custom configuration
 * const authPreset = authPreset({
 *   authPath: 'user.isAuthenticated',
 *   requireUser: true,
 *   redirect: '/login'
 * });
 * 
 * // Use in GatekeeperConfig
 * provideGatekeeper({
 *   middlewares: [authPreset],
 *   onFail: '/login'
 * });
 * ```
 */
export function authPreset(
  options: AuthPresetOptions = {}
): ReturnType<typeof definePipeline> {
  const { redirect, ...authOptions } = options;
  
  const authMiddleware = createAuthMiddleware(authOptions);
  
  // If redirect is specified, wrap middleware to return redirect
  const middleware = redirect
    ? createMiddleware('authPreset', async (context: MiddlewareContext) => {
        const result = await authMiddleware(context);
        if (typeof result === 'boolean' && !result) {
          return { allow: false, redirect } as MiddlewareResponse;
        }
        if (typeof result === 'object' && result !== null && 'allow' in result && !result.allow) {
          return { allow: false, redirect: (result as MiddlewareResponse).redirect || redirect } as MiddlewareResponse;
        }
        return result;
      })
    : authMiddleware;

  return definePipeline('authPreset', [middleware]);
}

