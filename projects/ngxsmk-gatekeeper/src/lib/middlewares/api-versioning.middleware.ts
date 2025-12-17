import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Configuration options for API versioning middleware
 */
export interface APIVersioningMiddlewareOptions {
  /**
   * Default API version
   * Default: 'v1'
   */
  defaultVersion?: string;
  /**
   * Name of the header that contains API version
   * Default: 'API-Version'
   */
  headerName?: string;
  /**
   * Query parameter name for API version
   * Default: 'version'
   */
  queryParamName?: string;
  /**
   * Supported API versions
   * Default: ['v1']
   */
  supportedVersions?: string[];
  /**
   * Whether to require version
   * Default: false (uses default if not provided)
   */
  requireVersion?: boolean;
  /**
   * Redirect URL when version is invalid
   */
  redirect?: string;
  /**
   * Custom message when version is invalid
   */
  message?: string;
}

/**
 * Creates middleware that handles API versioning
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const versioningMiddleware = createAPIVersioningMiddleware({
 *   defaultVersion: 'v1',
 *   supportedVersions: ['v1', 'v2'],
 *   headerName: 'API-Version'
 * });
 * ```
 */
export function createAPIVersioningMiddleware(
  options: APIVersioningMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    defaultVersion = 'v1',
    headerName = 'API-Version',
    queryParamName = 'version',
    supportedVersions = ['v1'],
    requireVersion = false,
    redirect,
    message = 'Unsupported API version',
  } = options;

  return createMiddleware('api-versioning', (context: MiddlewareContext) => {
    const request = context['request'] as HttpRequest<unknown> | undefined;
    if (!request) {
      // Not an HTTP request, skip versioning
      return true;
    }

    // Get version from header
    let version = request.headers.get(headerName.toLowerCase());

    // Fallback to query parameter
    if (!version) {
      const url = new URL(request.url, 'http://localhost');
      version = url.searchParams.get(queryParamName) || null;
    }

    // Use default if not provided and not required
    if (!version) {
      if (requireVersion) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: 'API version is required',
          };
        }
        return false;
      }
      version = defaultVersion;
    }

    // Validate version
    if (!supportedVersions.includes(version)) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: `${message}: ${version}. Supported versions: ${supportedVersions.join(', ')}`,
        };
      }
      return false;
    }

    // Store version in context
    context['apiVersion'] = version;

    return true;
  });
}

