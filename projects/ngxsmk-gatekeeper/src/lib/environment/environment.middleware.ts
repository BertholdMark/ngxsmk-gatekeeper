import { createMiddleware } from '../helpers';
import { MiddlewareContext, MiddlewareResponse } from '../core';
import { NgxMiddleware } from '../core';
import { detectEnvironment, EnvironmentConfig } from './environment.utils';
import { map } from 'rxjs';

/**
 * Configuration for environment-aware middleware
 */
export interface EnvironmentMiddlewareOptions {
  /**
   * Middleware to use in development environment
   */
  dev?: NgxMiddleware;
  /**
   * Middleware to use in staging environment
   * If not provided, falls back to dev or prod based on configuration
   */
  staging?: NgxMiddleware;
  /**
   * Middleware to use in production environment
   */
  prod?: NgxMiddleware;
  /**
   * Environment configuration for detection
   */
  environmentConfig?: EnvironmentConfig;
  /**
   * Fallback behavior when no middleware is configured for current environment
   * - 'deny': Deny access (default, safest)
   * - 'allow': Allow access
   * - 'dev': Use dev middleware
   * - 'prod': Use prod middleware
   */
  fallback?: 'deny' | 'allow' | 'dev' | 'prod';
  /**
   * Optional redirect path when access is denied
   */
  redirect?: string;
}

/**
 * Creates an environment-aware middleware that behaves differently based on the current environment
 * 
 * This middleware selects the appropriate middleware based on the detected environment
 * (development, staging, or production) at runtime.
 * 
 * **No build-time replacements required** - environment is detected at runtime.
 * 
 * @param options - Configuration options for environment middleware
 * @returns A middleware function that delegates to the appropriate environment-specific middleware
 * 
 * @example
 * ```typescript
 * import { environmentMiddleware } from 'ngxsmk-gatekeeper/lib/environment';
 * import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';
 * import { publicMiddleware } from 'ngxsmk-gatekeeper/lib/zero-trust';
 * 
 * // Different behavior per environment
 * const authMiddleware = environmentMiddleware({
 *   dev: publicMiddleware(), // Allow all in dev
 *   staging: createAuthMiddleware(), // Require auth in staging
 *   prod: createAuthMiddleware(), // Require auth in prod
 * });
 * 
 * // With fallback
 * const middleware = environmentMiddleware({
 *   dev: publicMiddleware(),
 *   prod: createAuthMiddleware(),
 *   fallback: 'deny', // Deny if environment doesn't match
 * });
 * 
 * // With explicit environment configuration
 * const middleware = environmentMiddleware({
 *   dev: publicMiddleware(),
 *   prod: createAuthMiddleware(),
 *   environmentConfig: {
 *     environment: 'production', // Override auto-detection
 *   },
 * });
 * ```
 */
export function environmentMiddleware(
  options: EnvironmentMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    dev,
    staging,
    prod,
    environmentConfig,
    fallback = 'deny',
    redirect,
  } = options;

  return createMiddleware('environment', (context: MiddlewareContext) => {
    // Detect current environment
    const environment = detectEnvironment(environmentConfig);

    // Select middleware based on environment
    let selectedMiddleware: NgxMiddleware | undefined;

    switch (environment) {
      case 'development':
        selectedMiddleware = dev;
        break;
      case 'staging':
        selectedMiddleware = staging ?? dev ?? prod; // Fallback chain: staging -> dev -> prod
        break;
      case 'production':
        selectedMiddleware = prod;
        break;
    }

    // Handle fallback if no middleware selected
    if (!selectedMiddleware) {
      switch (fallback) {
        case 'allow':
          return true;
        case 'dev':
          selectedMiddleware = dev;
          break;
        case 'prod':
          selectedMiddleware = prod;
          break;
        case 'deny':
        default:
          if (redirect) {
            return { allow: false, redirect } as MiddlewareResponse;
          }
          return false;
      }
    }

    // If still no middleware after fallback, deny
    if (!selectedMiddleware) {
      if (redirect) {
        return { allow: false, redirect } as MiddlewareResponse;
      }
      return false;
    }

    // Execute the selected middleware
    const result = selectedMiddleware(context);

    // Handle async results
    if (result instanceof Promise) {
      return result.then((res) => {
        // If result is false and redirect is provided, add redirect
        if (!res && redirect) {
          if (typeof res === 'object' && res !== null && 'allow' in res) {
            return res as MiddlewareResponse;
          }
          return { allow: false, redirect } as MiddlewareResponse;
        }
        return res;
      });
    }

    // Handle Observable results
    if (result && typeof result === 'object' && 'subscribe' in result) {
      return (result as import('rxjs').Observable<boolean | MiddlewareResponse>).pipe(
        map((res) => {
          if (!res && redirect) {
            if (typeof res === 'object' && res !== null && 'allow' in res) {
              return res as MiddlewareResponse;
            }
            return { allow: false, redirect } as MiddlewareResponse;
          }
          return res;
        })
      );
    }

    // Handle synchronous results
    if (!result && redirect) {
      if (typeof result === 'object' && result !== null && 'allow' in result) {
        return result as MiddlewareResponse;
      }
      return { allow: false, redirect } as MiddlewareResponse;
    }

    return result;
  });
}

