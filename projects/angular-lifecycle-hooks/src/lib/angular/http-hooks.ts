/**
 * HTTP hooks integration
 */

import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, EMPTY, from, switchMap, tap, catchError } from 'rxjs';
import { HttpLifecycleHooks } from '../core';
import { buildHttpRequestContext, buildHttpResponseContext } from './hook-context';
import {
  runBeforeRequestHook,
  runAfterResponseHook,
  runRequestBlockedHook,
  runRequestFailedHook,
} from '../core/hook-runner';

/**
 * Injection token for HTTP lifecycle hooks
 */
export const HTTP_LIFECYCLE_HOOKS = Symbol('HTTP_LIFECYCLE_HOOKS');

/**
 * Creates a functional HTTP interceptor that executes lifecycle hooks
 */
export function createHttpLifecycleInterceptor(
  hooks: HttpLifecycleHooks | undefined
): HttpInterceptorFn {
  if (!hooks) {
    // No hooks = pass through (tree-shakable)
    return (req, next) => next(req);
  }

  return (request: HttpRequest<unknown>, next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>) => {
    // Build context for beforeRequest
    const requestContext = buildHttpRequestContext(request);

    // Run beforeRequest hook
    return from(runBeforeRequestHook(hooks.beforeRequest, requestContext)).pipe(
      switchMap((allowed) => {
        if (!allowed) {
          // Block request
          runRequestBlockedHook(hooks.requestBlocked, requestContext).catch(console.error);
          return EMPTY;
        }

        // Proceed with request
        return next(request).pipe(
          tap({
            next: (event) => {
              // Handle successful response
              if (event instanceof HttpResponse) {
                const responseContext = buildHttpResponseContext(request, event);
                runAfterResponseHook(hooks.afterResponse, responseContext).catch(console.error);
              }
            },
            error: (error: HttpErrorResponse) => {
              // Handle failed request
              const errorContext = buildHttpResponseContext(request, error);
              runRequestFailedHook(hooks.requestFailed, {
                ...errorContext,
                error: error.error || error,
              }).catch(console.error);
            },
          }),
          catchError((error: HttpErrorResponse) => {
            // Handle error and rethrow
            const errorContext = buildHttpResponseContext(request, error);
            runRequestFailedHook(hooks.requestFailed, {
              ...errorContext,
              error: error.error || error,
            }).catch(console.error);
            throw error;
          })
        );
      })
    );
  };
}

