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
 * @param config - Lifecycle hooks configuration
 * @returns Array of providers
 * 
 * @example
 * ```typescript
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideLifecycleHooks({
 *       route: {
 *         beforeRoute: (ctx) => {
 *           console.log('Navigating to:', ctx.navigation.to);
 *           return true;
 *         },
 *         afterRoute: (ctx) => {
 *           console.log('Navigated to:', ctx.navigation.to);
 *         },
 *       },
 *       http: {
 *         beforeRequest: (ctx) => {
 *           console.log('Request:', ctx.request?.url);
 *           return true;
 *         },
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

