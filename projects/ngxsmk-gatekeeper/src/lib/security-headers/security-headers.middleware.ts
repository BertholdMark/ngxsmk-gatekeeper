import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import {
  SecurityHeadersConfig,
  SECURITY_HEADERS_KEY,
  SecurityHeadersEntry,
} from './security-headers.types';

/**
 * Creates a middleware that injects security headers into HTTP requests
 * 
 * Headers are added to the middleware context and will be applied to the HTTP request
 * by the gatekeeper interceptor after middleware execution.
 * 
 * @param config - Security headers configuration
 * @returns A middleware function that adds headers to the context
 * 
 * @example
 * ```typescript
 * import { securityHeadersMiddleware } from 'ngxsmk-gatekeeper/lib/security-headers';
 * 
 * // Simple static headers
 * const headersMiddleware = securityHeadersMiddleware({
 *   headers: {
 *     'X-Request-Source': 'web-app',
 *     'X-Client-Version': '1.0.0',
 *   },
 * });
 * 
 * // Dynamic headers with functions
 * const dynamicHeadersMiddleware = securityHeadersMiddleware({
 *   headers: {
 *     'X-Request-Source': 'web-app',
 *     'X-Client-Version': () => getAppVersion(),
 *     'X-Request-ID': () => generateRequestId(),
 *   },
 * });
 * 
 * // Overwrite existing headers
 * const overwriteHeadersMiddleware = securityHeadersMiddleware({
 *   headers: {
 *     'X-Request-Source': 'custom-source',
 *   },
 *   overwrite: true,
 * });
 * 
 * // Use in GatekeeperConfig
 * provideGatekeeper({
 *   middlewares: [headersMiddleware, authMiddleware],
 *   onFail: '/login',
 * });
 * ```
 */
export function securityHeadersMiddleware(
  config: SecurityHeadersConfig
): ReturnType<typeof createMiddleware> {
  const { headers, overwrite = false } = config;

  return createMiddleware('security-headers', (context: MiddlewareContext) => {
    // Resolve header values (support both static strings and functions)
    const resolvedHeaders: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'function') {
        try {
          resolvedHeaders[key] = value();
        } catch (error) {
          console.warn(`[Security Headers] Failed to resolve header "${key}":`, error);
          // Skip this header if resolution fails
        }
      } else {
        resolvedHeaders[key] = value;
      }
    }

    // Get existing headers from context (if any)
    const existingEntry = context[SECURITY_HEADERS_KEY] as SecurityHeadersEntry | undefined;
    
    if (existingEntry) {
      // Merge with existing headers
      const mergedHeaders = overwrite
        ? { ...existingEntry.headers, ...resolvedHeaders }
        : { ...resolvedHeaders, ...existingEntry.headers };
      
      // Use the more permissive overwrite setting
      const mergedOverwrite = overwrite || existingEntry.overwrite;
      
      context[SECURITY_HEADERS_KEY] = {
        headers: mergedHeaders,
        overwrite: mergedOverwrite,
      } as SecurityHeadersEntry;
    } else {
      // Create new entry
      context[SECURITY_HEADERS_KEY] = {
        headers: resolvedHeaders,
        overwrite,
      } as SecurityHeadersEntry;
    }

    // Always allow - this middleware only adds headers
    return true;
  });
}

/**
 * Helper function to create common security headers middleware
 * 
 * @param options - Common security headers options
 * @returns Security headers middleware
 * 
 * @example
 * ```typescript
 * import { createSecurityHeaders } from 'ngxsmk-gatekeeper/lib/security-headers';
 * 
 * const headersMiddleware = createSecurityHeaders({
 *   requestSource: 'web-app',
 *   clientVersion: '1.0.0',
 *   customHeaders: {
 *     'X-Custom-Header': 'value',
 *   },
 * });
 * ```
 */
export interface CommonSecurityHeadersOptions {
  /**
   * Request source identifier (sets X-Request-Source header)
   */
  requestSource?: string | (() => string);
  /**
   * Client version (sets X-Client-Version header)
   */
  clientVersion?: string | (() => string);
  /**
   * Additional custom headers
   */
  customHeaders?: Record<string, string | (() => string)>;
  /**
   * Whether to overwrite existing headers
   */
  overwrite?: boolean;
}

export function createSecurityHeaders(
  options: CommonSecurityHeadersOptions
): ReturnType<typeof securityHeadersMiddleware> {
  const { requestSource, clientVersion, customHeaders, overwrite } = options;
  
  const headers: Record<string, string | (() => string)> = {
    ...(requestSource && { 'X-Request-Source': requestSource }),
    ...(clientVersion && { 'X-Client-Version': clientVersion }),
    ...customHeaders,
  };

  return securityHeadersMiddleware({
    headers,
    ...(overwrite !== undefined && { overwrite }),
  });
}

