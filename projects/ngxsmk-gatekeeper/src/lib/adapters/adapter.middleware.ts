/**
 * Adapter middleware factory
 * 
 * Creates middleware that uses authentication adapters
 */

import { NgxMiddleware, MiddlewareContext } from '../core';
import { createMiddleware } from '../helpers';
import { AuthAdapter, AdapterMiddlewareOptions, AuthResult } from './adapter.types';

/**
 * Creates authentication middleware using an adapter
 * 
 * @param adapter - Authentication adapter to use
 * @param options - Optional middleware configuration
 * @returns Middleware function
 * 
 * @example
 * ```typescript
 * import { createAdapterMiddleware } from 'ngxsmk-gatekeeper/lib/adapters';
 * import { Auth0Adapter } from 'ngxsmk-gatekeeper/lib/adapters/auth0';
 * 
 * const adapter = new Auth0Adapter({ domain: 'your-domain.auth0.com' });
 * const authMiddleware = createAdapterMiddleware(adapter, {
 *   requireAuth: true,
 *   redirectOnFail: '/login',
 * });
 * ```
 */
export function createAdapterMiddleware(
  adapter: AuthAdapter,
  options: AdapterMiddlewareOptions = {}
): NgxMiddleware {
  const {
    requireAuth = true,
    autoRefresh = false,
    redirectOnFail,
    onError,
    onSuccess,
  } = options;

  return createMiddleware(`adapter:${adapter.id}`, async (context: MiddlewareContext) => {
    try {
      // Authenticate using adapter
      let authResult: AuthResult;
      
      if (autoRefresh && adapter.refresh) {
        // Try refresh first if auto-refresh is enabled
        authResult = await adapter.refresh(context);
        
        // If refresh fails, try normal authentication
        if (!authResult.authenticated) {
          authResult = await adapter.authenticate(context);
        }
      } else {
        authResult = await adapter.authenticate(context);
      }

      // Handle authentication result
      if (!authResult.authenticated) {
        // Authentication failed
        if (requireAuth) {
          const error = authResult.error || 'Authentication failed';
          
          // Call error handler if provided
          if (onError) {
            await onError(error, context);
          }

          // Return redirect if specified
          if (redirectOnFail) {
            return {
              allow: false,
              redirect: redirectOnFail,
            };
          }

          return false;
        } else {
          // Authentication not required - allow access
          return true;
        }
      }

      // Authentication successful
      if (authResult.user) {
        // Attach user to context
        context['user'] = {
          ...authResult.user,
          ...(authResult.metadata && { metadata: authResult.metadata }),
        };

        // Call success handler if provided
        if (onSuccess) {
          await onSuccess(authResult.user, context);
        }
      }

      return true;
    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (onError) {
        await onError(errorMessage, context);
      }

      if (requireAuth) {
        if (redirectOnFail) {
          return {
            allow: false,
            redirect: redirectOnFail,
          };
        }
        return false;
      }

      // If auth not required, allow access even on error
      return true;
    }
  });
}

