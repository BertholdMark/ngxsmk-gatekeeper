import { createMiddleware } from '../helpers';
import { MiddlewareContext, NgxMiddleware } from '../core';

/**
 * Configuration options for conditional middleware
 */
export interface ConditionalMiddlewareOptions {
  /**
   * Condition function that determines which middleware to execute
   */
  condition: (context: MiddlewareContext) => boolean | Promise<boolean>;
  /**
   * Middleware to execute if condition is true
   */
  ifTrue: NgxMiddleware;
  /**
   * Middleware to execute if condition is false
   */
  ifFalse?: NgxMiddleware;
  /**
   * Whether to execute both middlewares (for logging/audit)
   * Default: false
   */
  executeBoth?: boolean;
}

/**
 * Creates middleware that conditionally executes different middleware based on context
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const conditionalMiddleware = createConditionalMiddleware({
 *   condition: (ctx) => ctx.user?.role === 'admin',
 *   ifTrue: adminMiddleware,
 *   ifFalse: userMiddleware
 * });
 * ```
 */
export function createConditionalMiddleware(
  options: ConditionalMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    condition,
    ifTrue,
    ifFalse,
    executeBoth = false,
  } = options;

  return createMiddleware('conditional', (async (context: MiddlewareContext) => {
    const conditionResult = await condition(context);

    if (executeBoth) {
      // Execute both for audit/logging purposes
      const trueResult = await Promise.resolve(ifTrue(context));
      if (ifFalse) {
        const falseResult = await Promise.resolve(ifFalse(context));
        // Return result based on condition
        return conditionResult ? trueResult : falseResult;
      }
      return conditionResult ? trueResult : true;
    }

    // Execute only the relevant middleware
    if (conditionResult) {
      return await Promise.resolve(ifTrue(context));
    }

    if (ifFalse) {
      return await Promise.resolve(ifFalse(context));
    }

    // No else branch, allow by default
    return true;
  }) as any);
}

