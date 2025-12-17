import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Generates a random CSRF token
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Configuration options for CSRF protection middleware
 */
export interface CSRFMiddlewareOptions {
  /**
   * Name of the header that contains the CSRF token
   * Default: 'X-CSRF-Token'
   */
  tokenHeader?: string;
  /**
   * Name of the cookie that stores the CSRF token
   * Default: 'csrf-token'
   */
  cookieName?: string;
  /**
   * Methods that require CSRF protection
   * Default: ['POST', 'PUT', 'PATCH', 'DELETE']
   */
  protectedMethods?: string[];
  /**
   * Paths that are exempt from CSRF protection
   * Default: []
   */
  exemptPaths?: string[];
  /**
   * Custom token validation function
   */
  validateToken?: (token: string, cookieToken: string) => boolean;
  /**
   * Redirect URL when CSRF validation fails
   */
  redirect?: string;
}

/**
 * Creates middleware that protects against Cross-Site Request Forgery (CSRF) attacks
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const csrfMiddleware = createCSRFMiddleware({
 *   tokenHeader: 'X-CSRF-Token',
 *   cookieName: 'csrf-token',
 *   protectedMethods: ['POST', 'PUT', 'DELETE']
 * });
 * ```
 */
export function createCSRFMiddleware(
  options: CSRFMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    tokenHeader = 'X-CSRF-Token',
    cookieName = 'csrf-token',
    protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'],
    exemptPaths = [],
    validateToken = (token, cookieToken) => token === cookieToken,
    redirect,
  } = options;

  return createMiddleware('csrf', (context: MiddlewareContext) => {
    const request = context['request'] as HttpRequest<unknown> | undefined;
    if (!request) {
      // Not an HTTP request, skip CSRF check
      return true;
    }

    const method = request.method.toUpperCase();
    const url = request.url;

    // Check if path is exempt
    if (exemptPaths.some(path => url.includes(path))) {
      return true;
    }

    // Only protect specified methods
    if (!protectedMethods.includes(method)) {
      return true;
    }

    // Get token from header
    const headerToken = request.headers.get(tokenHeader.toLowerCase());
    if (!headerToken) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: 'CSRF token missing',
        };
      }
      return false;
    }

    // Get token from cookie
    const cookies = request.headers.get('cookie') || '';
    const cookieMatch = cookies.match(new RegExp(`${cookieName}=([^;]+)`));
    const cookieToken = cookieMatch ? cookieMatch[1] : null;

    if (!cookieToken) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: 'CSRF cookie missing',
        };
      }
      return false;
    }

    // Validate tokens match
    if (!validateToken(headerToken, cookieToken)) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: 'CSRF token mismatch',
        };
      }
      return false;
    }

    return true;
  });
}

/**
 * Helper function to get CSRF token for setting in cookies
 * This should be called server-side or during initial page load
 */
export function getCSRFToken(): string {
  return generateToken();
}

