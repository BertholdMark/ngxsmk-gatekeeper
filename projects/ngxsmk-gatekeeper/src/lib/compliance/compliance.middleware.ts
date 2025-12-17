/**
 * Compliance middleware utilities
 * 
 * Ensures deterministic execution and explicit decision outcomes.
 */

import { MiddlewareContext } from '../core';
import { NgxMiddleware } from '../core';
import { createMiddleware } from '../helpers';

/**
 * Creates a compliance wrapper middleware that ensures explicit decisions
 * 
 * This middleware wraps other middleware to ensure:
 * - Explicit allow/deny outcomes (no undefined/null results)
 * - Clear decision reasons
 * - Deterministic behavior
 * 
 * @param middleware - Middleware to wrap
 * @param name - Name for the wrapped middleware
 * @param defaultReason - Default reason if middleware doesn't provide one
 * @returns Wrapped middleware with explicit decision outcomes
 */
export function createCompliantMiddleware(
  middleware: NgxMiddleware,
  name: string,
  defaultReason?: string
): ReturnType<typeof createMiddleware> {
  return createMiddleware(`compliant:${name}`, async (context: MiddlewareContext) => {
    try {
      const result = middleware(context);

      // Handle Promise results
      if (result instanceof Promise) {
        const resolved = await result;
        return ensureExplicitDecision(resolved, defaultReason || `Middleware "${name}" decision`);
      }

      // Handle Observable results
      if (result && typeof result === 'object' && 'subscribe' in result) {
        const { firstValueFrom } = await import('rxjs');
        const resolved = await firstValueFrom(result as import('rxjs').Observable<unknown>);
        return ensureExplicitDecision(resolved, defaultReason || `Middleware "${name}" decision`);
      }

      // Handle synchronous results
      return ensureExplicitDecision(result, defaultReason || `Middleware "${name}" decision`);
    } catch (error) {
      return false;
    }
  });
}

/**
 * Ensures a decision is explicit (boolean or MiddlewareResponse)
 */
function ensureExplicitDecision(
  result: unknown,
  defaultReason: string
): boolean | { allow: boolean; redirect?: string; reason?: string } {
  if (typeof result === 'boolean') {
    return result;
  }

  if (
    typeof result === 'object' &&
    result !== null &&
    'allow' in result
  ) {
    const response = result as { allow: boolean; redirect?: string; reason?: string };
    return {
      allow: response.allow,
      ...(response.redirect && { redirect: response.redirect }),
      ...(response.reason && { reason: response.reason }),
    };
  }

  // Default to deny if result is unclear
  return {
    allow: false,
    reason: `${defaultReason}: Invalid result type`,
  };
}

