/**
 * Context object passed to middleware functions
 */
export interface MiddlewareContext {
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

