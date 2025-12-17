/**
 * Extension provider utilities
 * 
 * Provides utilities for registering extensions with the core.
 */

import { InjectionToken, Provider, inject, APP_INITIALIZER } from '@angular/core';
import { GatekeeperExtension } from './extension.types';
import { ExtensionRegistry } from './extension.registry';

/**
 * Injection token for extension registry
 */
export const EXTENSION_REGISTRY = new InjectionToken<ExtensionRegistry>(
  'EXTENSION_REGISTRY',
  {
    providedIn: 'root',
    factory: () => new ExtensionRegistry(),
  }
);

/**
 * Provides extensions to the gatekeeper
 * 
 * Extensions are registered and their middleware is automatically
 * merged with user-configured middleware.
 * 
 * **Plugin Architecture:**
 * 
 * This API allows third-party plugins (including paid plugins) to
 * register middleware without the core having any knowledge of the
 * plugin's implementation.
 * 
 * **Core Principles:**
 * 
 * 1. **Core remains open source**: The core library has zero knowledge
 *    of paid features or plugin implementations.
 * 
 * 2. **Plugins are separate packages**: Plugins are distributed as
 *    separate npm packages (e.g., `@vendor/gatekeeper-plugin-premium`).
 * 
 * 3. **Extension API**: Plugins register middleware via the extension API,
 *    which is part of the open-source core.
 * 
 * 4. **No core dependencies on plugins**: The core doesn't import or
 *    depend on any plugin code.
 * 
 * @param extensions - Extensions to register
 * @returns Provider configuration
 * 
 * @example
 * ```typescript
 * // In your application
 * import { provideGatekeeper } from 'ngxsmk-gatekeeper';
 * import { provideExtensions } from 'ngxsmk-gatekeeper/lib/extensions';
 * import { PremiumPlugin } from '@vendor/gatekeeper-plugin-premium';
 * 
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideGatekeeper({
 *       middlewares: [authMiddleware],
 *       onFail: '/login',
 *     }),
 *     provideExtensions([
 *       new PremiumPlugin({ apiKey: 'your-api-key' }),
 *     ]),
 *   ],
 * });
 * ```
 */
export function provideExtensions(
  extensions: GatekeeperExtension[]
): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const registry = inject(EXTENSION_REGISTRY);
        
        // Register all extensions during app initialization
        return async () => {
          for (const extension of extensions) {
            try {
              const result = await registry.register(extension);
              if (!result.success) {
                console.error(
                  `[Gatekeeper] Failed to register extension "${extension.id}":`,
                  result.error
                );
              } else {
                console.log(
                  `[Gatekeeper] Registered extension "${extension.id}" (${extension.name})`
                );
              }
            } catch (error) {
              console.error(
                `[Gatekeeper] Error registering extension "${extension.id}":`,
                error
              );
            }
          }
        };
      },
    },
  ];
}

/**
 * Gets the extension registry
 * 
 * Useful for plugins that need to interact with other extensions.
 */
export function getExtensionRegistry(): ExtensionRegistry {
  return inject(EXTENSION_REGISTRY);
}

