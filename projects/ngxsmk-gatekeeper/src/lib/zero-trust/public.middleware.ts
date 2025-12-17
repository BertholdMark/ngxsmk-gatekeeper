import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * Special marker middleware that explicitly allows public access
 * 
 * In zero trust mode, this middleware must be used to explicitly mark routes
 * or requests as public. Without this middleware, access will be denied by default.
 * 
 * This middleware always returns true, allowing access regardless of authentication
 * or authorization state.
 * 
 * @returns A middleware function that always allows access
 * 
 * @example
 * ```typescript
 * import { publicMiddleware } from 'ngxsmk-gatekeeper/lib/zero-trust';
 * 
 * // Public route
 * const routes: Routes = [
 *   {
 *     path: 'about',
 *     canActivate: [gatekeeperGuard],
 *     data: {
 *       gatekeeper: {
 *         middlewares: [publicMiddleware()],
 *       },
 *     },
 *   },
 * ];
 * 
 * // Public HTTP request
 * http.get('/api/public/data', {
 *   context: withGatekeeper([publicMiddleware()]),
 * });
 * ```
 */
export function publicMiddleware() {
  return createMiddleware('public', (_context: MiddlewareContext) => {
    return true;
  });
}

