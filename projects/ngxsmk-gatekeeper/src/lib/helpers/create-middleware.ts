import { MiddlewareContext, MiddlewareReturn, MiddlewarePriority, PrioritizedMiddleware } from '../core';

/**
 * Handler function for middleware that receives context and returns a result
 */
export type MiddlewareHandler = (
  context: MiddlewareContext
) => MiddlewareReturn;

/**
 * Extended middleware type with name and priority metadata
 */
export interface NamedMiddleware extends PrioritizedMiddleware {
  /**
   * Name of the middleware for debugging purposes
   */
  readonly middlewareName: string;
}

/**
 * Options for creating middleware
 */
export interface CreateMiddlewareOptions {
  /**
   * Priority of the middleware
   * Higher priority middleware executes first
   * Default: MiddlewarePriority.Normal
   */
  priority?: MiddlewarePriority;
}

/**
 * Creates a middleware function with name and priority metadata
 *
 * @param name - Name of the middleware for debugging and identification
 * @param handler - Handler function that implements the middleware logic
 * @param options - Optional configuration including priority
 * @returns A typed NgxMiddleware with name and priority metadata attached
 *
 * @example
 * ```typescript
 * // Simple boolean return with default priority
 * const authMiddleware = createMiddleware('auth', (context) => {
 *   return context['user']?.isAuthenticated ?? false;
 * });
 * 
 * // With high priority
 * const securityMiddleware = createMiddleware('security', (context) => {
 *   return checkSecurity(context);
 * }, { priority: MiddlewarePriority.High });
 * 
 * // With redirect
 * const upgradeMiddleware = createMiddleware('upgrade', (context) => {
 *   if (!context['user']?.isPremium) {
 *     return { allow: false, redirect: '/upgrade' };
 *   }
 *   return true;
 * });
 * ```
 */
export function createMiddleware(
  name: string,
  handler: MiddlewareHandler,
  options?: CreateMiddlewareOptions
): NamedMiddleware {
  const middleware = handler as NamedMiddleware;
  const priority = options?.priority ?? MiddlewarePriority.Normal;
  
  Object.defineProperty(middleware, 'middlewareName', {
    value: name,
    writable: false,
    enumerable: true,
    configurable: false,
  });
  
  Object.defineProperty(middleware, 'priority', {
    value: priority,
    writable: false,
    enumerable: true,
    configurable: false,
  });
  
  return middleware;
}

