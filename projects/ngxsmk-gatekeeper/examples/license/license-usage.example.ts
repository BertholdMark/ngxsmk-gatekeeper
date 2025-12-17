/**
 * Example: Using License Verification
 * 
 * This demonstrates how to use license verification with ngxsmk-gatekeeper.
 * License verification never blocks application startup.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

// Core library imports (open source)
import { provideGatekeeper, gatekeeperGuard, gatekeeperInterceptor } from 'ngxsmk-gatekeeper';
import {
  provideLicenseVerifiers,
  createLicenseMiddleware,
  createLicenseFeatureMiddleware,
  verifyLicense,
} from 'ngxsmk-gatekeeper/lib/license';

// Enterprise plugin imports (separate packages - can be paid)
import { EnterpriseLicenseVerifier } from '@vendor/gatekeeper-enterprise';

/**
 * Example 1: Register License Verifier (Non-blocking)
 * 
 * License verifiers are registered but never block application startup.
 */
export function exampleRegisterVerifier() {
  bootstrapApplication(AppComponent, {
    providers: [
      // Register license verifier (non-blocking)
      provideLicenseVerifiers([
        new EnterpriseLicenseVerifier({
          apiEndpoint: 'https://license.example.com/verify',
          apiKey: 'your-api-key',
          appId: 'your-app-id',
        }),
      ]),

      // Application continues to start even if license is invalid
      provideGatekeeper({
        middlewares: [],
        onFail: '/login',
      }),

      provideRouter(routes),
      provideHttpClient(withInterceptors([gatekeeperInterceptor])),
    ],
  });
}

/**
 * Example 2: Use License Middleware (Graceful Degradation)
 * 
 * License middleware verifies licenses but never blocks access.
 * Invalid licenses result in graceful degradation.
 */
export function exampleLicenseMiddleware() {
  const licenseKey = 'your-license-key';

  bootstrapApplication(AppComponent, {
    providers: [
      // Register license verifier
      provideLicenseVerifiers([
        new EnterpriseLicenseVerifier({
          apiEndpoint: 'https://license.example.com/verify',
        }),
      ]),

      // Use license middleware (never blocks)
      provideGatekeeper({
        middlewares: [
          createLicenseMiddleware(licenseKey, {
            onError: (error) => {
              console.warn('License invalid:', error);
              // Implement graceful degradation here
              // e.g., disable premium features, show upgrade prompt, etc.
            },
            onSuccess: (metadata) => {
              console.log('License valid:', metadata);
              // Enable premium features based on metadata
            },
          }),
        ],
        onFail: '/login',
      }),

      provideRouter(routes),
      provideHttpClient(withInterceptors([gatekeeperInterceptor])),
    ],
  });
}

/**
 * Example 3: Check License Features (Graceful Degradation)
 * 
 * Check if specific features are enabled in the license.
 * Missing features result in graceful degradation, not blocking.
 */
export function exampleLicenseFeatures() {
  const licenseKey = 'your-license-key';

  bootstrapApplication(AppComponent, {
    providers: [
      // Register license verifier
      provideLicenseVerifiers([
        new EnterpriseLicenseVerifier({
          apiEndpoint: 'https://license.example.com/verify',
        }),
      ]),

      // Check license features (never blocks)
      provideGatekeeper({
        middlewares: [
          createLicenseFeatureMiddleware(
            licenseKey,
            ['advanced-auth', 'audit-logging', 'compliance-mode'],
            {
              onError: (error) => {
                console.warn('Feature not available:', error);
                // Disable premium features gracefully
              },
            }
          ),
        ],
        onFail: '/login',
      }),

      provideRouter(routes),
      provideHttpClient(withInterceptors([gatekeeperInterceptor])),
    ],
  });
}

/**
 * Example 4: Verify License in Plugin (Non-blocking)
 * 
 * Enterprise plugins can verify licenses and implement graceful degradation.
 */
export async function examplePluginLicenseCheck() {
  const licenseKey = 'your-license-key';

  // Verify license (never throws, never blocks)
  const result = await verifyLicense(licenseKey, {
    appId: 'your-app-id',
    domain: window.location.hostname,
  });

  if (result.valid && result.metadata) {
    // License valid - enable premium features
    const features = result.metadata.features || [];
    
    if (features.includes('advanced-auth')) {
      // Enable advanced authentication
    }
    
    if (features.includes('audit-logging')) {
      // Enable audit logging
    }
  } else {
    // License invalid - implement graceful degradation
    console.warn('License invalid - using free tier features');
    // Disable premium features, show upgrade prompt, etc.
  }

  // Application continues to work regardless of license status
}

/**
 * Example 5: Enterprise Plugin with License Check
 * 
 * Enterprise plugins can check licenses and degrade gracefully.
 */
export class EnterprisePlugin {
  private licenseKey: string;

  constructor(licenseKey: string) {
    this.licenseKey = licenseKey;
  }

  async initialize() {
    // Verify license (non-blocking)
    const result = await verifyLicense(this.licenseKey);

    if (result.valid && result.metadata) {
      // License valid - enable premium features
      this.enablePremiumFeatures(result.metadata);
    } else {
      // License invalid - use free tier
      this.enableFreeTier();
    }

    // Plugin initialization never fails due to license
  }

  private enablePremiumFeatures(metadata: import('ngxsmk-gatekeeper/lib/license').LicenseMetadata) {
    // Enable premium features based on license metadata
    const features = metadata.features || [];
    
    if (features.includes('advanced-auth')) {
      // Enable advanced authentication
    }
    
    if (features.includes('compliance-mode')) {
      // Enable compliance mode
    }
  }

  private enableFreeTier() {
    // Enable free tier features
    // Show upgrade prompt
    // Disable premium features gracefully
  }
}

