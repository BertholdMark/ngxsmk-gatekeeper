import { InjectionToken } from '@angular/core';

/**
 * Interface for feature flag providers
 * 
 * Allows pluggable feature flag resolution from various sources
 * (localStorage, remote API, configuration files, etc.)
 */
export interface FeatureFlagProvider {
  /**
   * Checks if a feature flag is enabled
   * 
   * @param flagName - Name of the feature flag to check
   * @param context - Optional context that may contain additional information
   * @returns Promise that resolves to true if flag is enabled, false otherwise
   */
  isEnabled(
    flagName: string,
    context?: Record<string, unknown>
  ): Promise<boolean>;

  /**
   * Gets the value of a feature flag (if provider supports it)
   * 
   * @param flagName - Name of the feature flag to get
   * @param context - Optional context that may contain additional information
   * @returns Promise that resolves to the flag value, or undefined if not found
   */
  getValue?(
    flagName: string,
    context?: Record<string, unknown>
  ): Promise<unknown>;
}

/**
 * Injection token for feature flag provider
 * 
 * Provide a custom FeatureFlagProvider implementation to use with feature flag middleware
 * 
 * If not provided, the middleware will fall back to context-based flag lookup
 */
export const FEATURE_FLAG_PROVIDER = new InjectionToken<FeatureFlagProvider | null>(
  'FEATURE_FLAG_PROVIDER',
  {
    providedIn: 'root',
    factory: () => null, // Default: no provider (falls back to context-based lookup)
  }
);

