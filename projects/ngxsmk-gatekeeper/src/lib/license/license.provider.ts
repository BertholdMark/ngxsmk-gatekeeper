/**
 * License verification provider utilities
 * 
 * Provides utilities for registering license verifiers with the core.
 * The core does not enforce licensing - it only provides the hook.
 */

import { InjectionToken, Provider, APP_INITIALIZER, inject } from '@angular/core';
import { LicenseVerifier } from './license.types';
import { LicenseRegistry } from './license.registry';

/**
 * Injection token for license registry
 */
export const LICENSE_REGISTRY = new InjectionToken<LicenseRegistry>(
  'LICENSE_REGISTRY',
  {
    providedIn: 'root',
    factory: () => new LicenseRegistry(),
  }
);

/**
 * Provides license verifiers to the gatekeeper
 * 
 * **IMPORTANT: Core does not enforce licensing**
 * 
 * This provider registers license verifiers, but the core does not:
 * - Block application startup on invalid licenses
 * - Enforce license requirements
 * - Prevent functionality based on license status
 * 
 * Enterprise plugins can use the license registry to verify licenses
 * and implement graceful degradation when licenses are invalid.
 * 
 * **Core Principles:**
 * 
 * 1. **Core provides hook only**: The core provides the license verification
 *    hook but does not enforce licensing.
 * 
 * 2. **Plugins verify licenses**: Enterprise plugins register verifiers to
 *    check license validity.
 * 
. * 3. **Graceful degradation**: Invalid licenses result in graceful degradation,
 *    not blocking application startup.
 * 
 * 4. **Never block startup**: License verification never blocks application
 *    startup, even if verification fails.
 * 
 * @param verifiers - License verifiers to register
 * @returns Provider configuration
 * 
 * @example
 * ```typescript
 * // In your application
 * import { provideLicenseVerifiers } from 'ngxsmk-gatekeeper/lib/license';
 * import { EnterpriseLicenseVerifier } from '@vendor/gatekeeper-enterprise';
 * 
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     // Register license verifiers (non-blocking)
 *     provideLicenseVerifiers([
 *       new EnterpriseLicenseVerifier({
 *         apiEndpoint: 'https://license.example.com/verify',
 *       }),
 *     ]),
 *     // Application continues to start even if license is invalid
 *   ],
 * });
 * ```
 */
export function provideLicenseVerifiers(
  verifiers: LicenseVerifier[]
): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const registry = inject(LICENSE_REGISTRY);
        
        // Register all verifiers during app initialization (non-blocking)
        return () => {
          for (const verifier of verifiers) {
            try {
              const success = registry.register(verifier);
              if (success) {
                console.log(
                  `[Gatekeeper] Registered license verifier "${verifier.id}" (${verifier.name})`
                );
              } else {
                console.warn(
                  `[Gatekeeper] Failed to register license verifier "${verifier.id}"`
                );
              }
            } catch (error) {
              // Never block startup on verifier registration errors
              console.warn(
                `[Gatekeeper] Error registering license verifier "${verifier.id}":`,
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
 * Gets the license registry
 * 
 * Useful for plugins that need to verify licenses.
 */
export function getLicenseRegistry(): LicenseRegistry {
  return inject(LICENSE_REGISTRY);
}

/**
 * Verifies a license key (non-blocking)
 * 
 * This function verifies a license key but never throws errors or blocks execution.
 * 
 * @param licenseKey - License key to verify
 * @param context - Optional verification context
 * @returns Verification result (always returns, never throws)
 */
export async function verifyLicense(
  licenseKey: string,
  context?: import('./license.types').LicenseVerificationContext
): Promise<import('./license.types').LicenseVerificationResult> {
  try {
    const registry = inject(LICENSE_REGISTRY, { optional: true });
    if (!registry) {
      // No registry available - return valid to not block functionality
      return {
        valid: true,
        licenseKey,
        metadata: {
          note: 'License registry not available - assuming valid',
        },
      };
    }

    return await registry.verify(licenseKey, context);
  } catch (error) {
    // Never throw - always return a result
    return {
      valid: true, // Default to valid to not block functionality
      licenseKey,
      error: error instanceof Error ? error.message : String(error),
      metadata: {
        note: 'License verification error - assuming valid to not block functionality',
      },
    };
  }
}

