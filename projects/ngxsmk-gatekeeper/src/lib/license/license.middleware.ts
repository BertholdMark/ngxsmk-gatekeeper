/**
 * License verification middleware utilities
 * 
 * Provides middleware that checks licenses but never blocks functionality.
 * Enterprise plugins can use this to implement graceful degradation.
 */

import { NgxMiddleware, MiddlewareContext } from '../core';
import { createMiddleware } from '../helpers';
import { LicenseVerificationOptions, LicenseMetadata } from './license.types';
import { verifyLicense } from './license.provider';

/**
 * Creates middleware that verifies a license but never blocks functionality
 * 
 * This middleware:
 * - Verifies the license key
 * - Attaches license metadata to context if valid
 * - Never blocks access (graceful degradation on invalid license)
 * - Logs warnings for invalid licenses
 * 
 * @param licenseKey - License key to verify
 * @param options - Optional verification options
 * @returns Middleware function that always allows access
 * 
 * @example
 * ```typescript
 * import { createLicenseMiddleware } from 'ngxsmk-gatekeeper/lib/license';
 * 
 * const licenseMiddleware = createLicenseMiddleware('your-license-key', {
 *   onError: (error) => console.warn('License invalid:', error),
 *   onSuccess: (metadata) => console.log('License valid:', metadata),
 * });
 * 
 * provideGatekeeper({
 *   middlewares: [licenseMiddleware, /* other middleware *\/],
 *   onFail: '/login',
 * });
 * ```
 */
export function createLicenseMiddleware(
  licenseKey: string,
  options: LicenseVerificationOptions = {}
): NgxMiddleware {
  const {
    blockOnInvalid = false, // Never block by default
    onError,
    onSuccess,
  } = options;

  return createMiddleware('license-verification', async (context: MiddlewareContext) => {
    try {
      // Verify license (non-blocking)
      const appId = (context as Record<string, unknown>)['appId'] as string | undefined;
      const domain = typeof window !== 'undefined' ? window.location.hostname : undefined;
      const result = await verifyLicense(licenseKey, {
        ...(appId !== undefined && { appId }),
        ...(domain !== undefined && { domain }),
      });

      // Attach license metadata to context
      if (result.valid && result.metadata) {
        const licenseData = result.metadata as LicenseMetadata & { key?: string };
        licenseData.key = licenseKey;
        context['license'] = licenseData;

        // Call success handler
        if (onSuccess && result.metadata) {
          onSuccess(result.metadata, licenseKey);
        }
      } else {
        // License invalid - log warning but don't block
        const error = result.error || 'License verification failed';
        
        if (onError) {
          onError(error, licenseKey);
        } else {
          console.warn(`[License] Invalid license: ${error}`);
        }

        // Only block if explicitly requested (not recommended)
        if (blockOnInvalid) {
          return false;
        }
      }

      // Always allow access (graceful degradation)
      return true;
    } catch (error) {
      // Never throw - always allow access
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (onError) {
        onError(errorMessage, licenseKey);
      } else {
        console.warn(`[License] License verification error: ${errorMessage}`);
      }

      // Always allow access even on error
      return true;
    }
  });
}

/**
 * Creates middleware that checks license features
 * 
 * This middleware checks if specific features are enabled in the license.
 * If features are not enabled, it logs a warning but doesn't block access.
 * 
 * @param licenseKey - License key to verify
 * @param requiredFeatures - Features that should be enabled
 * @param options - Optional verification options
 * @returns Middleware function
 * 
 * @example
 * ```typescript
 * import { createLicenseFeatureMiddleware } from 'ngxsmk-gatekeeper/lib/license';
 * 
 * const featureMiddleware = createLicenseFeatureMiddleware(
 *   'your-license-key',
 *   ['advanced-auth', 'audit-logging'],
 *   {
 *     onError: (error) => console.warn('Feature not available:', error),
 *   }
 * );
 * ```
 */
export function createLicenseFeatureMiddleware(
  licenseKey: string,
  requiredFeatures: string[],
  options: LicenseVerificationOptions = {}
): NgxMiddleware {
  const { onError } = options;

  return createMiddleware('license-feature-check', async (_context: MiddlewareContext) => {
    try {
      // Verify license
      const result = await verifyLicense(licenseKey);

      if (!result.valid) {
        const error = `License invalid - features not available: ${requiredFeatures.join(', ')}`;
        if (onError) {
          onError(error, licenseKey);
        } else {
          console.warn(`[License] ${error}`);
        }
        // Don't block - graceful degradation
        return true;
      }

      // Check if required features are enabled
      const enabledFeatures = result.metadata?.features || [];
      const missingFeatures = requiredFeatures.filter(
        feature => !enabledFeatures.includes(feature)
      );

      if (missingFeatures.length > 0) {
        const error = `Required features not enabled: ${missingFeatures.join(', ')}`;
        if (onError) {
          onError(error, licenseKey);
        } else {
          console.warn(`[License] ${error}`);
        }
        // Don't block - graceful degradation
        return true;
      }

      // All features enabled
      return true;
    } catch (error) {
      // Never throw - always allow access
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (onError) {
        onError(errorMessage, licenseKey);
      }

      // Always allow access even on error
      return true;
    }
  });
}

