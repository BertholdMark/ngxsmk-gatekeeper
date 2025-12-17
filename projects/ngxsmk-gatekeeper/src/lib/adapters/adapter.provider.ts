/**
 * Adapter provider utilities
 * 
 * Provides utilities for registering authentication adapters with the core.
 */

import { InjectionToken, Provider, APP_INITIALIZER, inject } from '@angular/core';
import { AuthAdapter } from './adapter.types';
import { AdapterRegistry } from './adapter.registry';

/**
 * Injection token for adapter registry
 */
export const ADAPTER_REGISTRY = new InjectionToken<AdapterRegistry>(
  'ADAPTER_REGISTRY',
  {
    providedIn: 'root',
    factory: () => new AdapterRegistry(),
  }
);

/**
 * Provides authentication adapters to the gatekeeper
 * 
 * Adapters are registered and can be used to create authentication middleware.
 * 
 * **Adapter Architecture:**
 * 
 * This API allows third-party adapters (Auth0, Firebase, Custom JWT, etc.) to
 * integrate with ngxsmk-gatekeeper without the core having any knowledge of the
 * adapter's implementation.
 * 
 * **Core Principles:**
 * 
 * 1. **Core remains open source**: The core library has zero knowledge
 *    of adapter implementations.
 * 
 * 2. **Adapters are separate packages**: Adapters are distributed as
 *    separate npm packages (e.g., `ngxsmk-gatekeeper-adapter-auth0`).
 * 
 * 3. **Adapter API**: Adapters implement the AuthAdapter interface,
 *    which is part of the open-source core.
 * 
 * 4. **No core dependencies on adapters**: The core doesn't import or
 *    depend on any adapter code.
 * 
 * @param adapters - Adapters to register
 * @returns Provider configuration
 * 
 * @example
 * ```typescript
 * // In your application
 * import { provideGatekeeper } from 'ngxsmk-gatekeeper';
 * import { provideAdapters } from 'ngxsmk-gatekeeper/lib/adapters';
 * import { Auth0Adapter } from 'ngxsmk-gatekeeper/lib/adapters/auth0';
 * 
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideGatekeeper({
 *       middlewares: [],
 *       onFail: '/login',
 *     }),
 *     provideAdapters([
 *       new Auth0Adapter({
 *         domain: 'your-domain.auth0.com',
 *         clientId: 'your-client-id',
 *       }),
 *     ]),
 *   ],
 * });
 * ```
 */
export function provideAdapters(
  adapters: AuthAdapter[]
): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const registry = inject(ADAPTER_REGISTRY);
        
        // Register all adapters during app initialization
        return () => {
          for (const adapter of adapters) {
            const success = registry.register(adapter);
            if (success) {
              console.log(
                `[Gatekeeper] Registered adapter "${adapter.id}" (${adapter.name})`
              );
            } else {
              console.warn(
                `[Gatekeeper] Failed to register adapter "${adapter.id}"`
              );
            }
          }
        };
      },
    },
  ];
}

/**
 * Gets the adapter registry
 * 
 * Useful for accessing registered adapters.
 */
export function getAdapterRegistry(): AdapterRegistry {
  return inject(ADAPTER_REGISTRY);
}

