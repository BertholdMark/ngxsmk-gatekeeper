import { PLATFORM_ID, inject, Optional, InjectionToken } from '@angular/core';
import { isPlatformServer } from '@angular/common';

/**
 * SSR adapter configuration
 * 
 * Provides platform detection and SSR-specific utilities
 * for middleware execution during server-side rendering.
 */
export interface SsrAdapterConfig {
  /**
   * Whether SSR is enabled
   * If not provided, will be auto-detected using isPlatformServer
   */
  enabled?: boolean;
  /**
   * Custom storage adapter for SSR (e.g., request-scoped storage)
   * If not provided, browser-only APIs will be disabled on server
   */
  storageAdapter?: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  };
}

/**
 * SSR adapter service for handling server-side rendering scenarios
 * 
 * This service is optional and only needed when using SSR.
 * It provides platform detection and SSR-safe utilities.
 */
export class SsrAdapter {
  private readonly isServer: boolean;
  private readonly storageAdapter?: SsrAdapterConfig['storageAdapter'];

  constructor(
    platformId: object,
    @Optional() config?: SsrAdapterConfig
  ) {
    this.isServer = isPlatformServer(platformId);
    this.storageAdapter = config?.storageAdapter;
  }

  /**
   * Checks if code is running on the server
   */
  get isServerPlatform(): boolean {
    return this.isServer;
  }

  /**
   * Checks if code is running in the browser
   */
  get isBrowserPlatform(): boolean {
    return !this.isServer;
  }

  /**
   * Safely gets an item from storage (localStorage or SSR adapter)
   * Returns null if storage is not available
   */
  getStorageItem(key: string): string | null {
    if (this.isServer) {
      // On server, use adapter if provided, otherwise return null
      if (this.storageAdapter) {
        return this.storageAdapter.getItem(key);
      }
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
   * Safely sets an item in storage (localStorage or SSR adapter)
   */
  setStorageItem(key: string, value: string): void {
    if (this.isServer) {
      // On server, use adapter if provided
      if (this.storageAdapter) {
        this.storageAdapter.setItem(key, value);
      }
      return;
    }

    // On browser, use localStorage if available
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {
      // localStorage might be disabled or unavailable
    }
  }

  /**
   * Safely removes an item from storage (localStorage or SSR adapter)
   */
  removeStorageItem(key: string): void {
    if (this.isServer) {
      // On server, use adapter if provided
      if (this.storageAdapter) {
        this.storageAdapter.removeItem(key);
      }
      return;
    }

    // On browser, use localStorage if available
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {
      // localStorage might be disabled or unavailable
    }
  }

  /**
   * Checks if a browser API is available
   * Useful for feature detection before using browser-only APIs
   */
  isBrowserApiAvailable(apiName: string): boolean {
    if (this.isServer) {
      return false;
    }

    try {
      // Check if API exists in global scope
      return typeof (globalThis as Record<string, unknown>)[apiName] !== 'undefined';
    } catch {
      return false;
    }
  }
}

/**
 * Injection token for SSR adapter
 * 
 * Only needed when using Angular Universal/SSR
 */
export const SSR_ADAPTER = new InjectionToken<SsrAdapter>(
  'SSR_ADAPTER',
  {
    providedIn: 'root',
    factory: () => {
      // Default factory - will be created with platform detection
      const platformId = inject(PLATFORM_ID);
      return new SsrAdapter(platformId);
    },
  }
);

/**
 * Provides SSR adapter with optional configuration
 * 
 * This is optional and only needed when using Angular Universal.
 * The adapter will be auto-detected if not explicitly provided.
 * 
 * @param config - Optional SSR adapter configuration
 * @returns Provider configuration
 * 
 * @example
 * ```typescript
 * // Basic usage (auto-detects platform)
 * provideSsrAdapter()
 * 
 * // With custom storage adapter for SSR
 * provideSsrAdapter({
 *   storageAdapter: {
 *     getItem: (key) => requestStorage.get(key),
 *     setItem: (key, value) => requestStorage.set(key, value),
 *     removeItem: (key) => requestStorage.delete(key),
 *   }
 * })
 * ```
 */
export function provideSsrAdapter(
  config?: SsrAdapterConfig
): { provide: typeof SSR_ADAPTER; useFactory: () => SsrAdapter } {
  return {
    provide: SSR_ADAPTER,
    useFactory: () => {
      const platformId = inject(PLATFORM_ID);
      return new SsrAdapter(platformId, config);
    },
  };
}

