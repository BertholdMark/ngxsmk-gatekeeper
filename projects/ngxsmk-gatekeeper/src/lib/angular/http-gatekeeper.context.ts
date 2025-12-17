import { HttpContext, HttpContextToken, HttpRequest } from '@angular/common/http';
import { NgxMiddleware } from '../core';
import { MiddlewarePipeline } from '../helpers';

/**
 * HttpContext token for storing request-specific middleware
 */
export const GATEKEEPER_MIDDLEWARE = new HttpContextToken<
  (NgxMiddleware | MiddlewarePipeline)[]
>(() => []);

/**
 * HttpContext token for storing request-specific onFail redirect
 */
export const GATEKEEPER_ON_FAIL = new HttpContextToken<string | undefined>(
  () => undefined
);

/**
 * Creates an HttpContext with gatekeeper middleware for a specific HTTP request
 * 
 * This allows you to override global middleware on a per-request basis.
 * 
 * @param middlewares - Array of middleware functions and/or pipelines to execute for this request
 * @param onFail - Optional redirect path when middleware fails (overrides global onFail)
 * @returns HttpContext that can be passed to HTTP request options
 * 
 * @example
 * ```typescript
 * http.get('/api/data', {
 *   context: withGatekeeper([featureFlagMiddleware('beta')])
 * });
 * 
 * // With custom redirect
 * http.post('/api/admin', data, {
 *   context: withGatekeeper([adminPipeline], '/unauthorized')
 * });
 * ```
 */
export function withGatekeeper(
  middlewares: (NgxMiddleware | MiddlewarePipeline)[],
  onFail?: string
): HttpContext {
  const context = new HttpContext();
  context.set(GATEKEEPER_MIDDLEWARE, middlewares);
  if (onFail !== undefined) {
    context.set(GATEKEEPER_ON_FAIL, onFail);
  }
  return context;
}

/**
 * Extracts gatekeeper middleware from HTTP request context
 */
export function getRequestGatekeeperMiddleware(
  request: HttpRequest<unknown>
): (NgxMiddleware | MiddlewarePipeline)[] | null {
  const middleware = request.context.get(GATEKEEPER_MIDDLEWARE);
  return middleware && middleware.length > 0 ? middleware : null;
}

/**
 * Extracts gatekeeper onFail from HTTP request context
 */
export function getRequestGatekeeperOnFail(
  request: HttpRequest<unknown>
): string | null {
  const onFail = request.context.get(GATEKEEPER_ON_FAIL);
  return onFail || null;
}

