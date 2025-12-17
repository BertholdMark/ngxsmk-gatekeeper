/**
 * License verification hook types
 * 
 * This API allows enterprise plugins to verify licenses without the core
 * having any knowledge of licensing enforcement.
 */

/**
 * License verification result
 */
export interface LicenseVerificationResult {
  /**
   * Whether the license is valid
   */
  valid: boolean;
  /**
   * License key that was verified
   */
  licenseKey?: string;
  /**
   * Error message if license is invalid
   */
  error?: string;
  /**
   * License metadata (if valid)
   */
  metadata?: LicenseMetadata;
  /**
   * Whether the license check should block functionality
   * If false, invalid license results in graceful degradation
   */
  blockOnInvalid?: boolean;
}

/**
 * License metadata
 */
export interface LicenseMetadata {
  /**
   * License type (e.g., 'enterprise', 'premium', 'trial')
   */
  type?: string;
  /**
   * License expiration date (ISO 8601)
   */
  expiresAt?: string;
  /**
   * Features enabled by this license
   */
  features?: string[];
  /**
   * Maximum number of users (if applicable)
   */
  maxUsers?: number;
  /**
   * Additional metadata
   */
  [key: string]: unknown;
}

/**
 * License verification hook
 * 
 * Plugins can register license verifiers to check license validity.
 * The core provides this hook but does not enforce licensing.
 */
export interface LicenseVerifier {
  /**
   * Unique identifier for the verifier
   */
  readonly id: string;
  /**
   * Human-readable name of the verifier
   */
  readonly name: string;
  /**
   * Verifies a license key
   * 
   * @param licenseKey - License key to verify
   * @param context - Optional context for verification
   * @returns License verification result
   */
  verify(
    licenseKey: string,
    context?: LicenseVerificationContext
  ): LicenseVerificationResult | Promise<LicenseVerificationResult>;
  /**
   * Optional method to refresh license verification
   * 
   * @param licenseKey - License key to refresh
   * @param context - Optional context for verification
   * @returns Updated license verification result
   */
  refresh?(
    licenseKey: string,
    context?: LicenseVerificationContext
  ): LicenseVerificationResult | Promise<LicenseVerificationResult>;
}

/**
 * License verification context
 */
export interface LicenseVerificationContext {
  /**
   * Application identifier
   */
  appId?: string;
  /**
   * Domain or environment identifier
   */
  domain?: string;
  /**
   * Additional context data
   */
  [key: string]: unknown;
}

/**
 * License verification options
 */
export interface LicenseVerificationOptions {
  /**
   * Whether to block functionality on invalid license
   * If false, invalid license results in graceful degradation
   * @default false
   */
  blockOnInvalid?: boolean;
  /**
   * Whether to cache verification results
   * @default true
   */
  cacheResults?: boolean;
  /**
   * Cache TTL in milliseconds
   * @default 3600000 (1 hour)
   */
  cacheTTL?: number;
  /**
   * Custom error handler
   */
  onError?: (error: string, licenseKey?: string) => void;
  /**
   * Custom success handler
   */
  onSuccess?: (metadata: LicenseMetadata, licenseKey: string) => void;
}

