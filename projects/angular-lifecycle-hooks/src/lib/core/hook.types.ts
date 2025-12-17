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
 * Hook result for blocking hooks
 */
export type HookResult = boolean | Promise<boolean>;

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
 * Complete lifecycle hooks configuration
 */
export interface LifecycleHooksConfig {
  route?: RouteLifecycleHooks;
  http?: HttpLifecycleHooks;
}

