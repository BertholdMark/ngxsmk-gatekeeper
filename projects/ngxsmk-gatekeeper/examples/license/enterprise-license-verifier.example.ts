/**
 * Example: Enterprise License Verifier Implementation
 * 
 * This is an example implementation of an enterprise license verifier.
 * In a real scenario, this would be in a separate package:
 * @vendor/gatekeeper-enterprise
 * 
 * To use this verifier:
 * 1. Install: npm install @vendor/gatekeeper-enterprise
 * 2. Import and use as shown in license-usage.example.ts
 */

import { LicenseVerifier, LicenseVerificationResult, LicenseVerificationContext } from 'ngxsmk-gatekeeper/lib/license';

/**
 * Enterprise license verifier configuration
 */
export interface EnterpriseLicenseVerifierConfig {
  /**
   * API endpoint for license verification
   */
  apiEndpoint: string;
  /**
   * API key for license service
   */
  apiKey?: string;
  /**
   * Application identifier
   */
  appId?: string;
  /**
   * Cache verification results (default: true)
   */
  cacheResults?: boolean;
}

/**
 * Enterprise License Verifier
 * 
 * Verifies enterprise licenses via API.
 * 
 * This verifier:
 * - Validates license keys with a remote service
 * - Caches verification results
 * - Provides license metadata
 * - Never blocks application startup
 */
export class EnterpriseLicenseVerifier implements LicenseVerifier {
  readonly id = '@vendor/gatekeeper-enterprise-verifier';
  readonly name = 'Enterprise License Verifier';
  readonly version = '1.0.0';
  readonly description = 'Verifies enterprise licenses via API';

  private readonly config: Required<Pick<EnterpriseLicenseVerifierConfig, 'cacheResults'>> & EnterpriseLicenseVerifierConfig;
  private readonly cache = new Map<string, { result: LicenseVerificationResult; expiresAt: number }>();

  constructor(config: EnterpriseLicenseVerifierConfig) {
    if (!config.apiEndpoint) {
      throw new Error('EnterpriseLicenseVerifier requires apiEndpoint');
    }

    this.config = {
      cacheResults: true,
      ...config,
    };
  }

  /**
   * Verifies a license key
   */
  async verify(
    licenseKey: string,
    context?: LicenseVerificationContext
  ): Promise<LicenseVerificationResult> {
    // Check cache first
    if (this.config.cacheResults) {
      const cached = this.getCachedResult(licenseKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Call license verification API
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({
          licenseKey,
          appId: context?.appId || this.config.appId,
          domain: context?.domain,
        }),
      });

      if (!response.ok) {
        return {
          valid: false,
          licenseKey,
          error: `License verification failed: ${response.statusText}`,
        };
      }

      const data = await response.json();

      const result: LicenseVerificationResult = {
        valid: data.valid === true,
        licenseKey,
        ...(data.error && { error: data.error }),
        metadata: {
          type: data.type,
          expiresAt: data.expiresAt,
          features: data.features,
          maxUsers: data.maxUsers,
          ...data.metadata,
        },
        // Never block on invalid license
        blockOnInvalid: false,
      };

      // Cache result if valid
      if (this.config.cacheResults && result.valid) {
        this.cacheResult(licenseKey, result);
      }

      return result;
    } catch (error) {
      // Never throw - return invalid result but don't block
      return {
        valid: false,
        licenseKey,
        error: error instanceof Error ? error.message : String(error),
        blockOnInvalid: false, // Never block
      };
    }
  }

  /**
   * Refreshes license verification
   */
  async refresh(
    licenseKey: string,
    context?: LicenseVerificationContext
  ): Promise<LicenseVerificationResult> {
    // Clear cache
    this.cache.delete(licenseKey);

    // Re-verify
    return this.verify(licenseKey, context);
  }

  /**
   * Gets cached result if available and not expired
   */
  private getCachedResult(licenseKey: string): LicenseVerificationResult | null {
    const cached = this.cache.get(licenseKey);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt < Date.now()) {
      this.cache.delete(licenseKey);
      return null;
    }

    return cached.result;
  }

  /**
   * Caches a verification result
   */
  private cacheResult(licenseKey: string, result: LicenseVerificationResult, ttl: number = 3600000): void {
    this.cache.set(licenseKey, {
      result,
      expiresAt: Date.now() + ttl,
    });
  }
}

