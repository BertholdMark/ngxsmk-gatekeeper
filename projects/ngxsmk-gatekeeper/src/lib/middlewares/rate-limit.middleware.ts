import { createMiddleware } from '../helpers';
import { MiddlewareContext, MiddlewareResponse } from '../core';

/**
 * Configuration options for rate limit middleware
 */
export interface RateLimitMiddlewareOptions {
  /**
   * Maximum number of requests allowed within the time window
   * @default 10
   */
  maxRequests?: number;
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;
  /**
   * Key generator function to identify unique rate limit buckets
   * By default, uses route URL for routes and request URL for HTTP requests
   * 
   * @param context - Middleware context
   * @returns Unique identifier for rate limiting
   */
  keyGenerator?: (context: MiddlewareContext) => string;
  /**
   * Optional redirect path when rate limit is exceeded
   * If not provided, returns false without redirect
   */
  redirect?: string;
  /**
   * Custom error message when rate limit is exceeded
   * @default 'Rate limit exceeded'
   */
  message?: string;
}

/**
 * Request timestamp entry for rate limiting
 */
interface RateLimitEntry {
  timestamps: number[];
  windowStart: number;
}

/**
 * In-memory storage for rate limit tracking
 * 
 * WARNING: This is client-side only protection. It can be bypassed by:
 * - Clearing browser storage/cache
 * - Using different browsers/devices
 * - Modifying client-side code
 * 
 * **SSR Note:** On the server, this store is shared across all requests.
 * This middleware is designed for client-side use. For SSR scenarios,
 * consider using server-side rate limiting instead.
 * 
 * For production applications, implement server-side rate limiting.
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Gets a unique key for rate limiting from context
 */
function getRateLimitKey(
  context: MiddlewareContext,
  keyGenerator?: (context: MiddlewareContext) => string
): string {
  if (keyGenerator) {
    return keyGenerator(context);
  }

  // Default: use URL from context
  if (context.url && typeof context.url === 'string') {
    return context.url;
  }

  // Fallback: use route path
  if (context.route) {
    const route = context.route as { path?: string; routeConfig?: { path?: string } };
    return route.path || route.routeConfig?.path || 'unknown';
  }

  return 'default';
}

/**
 * Cleans up old entries outside the time window
 */
function cleanupOldEntries(entry: RateLimitEntry, windowMs: number): void {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((timestamp) => timestamp > windowStart);
  entry.windowStart = windowStart;
}

/**
 * Checks if request should be rate limited
 */
function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = {
      timestamps: [],
      windowStart: now - windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  // Clean up old entries
  cleanupOldEntries(entry, windowMs);

  // Check if limit exceeded
  if (entry.timestamps.length >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
    };
  }

  // Add current request timestamp
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
  };
}

/**
 * Creates a rate limit middleware that limits requests per route or API endpoint
 * 
 * **IMPORTANT: CLIENT-SIDE PROTECTION ONLY**
 * 
 * This middleware provides client-side rate limiting using in-memory storage.
 * It can be easily bypassed and should NOT be relied upon for security.
 * 
 * **Limitations:**
 * - Only works within a single browser session
 * - Can be bypassed by clearing browser data
 * - Can be bypassed by using different browsers/devices
 * - Can be bypassed by modifying client-side code
 * - Does not persist across page refreshes (unless using persistent storage)
 * 
 * **For Production:**
 * Always implement server-side rate limiting for actual protection.
 * This middleware is useful for:
 * - Preventing accidental rapid-fire requests
 * - Improving UX by preventing UI spam
 * - Development/testing scenarios
 * 
 * @param options - Configuration options for the rate limiter
 * @returns A middleware function that enforces rate limits
 * 
 * @example
 * ```typescript
 * // Limit to 5 requests per minute per route
 * const rateLimitMiddleware = createRateLimitMiddleware({
 *   maxRequests: 5,
 *   windowMs: 60000,
 *   redirect: '/rate-limit-exceeded'
 * });
 * 
 * // Custom key generator (e.g., by user ID)
 * const userRateLimit = createRateLimitMiddleware({
 *   maxRequests: 10,
 *   windowMs: 60000,
 *   keyGenerator: (context) => {
 *     return `user:${context.user?.id || 'anonymous'}`;
 *   }
 * });
 * ```
 */
export function createRateLimitMiddleware(
  options: RateLimitMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    maxRequests = 10,
    windowMs = 60000, // 1 minute default
    keyGenerator,
    redirect,
    message = 'Rate limit exceeded',
  } = options;

  return createMiddleware('rate-limit', (context: MiddlewareContext) => {
    const key = getRateLimitKey(context, keyGenerator);
    const { allowed, remaining } = checkRateLimit(key, maxRequests, windowMs);

    if (!allowed) {
      // Rate limit exceeded
      if (redirect) {
        return {
          allow: false,
          redirect,
        } as MiddlewareResponse;
      }
      return false;
    }

    // Request allowed
    return true;
  });
}

/**
 * Clears rate limit data for a specific key or all keys
 * 
 * Useful for testing or manual reset scenarios.
 * 
 * @param key - Optional key to clear. If not provided, clears all rate limit data.
 */
export function clearRateLimit(key?: string): void {
  if (key) {
    rateLimitStore.delete(key);
  } else {
    rateLimitStore.clear();
  }
}

/**
 * Gets current rate limit status for a key
 * 
 * @param key - Rate limit key to check
 * @param maxRequests - Maximum requests configured
 * @param windowMs - Time window in milliseconds
 * @returns Current request count and remaining requests, or null if key doesn't exist
 */
export function getRateLimitStatus(
  key: string,
  maxRequests: number,
  windowMs: number
): { count: number; remaining: number } | null {
  const entry = rateLimitStore.get(key);
  if (!entry) {
    return null;
  }

  cleanupOldEntries(entry, windowMs);
  return {
    count: entry.timestamps.length,
    remaining: Math.max(0, maxRequests - entry.timestamps.length),
  };
}

