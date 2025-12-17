import { createMiddleware } from '../helpers';
import { MiddlewareContext, NgxMiddleware } from '../core';

/**
 * Backoff strategy
 */
export type BackoffStrategy = 'linear' | 'exponential' | 'fixed';

/**
 * Configuration options for retry middleware
 */
export interface RetryMiddlewareOptions {
  /**
   * Middleware to retry
   */
  middleware: NgxMiddleware;
  /**
   * Maximum number of retries
   * Default: 3
   */
  maxRetries?: number;
  /**
   * Backoff strategy
   * Default: 'exponential'
   */
  backoff?: BackoffStrategy;
  /**
   * Initial delay in milliseconds
   * Default: 1000
   */
  initialDelay?: number;
  /**
   * Maximum delay in milliseconds
   * Default: 10000
   */
  maxDelay?: number;
  /**
   * HTTP status codes that should trigger retry
   * Default: [500, 502, 503, 504]
   */
  retryableErrors?: number[];
  /**
   * Function to determine if error is retryable
   */
  isRetryable?: (error: unknown, context: MiddlewareContext) => boolean;
}

/**
 * Calculates delay based on backoff strategy
 */
function calculateDelay(
  attempt: number,
  strategy: BackoffStrategy,
  initialDelay: number,
  maxDelay: number
): number {
  let delay: number;

  switch (strategy) {
    case 'exponential':
      delay = initialDelay * Math.pow(2, attempt);
      break;
    case 'linear':
      delay = initialDelay * (attempt + 1);
      break;
    case 'fixed':
    default:
      delay = initialDelay;
      break;
  }

  return Math.min(delay, maxDelay);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates middleware that retries failed requests with backoff
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const retryMiddleware = createRetryMiddleware({
 *   middleware: externalAPIMiddleware,
 *   maxRetries: 3,
 *   backoff: 'exponential',
 *   retryableErrors: [500, 502, 503]
 * });
 * ```
 */
export function createRetryMiddleware(
  options: RetryMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    middleware,
    maxRetries = 3,
    backoff = 'exponential',
    initialDelay = 1000,
    maxDelay = 10000,
    retryableErrors = [500, 502, 503, 504],
    isRetryable,
  } = options;

  return createMiddleware('retry', (async (context: MiddlewareContext) => {
    let lastError: unknown;
    let lastResult: boolean | { allow: boolean; redirect?: string; reason?: string } | import('rxjs').Observable<boolean | { allow: boolean; redirect?: string; reason?: string }> = false;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await Promise.resolve(middleware(context));
        
        // Check if result indicates success
        const resultValue = typeof result === 'object' && 'allow' in result ? result.allow : result;
        const success = resultValue === true;
        
        if (success) {
          return result;
        }

        // Check if error is retryable
        const shouldRetry = isRetryable
          ? isRetryable(result, context)
          : checkIfRetryable(result, retryableErrors);

        if (!shouldRetry || attempt === maxRetries) {
          return result;
        }

        lastResult = result;
      } catch (error) {
        lastError = error;

        // Check if error is retryable
        const shouldRetry = isRetryable
          ? isRetryable(error, context)
          : true; // Retry on exceptions by default

        if (!shouldRetry || attempt === maxRetries) {
          throw error;
        }
      }

      // Wait before retry
      if (attempt < maxRetries) {
        const delay = calculateDelay(attempt, backoff, initialDelay, maxDelay);
        await sleep(delay);
      }
    }

    // All retries exhausted
    if (lastError) {
      throw lastError;
    }
    return lastResult;
  }) as any);
}

/**
 * Checks if result/error is retryable based on HTTP status codes
 */
function checkIfRetryable(
  result: unknown,
  retryableErrors: number[]
): boolean {
  // If result is an object with status code
  if (result && typeof result === 'object' && 'status' in result) {
    const status = (result as { status?: number }).status;
    if (status && retryableErrors.includes(status)) {
      return true;
    }
  }

  return false;
}

