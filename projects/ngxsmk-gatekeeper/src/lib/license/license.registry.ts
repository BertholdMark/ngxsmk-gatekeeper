/**
 * License verification registry
 * 
 * This registry manages license verifiers but does not enforce licensing.
 * Enterprise plugins register verifiers to check licenses, but the core
 * has no knowledge of licensing enforcement.
 */

import { Injectable } from '@angular/core';
import { LicenseVerifier, LicenseVerificationResult, LicenseVerificationContext } from './license.types';

/**
 * License verification registry service
 * 
 * Manages license verifier registration and provides access to verification.
 * This service is internal to the core and has no knowledge of what verifiers do.
 */
@Injectable({
  providedIn: 'root',
})
export class LicenseRegistry {
  private readonly verifiers = new Map<string, LicenseVerifier>();
  private readonly cache = new Map<string, { result: LicenseVerificationResult; expiresAt: number }>();

  /**
   * Registers a license verifier
   * 
   * @param verifier - Verifier to register
   * @returns Whether registration was successful
   */
  register(verifier: LicenseVerifier): boolean {
    if (this.verifiers.has(verifier.id)) {
      console.warn(`[LicenseRegistry] Verifier with id "${verifier.id}" is already registered`);
      return false;
    }

    this.verifiers.set(verifier.id, verifier);
    return true;
  }

  /**
   * Unregisters a license verifier
   * 
   * @param verifierId - ID of verifier to unregister
   * @returns Whether unregistration was successful
   */
  unregister(verifierId: string): boolean {
    return this.verifiers.delete(verifierId);
  }

  /**
   * Verifies a license key using all registered verifiers
   * 
   * @param licenseKey - License key to verify
   * @param context - Optional verification context
   * @returns Verification result from first verifier that accepts the key, or invalid result
   */
  async verify(
    licenseKey: string,
    context?: LicenseVerificationContext
  ): Promise<LicenseVerificationResult> {
    if (!licenseKey) {
      return {
        valid: false,
        error: 'No license key provided',
      };
    }

    // Check cache first
    const cached = this.getCachedResult(licenseKey);
    if (cached) {
      return cached;
    }

    // Try each verifier
    for (const verifier of this.verifiers.values()) {
      try {
        const result = await verifier.verify(licenseKey, context);
        
        // Cache result if valid
        if (result.valid) {
          this.cacheResult(licenseKey, result);
        }

        return result;
      } catch (error) {
        // Continue to next verifier on error
        console.warn(`[LicenseRegistry] Verifier "${verifier.id}" error:`, error);
        continue;
      }
    }

    // No verifier accepted the license key
    const result: LicenseVerificationResult = {
      valid: false,
      licenseKey,
      error: 'No verifier accepted the license key',
    };

    return result;
  }

  /**
   * Refreshes license verification
   * 
   * @param licenseKey - License key to refresh
   * @param context - Optional verification context
   * @returns Updated verification result
   */
  async refresh(
    licenseKey: string,
    context?: LicenseVerificationContext
  ): Promise<LicenseVerificationResult> {
    this.cache.delete(licenseKey);

    // Try each verifier's refresh method
    for (const verifier of this.verifiers.values()) {
      if (verifier.refresh) {
        try {
          const result = await verifier.refresh(licenseKey, context);
          
          // Cache result if valid
          if (result.valid) {
            this.cacheResult(licenseKey, result);
          }

          return result;
        } catch (error) {
          console.warn(`[LicenseRegistry] Verifier "${verifier.id}" refresh error:`, error);
          continue;
        }
      }
    }

    // Fallback to regular verification
    return this.verify(licenseKey, context);
  }

  /**
   * Gets a registered verifier by ID
   * 
   * @param verifierId - ID of verifier to get
   * @returns Verifier or undefined if not found
   */
  get(verifierId: string): LicenseVerifier | undefined {
    return this.verifiers.get(verifierId);
  }

  /**
   * Gets all registered verifiers
   * 
   * @returns Array of registered verifiers
   */
  getAll(): LicenseVerifier[] {
    return Array.from(this.verifiers.values());
  }

  /**
   * Checks if a verifier is registered
   * 
   * @param verifierId - ID of verifier to check
   * @returns Whether verifier is registered
   */
  has(verifierId: string): boolean {
    return this.verifiers.has(verifierId);
  }

  /**
   * Clears the verification cache
   */
  clearCache(): void {
    this.cache.clear();
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

