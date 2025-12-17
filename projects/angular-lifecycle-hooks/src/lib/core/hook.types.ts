/**
 * Core hook types - Framework agnostic
 * No Angular imports allowed in this file
 */

/**
 * Route lifecycle context
 */
export interface RouteHookContext {
  /**
   * Route snapshot (when available)
   */
  route?: {
    url: string;
    params: Record<string, string>;
    queryParams: Record<string, string>;
    data: Record<string, unknown>;
    fragment: string | null;
  };
  /**
   * Navigation state
   */
  navigation: {
    from?: string;
    to: string;
    trigger: 'imperative' | 'popstate' | 'hashchange';
  };
  /**
   * Execution timestamp
   */
  timestamp: number;
  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * HTTP lifecycle context
 */
export interface HttpHookContext {
  /**
   * HTTP request (when available)
   */
  request?: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: unknown;
  };
  /**
   * HTTP response (when available)
   */
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body?: unknown;
  };
  /**
   * Execution timestamp
   */
  timestamp: number;
  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Retry signal for beforeRequest hooks
 * When returned, triggers a retry of the request
 */
export interface RetrySignal {
  /**
   * Type discriminator for retry signal
   */
  readonly __retry: true;
  /**
   * Optional delay in milliseconds before retry
   * Default: 0 (immediate retry)
   */
  delay?: number;
  /**
   * Optional reason for retry (for logging/debugging)
   */
  reason?: string;
}

/**
 * Fallback signal for afterResponse hooks
 * When returned, triggers fallback logic
 */
export interface FallbackSignal {
  /**
   * Type discriminator for fallback signal
   */
  readonly __fallback: true;
  /**
   * Optional fallback data to use
   */
  data?: unknown;
  /**
   * Optional reason for fallback (for logging/debugging)
   */
  reason?: string;
}

/**
 * Hook result for blocking hooks
 * Can return boolean, retry signal, or fallback signal
 */
export type HookResult = 
  | boolean 
  | Promise<boolean>
  | RetrySignal
  | Promise<RetrySignal>
  | FallbackSignal
  | Promise<FallbackSignal>;

/**
 * Retry configuration for HTTP hooks
 */
export interface RetryConfig {
  /**
   * Maximum number of retries allowed
   * Default: 3
   */
  maxRetries?: number;
  /**
   * Default delay in milliseconds between retries
   * Can be overridden by individual retry signals
   * Default: 0 (immediate retry)
   */
  defaultDelay?: number;
  /**
   * Whether to use exponential backoff for retries
   * When true, delay = defaultDelay * (2 ^ retryCount)
   * Default: false
   */
  exponentialBackoff?: boolean;
  /**
   * Maximum delay in milliseconds (caps exponential backoff)
   * Only applies when exponentialBackoff is true
   * Default: 10000 (10 seconds)
   */
  maxDelay?: number;
}

/**
 * Route hook scope configuration
 */
export interface RouteHookScope {
  /**
   * Specific route path or route pattern (supports glob patterns like '/admin/**')
   */
  path?: string | string[];
  
  /**
   * Specific HTTP methods (for route-based API calls)
   */
  method?: string | string[];
}

/**
 * HTTP hook scope configuration
 */
export interface HttpHookScope {
  /**
   * Specific API URL or URL pattern (supports glob patterns like '/api/**')
   */
  url?: string | string[];
  
  /**
   * Specific HTTP methods (e.g., 'GET', 'POST', 'PUT', 'DELETE')
   */
  method?: string | string[];
}

/**
 * Scoped route hook definition
 */
export interface ScopedRouteHook<T extends keyof RouteLifecycleHooks> {
  scope?: RouteHookScope;
  hook: RouteLifecycleHooks[T];
}

/**
 * Scoped HTTP hook definition
 */
export interface ScopedHttpHook<T extends keyof HttpLifecycleHooks> {
  scope?: HttpHookScope;
  hook: HttpLifecycleHooks[T];
}

/**
 * Route lifecycle hooks
 */
export interface RouteLifecycleHooks {
  /**
   * Called before route navigation
   * Return false or Promise<false> to block navigation
   */
  beforeRoute?: (context: RouteHookContext) => HookResult;
  
  /**
   * Called after route navigation completes successfully
   */
  afterRoute?: (context: RouteHookContext) => void | Promise<void>;
  
  /**
   * Called when route navigation is blocked
   */
  routeBlocked?: (context: RouteHookContext) => void | Promise<void>;
}

/**
 * HTTP lifecycle hooks
 */
export interface HttpLifecycleHooks {
  /**
   * Called before HTTP request is sent
   * Return false or Promise<false> to block request
   */
  beforeRequest?: (context: HttpHookContext) => HookResult;
  
  /**
   * Called after HTTP response is received successfully
   */
  afterResponse?: (context: HttpHookContext) => void | Promise<void>;
  
  /**
   * Called when HTTP request is blocked
   */
  requestBlocked?: (context: HttpHookContext) => void | Promise<void>;
  
  /**
   * Called when HTTP request fails (network error, etc.)
   */
  requestFailed?: (context: HttpHookContext & { error: unknown }) => void | Promise<void>;
}

/**
 * Scoped route lifecycle hooks configuration
 */
export interface ScopedRouteLifecycleHooks {
  /**
   * Scoped beforeRoute hooks
   */
  beforeRoute?: Array<ScopedRouteHook<'beforeRoute'>> | RouteLifecycleHooks['beforeRoute'];
  
  /**
   * Scoped afterRoute hooks
   */
  afterRoute?: Array<ScopedRouteHook<'afterRoute'>> | RouteLifecycleHooks['afterRoute'];
  
  /**
   * Scoped routeBlocked hooks
   */
  routeBlocked?: Array<ScopedRouteHook<'routeBlocked'>> | RouteLifecycleHooks['routeBlocked'];
}

/**
 * Scoped HTTP lifecycle hooks configuration
 */
export interface ScopedHttpLifecycleHooks {
  /**
   * Scoped beforeRequest hooks
   */
  beforeRequest?: Array<ScopedHttpHook<'beforeRequest'>> | HttpLifecycleHooks['beforeRequest'];
  
  /**
   * Scoped afterResponse hooks
   */
  afterResponse?: Array<ScopedHttpHook<'afterResponse'>> | HttpLifecycleHooks['afterResponse'];
  
  /**
   * Scoped requestBlocked hooks
   */
  requestBlocked?: Array<ScopedHttpHook<'requestBlocked'>> | HttpLifecycleHooks['requestBlocked'];
  
  /**
   * Scoped requestFailed hooks
   */
  requestFailed?: Array<ScopedHttpHook<'requestFailed'>> | HttpLifecycleHooks['requestFailed'];
}

/**
 * Complete lifecycle hooks configuration
 */
export interface LifecycleHooksConfig {
  route?: RouteLifecycleHooks | ScopedRouteLifecycleHooks;
  http?: HttpLifecycleHooks | ScopedHttpLifecycleHooks;
  /**
   * Retry configuration for HTTP hooks
   */
  retry?: RetryConfig;
}

/**
 * Creates a retry signal for beforeRequest hooks
 * 
 * @param options - Retry options
 * @returns Retry signal
 * 
 * @example
 * ```typescript
 * beforeRequest: (ctx) => {
 *   if (shouldRetry(ctx)) {
 *     return retry({ delay: 1000, reason: 'Token refresh needed' });
 *   }
 *   return true;
 * }
 * ```
 */
export function retry(options?: { delay?: number; reason?: string }): RetrySignal {
  return {
    __retry: true,
    delay: options?.delay,
    reason: options?.reason,
  };
}

/**
 * Creates a fallback signal for afterResponse hooks
 * 
 * @param options - Fallback options
 * @returns Fallback signal
 * 
 * @example
 * ```typescript
 * afterResponse: (ctx) => {
 *   if (ctx.response?.status === 503) {
 *     return fallback({ data: getCachedData(), reason: 'Service unavailable' });
 *   }
 * }
 * ```
 */
export function fallback(options?: { data?: unknown; reason?: string }): FallbackSignal {
  return {
    __fallback: true,
    data: options?.data,
    reason: options?.reason,
  };
}

