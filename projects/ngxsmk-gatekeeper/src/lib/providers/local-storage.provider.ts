import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { FeatureFlagProvider } from './feature-flag.provider';
import { SSR_ADAPTER } from '../angular/ssr-adapter';

/**
 * Feature flag provider that reads flags from browser localStorage
 * 
 * **SSR Compatible:** Automatically detects server-side rendering and
 * uses SSR adapter if provided, otherwise gracefully falls back.
 * 
 * Stores flags as JSON in localStorage with the key format: `featureFlags:${flagName}`
 * 
 * @example
 * ```typescript
 * // Set a flag in localStorage (browser only)
 * localStorage.setItem('featureFlags:newDashboard', 'true');
 * 
 * // Use in providers
 * provideFeatureFlagProvider(LocalStorageFeatureFlagProvider)
 * 
 * // With SSR support
 * provideSsrAdapter()
 * provideFeatureFlagProvider(LocalStorageFeatureFlagProvider)
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageFeatureFlagProvider implements FeatureFlagProvider {
  private readonly prefix = 'featureFlags:';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ssrAdapter = inject(SSR_ADAPTER, { optional: true });

  /**
   * Safely gets an item from storage (localStorage or SSR adapter)
   */
  private getStorageItem(key: string): string | null {
    // Use SSR adapter if available
    if (this.ssrAdapter) {
      return this.ssrAdapter.getStorageItem(key);
    }

    // Fallback: check platform and use localStorage if available
    if (isPlatformServer(this.platformId)) {
      // On server without adapter, return null
      return null;
    }

    // On browser, use localStorage if available
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch {
      // localStorage might be disabled or unavailable
    }
    return null;
  }

  /**
   * Checks if a feature flag is enabled in localStorage
   * 
   * On server-side, will return false unless SSR adapter is provided with storage.
   */
  async isEnabled(
    flagName: string,
    _context?: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const key = `${this.prefix}${flagName}`;
      const value = this.getStorageItem(key);

      if (value === null) {
        return false;
      }

      // Parse JSON value
      const parsed = JSON.parse(value);
      return parsed === true || parsed === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Gets the raw value of a feature flag from localStorage
   * 
   * On server-side, will return undefined unless SSR adapter is provided with storage.
   */
  async getValue(
    flagName: string,
    _context?: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const key = `${this.prefix}${flagName}`;
      const value = this.getStorageItem(key);

      if (value === null) {
        return undefined;
      }

      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
}

