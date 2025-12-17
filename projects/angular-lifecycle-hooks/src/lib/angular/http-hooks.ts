/**
 * HTTP hooks integration
 */

import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, EMPTY, from, switchMap, tap, catchError, delay, of, throwError } from 'rxjs';
import { HttpLifecycleHooks, ScopedHttpLifecycleHooks, RetryConfig } from '../core';
import { buildHttpRequestContext, buildHttpResponseContext } from './hook-context';
import {
  runBeforeRequestHook,
  runAfterResponseHook,
  runRequestBlockedHook,
  runRequestFailedHook,
} from '../core/hook-runner';
import { LIFECYCLE_HOOKS_CONFIG, LifecycleHooksConfig } from './lifecycle-hooks.provider';

/**
 * Injection token for HTTP lifecycle hooks
 */
export const HTTP_LIFECYCLE_HOOKS = Symbol('HTTP_LIFECYCLE_HOOKS');

/**
 * Calculates retry delay based on configuration
 */
function calculateRetryDelay(
  retryConfig: RetryConfig | undefined,
  retrySignal: { delay?: number },
  retryCount: number
): number {
  const defaultDelay = retryConfig?.defaultDelay ?? 0;
  const signalDelay = retrySignal.delay;
  
  if (retryConfig?.exponentialBackoff) {
    // Use signal delay as base if provided, otherwise use defaultDelay
    const baseDelay = signalDelay !== undefined ? signalDelay : defaultDelay;
    const exponentialDelay = baseDelay * Math.pow(2, retryCount);
    const maxDelay = retryConfig.maxDelay ?? 10000;
    return Math.min(exponentialDelay, maxDelay);
  }
  
  // Use signal delay if provided, otherwise use defaultDelay
  return signalDelay !== undefined ? signalDelay : defaultDelay;
}

/**
 * Creates a functional HTTP interceptor that executes lifecycle hooks
 * 
 * @param hooks - HTTP lifecycle hooks configuration (supports both unscoped and scoped hooks)
 * @returns HTTP interceptor function
 */
export function createHttpLifecycleInterceptor(
  hooks: HttpLifecycleHooks | ScopedHttpLifecycleHooks | undefined
): HttpInterceptorFn {
  if (!hooks) {
    // No hooks = pass through (tree-shakable)
    return (req, next) => next(req);
  }

  return (request: HttpRequest<unknown>, next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>) => {
    // Get retry configuration from global config
    let retryConfig: RetryConfig | undefined;
    try {
      const globalConfig = inject<LifecycleHooksConfig>(LIFECYCLE_HOOKS_CONFIG, { optional: true });
      retryConfig = globalConfig?.retry;
    } catch {
      // Config not available, use defaults
    }

    const maxRetries = retryConfig?.maxRetries ?? 3;
    let retryCount = 0;

    const executeRequest = (req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
      // Build context for beforeRequest
      const requestContext = buildHttpRequestContext(req);

      // Run beforeRequest hook
      return from(runBeforeRequestHook(hooks.beforeRequest, requestContext)).pipe(
        switchMap((hookResult) => {
          // Check if retry is requested
          if (hookResult.retry) {
            if (retryCount >= maxRetries) {
              console.warn(
                `[LifecycleHooks] Max retries (${maxRetries}) reached for ${req.method} ${req.url}. ` +
                `Reason: ${hookResult.retry.reason || 'Unknown'}`
              );
              // Proceed with request after max retries
              return proceedWithRequest(req, requestContext);
            }

            retryCount++;
            const delayMs = calculateRetryDelay(retryConfig, hookResult.retry, retryCount - 1);
            
            if (hookResult.retry.reason) {
              console.log(
                `[LifecycleHooks] Retrying request ${req.method} ${req.url} (attempt ${retryCount}/${maxRetries}). ` +
                `Reason: ${hookResult.retry.reason}. Delay: ${delayMs}ms`
              );
            }

            // Retry after delay
            return of(null).pipe(
              delay(delayMs),
              switchMap(() => executeRequest(req))
            );
          }

          // Check if request is allowed
          if (!hookResult.allowed) {
            // Block request
            runRequestBlockedHook(hooks.requestBlocked, requestContext).catch(console.error);
            return EMPTY;
          }

          // Proceed with request
          return proceedWithRequest(req, requestContext);
        })
      );
    };

    const proceedWithRequest = (
      req: HttpRequest<unknown>,
      requestContext: ReturnType<typeof buildHttpRequestContext>
    ): Observable<HttpEvent<unknown>> => {
      return next(req).pipe(
        tap({
          next: (event) => {
            // Handle successful response
            if (event instanceof HttpResponse) {
              const responseContext = buildHttpResponseContext(req, event);
              from(runAfterResponseHook(hooks.afterResponse, responseContext)).pipe(
                tap((hookResult) => {
                  // Handle fallback signal
                  if (hookResult.fallback) {
                    if (hookResult.fallback.reason) {
                      console.log(
                        `[LifecycleHooks] Fallback triggered for ${req.method} ${req.url}. ` +
                        `Reason: ${hookResult.fallback.reason}`
                      );
                    }
                    // Note: Fallback data is available in hookResult.fallback.data
                    // The application can use this in a custom way or we could emit a special event
                    // For now, we just log it - the hook can handle the fallback logic itself
                  }
                })
              ).subscribe({
                error: (error) => {
                  console.error('[LifecycleHooks] Error in afterResponse hook:', error);
                }
              });
            }
          },
          error: (error: HttpErrorResponse) => {
            // Handle failed request
            const errorContext = buildHttpResponseContext(req, error);
            runRequestFailedHook(hooks.requestFailed, {
              ...errorContext,
              error: error.error || error,
            }).catch(console.error);
          },
        }),
        catchError((error: HttpErrorResponse) => {
          // Handle error and rethrow
          const errorContext = buildHttpResponseContext(req, error);
          runRequestFailedHook(hooks.requestFailed, {
            ...errorContext,
            error: error.error || error,
          }).catch(console.error);
          return throwError(() => error);
        })
      );
    };

    return executeRequest(request);
  };
}

