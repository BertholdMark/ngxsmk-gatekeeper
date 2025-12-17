/**
 * Hook priority levels
 */
export enum MiddlewarePriority {
  High = 'high',
  Normal = 'normal',
  Low = 'low',
}

/**
 * Priority values for sorting (higher number = higher priority)
 */
const PRIORITY_VALUES: Record<MiddlewarePriority, number> = {
  [MiddlewarePriority.High]: 3,
  [MiddlewarePriority.Normal]: 2,
  [MiddlewarePriority.Low]: 1,
};

/**
 * Gets the numeric priority value for sorting
 */
export function getPriorityValue(priority: MiddlewarePriority): number {
  return PRIORITY_VALUES[priority];
}

/**
 * Shared execution state for middleware chain
 * 
 * This object allows middleware/hooks to share data during a single request
 * or navigation cycle. The state is automatically cleared after each execution.
 */
export interface MiddlewareSharedState {
  [key: string]: unknown;
}

/**
 * Context object passed to middleware functions
 */
export interface MiddlewareContext {
  /**
   * Shared execution state for middleware chain
   * 
   * Allows middleware/hooks to read and write values that persist
   * throughout the middleware chain execution for a single request
   * or navigation cycle.
   * 
   * @example
   * ```typescript
   * // In first middleware
   * context.shared.cacheKey = generateCacheKey(context);
   * 
   * // In later middleware
   * const cacheKey = context.shared.cacheKey;
   * ```
   */
  shared: MiddlewareSharedState;
  [key: string]: unknown;
}

/**
 * Middleware response that can include a redirect path
 */
export interface MiddlewareResponse {
  /**
   * Whether the middleware allows the request/route to proceed
   */
  allow: boolean;
  /**
   * Optional redirect path when allow is false
   * If provided, this redirect takes priority over global/route onFail
   */
  redirect?: string;
}

/**
 * Middleware return type - can be a simple boolean or a response object
 */
export type MiddlewareReturn =
  | boolean
  | MiddlewareResponse
  | Promise<boolean | MiddlewareResponse>
  | import('rxjs').Observable<boolean | MiddlewareResponse>;

/**
 * Middleware function type that can return:
 * - boolean: synchronous result (true/false)
 * - MiddlewareResponse: object with allow and optional redirect
 * - Promise<boolean | MiddlewareResponse>: asynchronous result
 * - Observable<boolean | MiddlewareResponse>: reactive result
 */
export type NgxMiddleware = (
  context: MiddlewareContext
) => MiddlewareReturn;

/**
 * Extended middleware with priority metadata
 */
export interface PrioritizedMiddleware extends NgxMiddleware {
  /**
   * Priority of the middleware (high, normal, low)
   * Higher priority middleware executes first
   */
  readonly priority?: MiddlewarePriority;
}

/**
 * Result of middleware execution
 */
export interface MiddlewareResult {
  /**
   * Final result of the middleware chain execution
   */
  result: boolean;
  /**
   * Index of the middleware that returned false (if any)
   * -1 if all middlewares passed
   */
  stoppedAt: number;
  /**
   * Optional redirect path from the middleware that failed
   * Takes priority over route/global onFail configuration
   */
  redirect?: string;
}

