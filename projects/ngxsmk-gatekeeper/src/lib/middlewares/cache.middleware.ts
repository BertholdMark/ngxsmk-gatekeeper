import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Cache storage interface
 */
export interface CacheStorage {
  get: (key: string) => unknown | Promise<unknown>;
  set: (key: string, value: unknown, ttl?: number) => void | Promise<void>;
  delete: (key: string) => void | Promise<void>;
}

/**
 * In-memory cache storage
 */
class MemoryCacheStorage implements CacheStorage {
  private cache = new Map<string, { value: unknown; expiresAt: number }>();

  get(key: string): unknown {
    const item = this.cache.get(key);
    if (!item) {
      return undefined;
    }
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return item.value;
  }

  set(key: string, value: unknown, ttl?: number): void {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : Number.MAX_SAFE_INTEGER;
    this.cache.set(key, { value, expiresAt });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Configuration options for cache middleware
 */
export interface CacheMiddlewareOptions {
  /**
   * Time to live in seconds
   * Default: 3600 (1 hour)
   */
  ttl?: number;
  /**
   * Function to generate cache key from context
   */
  keyGenerator?: (context: MiddlewareContext) => string;
  /**
   * Cache storage implementation
   * Default: in-memory storage
   */
  storage?: CacheStorage;
  /**
   * Whether to cache only successful responses
   * Default: true
   */
  cacheOnlySuccess?: boolean;
}

/**
 * Creates middleware that caches middleware results
 *
 * @param options - Configuration options
 * @returns Middleware function
 */
export function createCacheMiddleware(
  options: CacheMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    ttl = 3600,
    keyGenerator = (context) => {
      const request = context['request'] as HttpRequest<unknown> | undefined;
      if (request) {
        return `${request.method}:${request.url}`;
      }
      return (context['path'] || context['url'] || 'unknown') as string;
    },
    storage = new MemoryCacheStorage(),
    cacheOnlySuccess = true,
  } = options;

  return createMiddleware('cache', async (context: MiddlewareContext) => {
    const key = `cache:${keyGenerator(context)}`;
    
    // Try to get from cache
    const cached = await Promise.resolve(storage.get(key));
    if (cached !== undefined) {
      return cached as boolean | { allow: boolean; redirect?: string; reason?: string };
    }

    const result = true; // This would be the actual middleware result

    // Cache successful results
    const resultValue = typeof result === 'object' && result !== null && 'allow' in result 
      ? (result as { allow: boolean }).allow 
      : result;
    if (resultValue === true || (cacheOnlySuccess && typeof result === 'object' && result !== null && 'allow' in result && (result as { allow: boolean }).allow === true)) {
      await Promise.resolve(storage.set(key, result, ttl));
    }

    return result;
  });
}

