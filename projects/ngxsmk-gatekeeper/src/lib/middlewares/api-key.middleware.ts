import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Configuration options for API key validation middleware
 */
export interface APIKeyMiddlewareOptions {
  /**
   * Name of the header that contains the API key
   * Default: 'X-API-Key'
   */
  headerName?: string;
  /**
   * Query parameter name for API key (alternative to header)
   * Default: undefined (header only)
   */
  queryParamName?: string;
  /**
   * Function to validate the API key
   * Should return true if key is valid
   */
  validateKey: (key: string, context: MiddlewareContext) => boolean | Promise<boolean>;
  /**
   * List of valid API keys (for simple validation)
   * If provided, validateKey is optional
   */
  validKeys?: string[];
  /**
   * Enable rate limiting per API key
   * Default: false
   */
  rateLimitPerKey?: boolean;
  /**
   * Rate limit configuration per key
   */
  rateLimitConfig?: {
    maxRequests: number;
    windowMs: number;
  };
  /**
   * Redirect URL when API key is invalid
   */
  redirect?: string;
  /**
   * Custom error message
   */
  message?: string;
}

/**
 * Simple in-memory rate limit storage
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Creates middleware that validates API keys from headers or query parameters
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const apiKeyMiddleware = createAPIKeyMiddleware({
 *   headerName: 'X-API-Key',
 *   validateKey: async (key) => {
 *     const isValid = await checkAPIKeyInDatabase(key);
 *     return isValid;
 *   }
 * });
 * ```
 */
export function createAPIKeyMiddleware(
  options: APIKeyMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    headerName = 'X-API-Key',
    queryParamName,
    validateKey,
    validKeys,
    rateLimitPerKey = false,
    rateLimitConfig,
    redirect,
    message = 'Invalid API key',
  } = options;

  return createMiddleware('api-key', async (context: MiddlewareContext) => {
    const request = context['request'] as HttpRequest<unknown> | undefined;
    if (!request) {
      // Not an HTTP request, skip API key check
      return true;
    }

    // Get API key from header
    let apiKey = request.headers.get(headerName.toLowerCase());

    // Fallback to query parameter if header not found
    if (!apiKey && queryParamName) {
      const url = new URL(request.url, 'http://localhost');
      apiKey = url.searchParams.get(queryParamName) || null;
    }

    if (!apiKey) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: 'API key missing',
        };
      }
      return false;
    }

    // Validate API key
    let isValid: boolean;
    if (validKeys && validKeys.length > 0) {
      // Simple validation against list
      isValid = validKeys.includes(apiKey);
    } else if (validateKey) {
      // Custom validation function
      isValid = await validateKey(apiKey, context);
    } else {
      // No validation method provided
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: 'API key validation not configured',
        };
      }
      return false;
    }

    if (!isValid) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: message,
        };
      }
      return false;
    }

    // Rate limiting per key
    if (rateLimitPerKey && rateLimitConfig) {
      const now = Date.now();
      const key = `api-key:${apiKey}`;
      const limit = rateLimitStore.get(key);

      if (!limit || now > limit.resetAt) {
        // Reset or initialize
        rateLimitStore.set(key, {
          count: 1,
          resetAt: now + rateLimitConfig.windowMs,
        });
      } else {
        limit.count++;
        if (limit.count > rateLimitConfig.maxRequests) {
          if (redirect) {
            return {
              allow: false,
              redirect,
              reason: 'Rate limit exceeded',
            };
          }
          return false;
        }
      }
    }

    return true;
  });
}

