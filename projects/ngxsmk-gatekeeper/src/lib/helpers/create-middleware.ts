import { NgxMiddleware, MiddlewareContext, MiddlewareReturn } from '../core';

/**
 * Handler function for middleware that receives context and returns a result
 */
export type MiddlewareHandler = (
  context: MiddlewareContext
) => MiddlewareReturn;

/**
 * Extended middleware type with name metadata
 */
export interface NamedMiddleware extends NgxMiddleware {
  /**
   * Name of the middleware for debugging purposes
   */
  readonly middlewareName: string;
}

/**
 * Creates a middleware function with name metadata for debugging
 *
 * @param name - Name of the middleware for debugging and identification
 * @param handler - Handler function that implements the middleware logic
 * @returns A typed NgxMiddleware with name metadata attached
 *
 * @example
 * ```typescript
 * // Simple boolean return
 * const authMiddleware = createMiddleware('auth', (context) => {
 *   return context.user?.isAuthenticated ?? false;
 * });
 * 
 * // With redirect
 * const upgradeMiddleware = createMiddleware('upgrade', (context) => {
 *   if (!context.user?.isPremium) {
 *     return { allow: false, redirect: '/upgrade' };
 *   }
 *   return true;
 * });
 * ```
 */
export function createMiddleware(
  name: string,
  handler: MiddlewareHandler
): NamedMiddleware {
  const middleware = handler as NamedMiddleware;
  Object.defineProperty(middleware, 'middlewareName', {
    value: name,
    writable: false,
    enumerable: true,
    configurable: false,
  });
  return middleware;
}

