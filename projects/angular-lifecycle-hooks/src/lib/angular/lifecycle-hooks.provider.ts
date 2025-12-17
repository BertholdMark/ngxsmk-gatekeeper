/**
 * Lifecycle hooks provider
 */

import { Provider, inject, InjectionToken, APP_INITIALIZER } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { LifecycleHooksConfig } from '../core';
import { setupRouterHooks } from './router-hooks';
import { createHttpLifecycleInterceptor, HTTP_LIFECYCLE_HOOKS } from './http-hooks';

/**
 * Injection token for lifecycle hooks configuration
 */
export const LIFECYCLE_HOOKS_CONFIG = new InjectionToken<LifecycleHooksConfig>(
  'LIFECYCLE_HOOKS_CONFIG'
);

/**
 * Provides lifecycle hooks configuration and sets up router/HTTP hooks
 * 
 * @param config - Lifecycle hooks configuration (supports both unscoped and scoped hooks)
 * @returns Array of providers
 * 
 * @example
 * ```typescript
 * import { beforeRoute, beforeRequest } from 'angular-lifecycle-hooks';
 * 
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideLifecycleHooks({
 *       route: {
 *         // Scoped hooks using helper functions
 *         beforeRoute: [
 *           beforeRoute({ path: '/admin/**' }, (ctx) => {
 *             console.log('Admin route:', ctx.navigation.to);
 *             return true;
 *           }),
 *           beforeRoute({ path: '/api/**' }, (ctx) => {
 *             console.log('API route:', ctx.navigation.to);
 *             return true;
 *           }),
 *         ],
 *         // Or use unscoped hook (applies to all routes)
 *         afterRoute: (ctx) => {
 *           console.log('Navigated to:', ctx.navigation.to);
 *         },
 *       },
 *       http: {
 *         // Scoped hooks
 *         beforeRequest: [
 *           beforeRequest({ method: 'POST' }, (ctx) => {
 *             console.log('POST request:', ctx.request?.url);
 *             return true;
 *           }),
 *           beforeRequest({ url: '/api/**', method: 'GET' }, (ctx) => {
 *             console.log('API GET request:', ctx.request?.url);
 *             return true;
 *           }),
 *         ],
 *         // Or use unscoped hook
 *         afterResponse: (ctx) => {
 *           console.log('Response:', ctx.response?.status);
 *         },
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export function provideLifecycleHooks(config: LifecycleHooksConfig): Provider[] {
  const providers: Provider[] = [
    {
      provide: LIFECYCLE_HOOKS_CONFIG,
      useValue: config,
    },
  ];

  // Setup router hooks if route hooks are provided
  if (config.route) {
    // Router hooks are set up via APP_INITIALIZER to ensure Router is available
    providers.push({
      provide: APP_INITIALIZER,
      useFactory: setupRouterHooks(config.route),
      multi: true,
    });
  }

  // HTTP hooks are provided as an interceptor
  if (config.http) {
    providers.push({
      provide: HTTP_LIFECYCLE_HOOKS,
      useValue: createHttpLifecycleInterceptor(config.http),
    });
  }

  return providers;
}

/**
 * Gets the HTTP lifecycle interceptor function
 * Use this with provideHttpClient(withInterceptors([...]))
 */
export function getHttpLifecycleInterceptor(): HttpInterceptorFn {
  const interceptor = inject<HttpInterceptorFn | null>(HTTP_LIFECYCLE_HOOKS, { optional: true });
  return interceptor || ((req, next) => next(req));
}

