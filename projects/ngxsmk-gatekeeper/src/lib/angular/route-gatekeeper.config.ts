import { NgxMiddleware } from '../core';
import { MiddlewarePipeline } from '../helpers';

/**
 * Route-level Gatekeeper configuration
 * 
 * This can be defined in route data to override global middleware for specific routes.
 * 
 * @example
 * ```typescript
 * {
 *   path: 'dashboard',
 *   canActivate: [gatekeeperGuard],
 *   data: {
 *     gatekeeper: {
 *       middlewares: [authMiddleware]
 *     }
 *   }
 * }
 * ```
 */
export interface RouteGatekeeperConfig {
  /**
   * Array of middleware functions and/or pipelines to execute for this route
   * 
   * If provided, this completely overrides the global middleware configuration.
   */
  middlewares: (NgxMiddleware | MiddlewarePipeline)[];
  /**
   * Optional redirect path when middleware fails for this route
   * 
   * If not provided, falls back to global onFail configuration.
   */
  onFail?: string;
}

/**
 * Type guard to check if route data contains gatekeeper configuration
 */
export function hasRouteGatekeeperConfig(
  data: unknown
): data is { gatekeeper: RouteGatekeeperConfig } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'gatekeeper' in data &&
    typeof (data as { gatekeeper: unknown }).gatekeeper === 'object' &&
    (data as { gatekeeper: unknown }).gatekeeper !== null &&
    'middlewares' in ((data as { gatekeeper: unknown }).gatekeeper as Record<string, unknown>)
  );
}

/**
 * Extracts route-level gatekeeper configuration from route data
 */
export function extractRouteGatekeeperConfig(
  route: { data?: unknown }
): RouteGatekeeperConfig | null {
  const data = route.data;
  
  if (hasRouteGatekeeperConfig(data)) {
    return data.gatekeeper;
  }
  
  return null;
}

