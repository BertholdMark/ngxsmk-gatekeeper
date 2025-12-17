import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Configuration options for geographic blocking middleware
 */
export interface GeoBlockMiddlewareOptions {
  /**
   * Allowed country codes (ISO 3166-1 alpha-2)
   * Example: ['US', 'CA', 'GB']
   */
  allowedCountries?: string[];
  /**
   * Blocked country codes
   * Example: ['CN', 'RU']
   */
  blockedCountries?: string[];
  /**
   * Function to get country code from context
   * If not provided, attempts to get from headers or context
   */
  getCountryCode?: (context: MiddlewareContext) => string | null | Promise<string | null>;
  /**
   * Redirect URL when access is denied
   */
  redirect?: string;
  /**
   * Custom message when access is denied
   */
  message?: string;
}

/**
 * Gets country code from various sources
 */
async function getCountryCode(
  context: MiddlewareContext,
  customGetter?: (context: MiddlewareContext) => string | null | Promise<string | null>
): Promise<string | null> {
  // Use custom getter if provided
  if (customGetter) {
    return await customGetter(context);
  }

  const request = context['request'] as HttpRequest<unknown> | undefined;
  if (request) {
    // Check Cloudflare header
    const cfCountry = request.headers.get('cf-ipcountry');
    if (cfCountry && cfCountry !== 'XX') {
      return cfCountry;
    }

    // Check custom header
    const customCountry = request.headers.get('x-country-code');
    if (customCountry) {
      return customCountry;
    }
  }

  // Check context
  const contextCountry = context['country'] as string | undefined;
  if (contextCountry) {
    return contextCountry;
  }

  return null;
}

/**
 * Creates middleware that blocks or allows access based on geographic location
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const geoBlockMiddleware = createGeoBlockMiddleware({
 *   allowedCountries: ['US', 'CA', 'GB'],
 *   blockedCountries: ['CN', 'RU'],
 *   redirect: '/geo-blocked'
 * });
 * ```
 */
export function createGeoBlockMiddleware(
  options: GeoBlockMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    allowedCountries,
    blockedCountries,
    getCountryCode: customGetter,
    redirect,
    message = 'Access denied: Geographic restriction',
  } = options;

  return createMiddleware('geo-block', async (context: MiddlewareContext) => {
    const countryCode = await getCountryCode(context, customGetter);

    if (!countryCode) {
      // If country cannot be determined, allow access (or deny based on your policy)
      // For strict policies, you might want to return false here
      return true;
    }

    const upperCountry = countryCode.toUpperCase();

    // Check blocked countries first
    if (blockedCountries && blockedCountries.length > 0) {
      if (blockedCountries.map(c => c.toUpperCase()).includes(upperCountry)) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: message,
          };
        }
        return false;
      }
    }

    // Check allowed countries
    if (allowedCountries && allowedCountries.length > 0) {
      if (!allowedCountries.map(c => c.toUpperCase()).includes(upperCountry)) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: message,
          };
        }
        return false;
      }
    }

    return true;
  });
}

