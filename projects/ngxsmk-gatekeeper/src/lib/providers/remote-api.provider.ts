import { Injectable, inject, Optional, Provider, Inject, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FeatureFlagProvider, FEATURE_FLAG_PROVIDER } from './feature-flag.provider';

/**
 * Configuration for remote API feature flag provider
 */
export interface RemoteApiFeatureFlagProviderConfig {
  /**
   * Base URL for the feature flag API
   * @default '/api/feature-flags'
   */
  apiUrl?: string;
  /**
   * HTTP method to use for fetching flags
   * @default 'GET'
   */
  method?: 'GET' | 'POST';
  /**
   * Cache duration in milliseconds
   * Flags will be cached for this duration to reduce API calls
   * @default 60000 (1 minute)
   */
  cacheMs?: number;
}

/**
 * Injection token for RemoteApiFeatureFlagProvider configuration
 */
export const REMOTE_API_FEATURE_FLAG_CONFIG = new InjectionToken<RemoteApiFeatureFlagProviderConfig>(
  'REMOTE_API_FEATURE_FLAG_CONFIG'
);

/**
 * Cached flag entry
 */
interface CachedFlag {
  value: boolean;
  timestamp: number;
}

/**
 * Feature flag provider that fetches flags from a remote API
 * 
 * This is a mock/example implementation. For production use, you should:
 * - Implement proper error handling
 * - Add authentication headers
 * - Handle network failures gracefully
 * - Implement retry logic
 * - Use your actual feature flag service API
 * 
 * @example
 * ```typescript
 * // Configure remote API provider
 * provideFeatureFlagProvider(
 *   RemoteApiFeatureFlagProvider,
 *   {
 *     apiUrl: '/api/feature-flags',
 *     cacheMs: 30000
 *   }
 * )
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class RemoteApiFeatureFlagProvider implements FeatureFlagProvider {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly config: Required<RemoteApiFeatureFlagProviderConfig>;
  private readonly cache = new Map<string, CachedFlag>();

  constructor(
    @Inject(REMOTE_API_FEATURE_FLAG_CONFIG) @Optional() config?: RemoteApiFeatureFlagProviderConfig
  ) {
    this.config = {
      apiUrl: config?.apiUrl ?? '/api/feature-flags',
      method: config?.method ?? 'GET',
      cacheMs: config?.cacheMs ?? 60000,
    };
  }

  /**
   * Checks if a feature flag is enabled by fetching from remote API
   */
  async isEnabled(
    flagName: string,
    context?: Record<string, unknown>
  ): Promise<boolean> {
    // Check cache first
    const cached = this.getCached(flagName);
    if (cached !== null) {
      return cached;
    }

    // If no HTTP client available, return false
    if (!this.http) {
      console.warn(
        'RemoteApiFeatureFlagProvider: HttpClient not available. Provide HttpClient to use remote API provider.'
      );
      return false;
    }

    try {
      // Fetch from API
      const response = await firstValueFrom(
        this.fetchFlag(flagName, context).pipe(
          catchError((error) => {
            console.error(
              `Failed to fetch feature flag "${flagName}":`,
              error
            );
            return of({ enabled: false });
          })
        )
      );

      const enabled = response.enabled === true;
      
      // Cache the result
      this.setCached(flagName, enabled);

      return enabled;
    } catch (error) {
      console.error(`Error checking feature flag "${flagName}":`, error);
      return false;
    }
  }

  /**
   * Gets the raw value of a feature flag from remote API
   */
  async getValue(
    flagName: string,
    context?: Record<string, unknown>
  ): Promise<unknown> {
    // Check cache first
    const cached = this.getCached(flagName);
    if (cached !== null) {
      return cached;
    }

    if (!this.http) {
      return undefined;
    }

    try {
      const response = await firstValueFrom(
        this.fetchFlag(flagName, context).pipe(
          catchError(() => of({ enabled: false, value: undefined }))
        )
      );

      const value = response.value ?? response.enabled;
      this.setCached(flagName, Boolean(value));

      return value;
    } catch {
      return undefined;
    }
  }

  /**
   * Fetches flag from remote API
   */
  private fetchFlag(
    flagName: string,
    context?: Record<string, unknown>
  ): Observable<{ enabled: boolean; value?: unknown }> {
    const url = `${this.config.apiUrl}/${flagName}`;

    if (!this.http) {
      throw new Error('HttpClient is required for RemoteApiFeatureFlagProvider');
    }

    if (this.config.method === 'POST') {
      return this.http
        .post<{ enabled: boolean; value?: unknown }>(url, { context })
        .pipe(map((response) => response || { enabled: false }));
    } else {
      return this.http
        .get<{ enabled: boolean; value?: unknown }>(url)
        .pipe(map((response) => response || { enabled: false }));
    }
  }

  /**
   * Gets cached flag value if still valid
   */
  private getCached(flagName: string): boolean | null {
    const cached = this.cache.get(flagName);
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheMs) {
      // Cache expired
      this.cache.delete(flagName);
      return null;
    }

    return cached.value;
  }

  /**
   * Sets cached flag value
   */
  private setCached(flagName: string, value: boolean): void {
    this.cache.set(flagName, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Clears the cache for a specific flag or all flags
   */
  clearCache(flagName?: string): void {
    if (flagName) {
      this.cache.delete(flagName);
    } else {
      this.cache.clear();
    }
  }
}

/**
 * Provides a feature flag provider using dependency injection
 * 
 * @param providerClass - Class implementing FeatureFlagProvider
 * @param config - Optional configuration for the provider
 * @returns Provider configuration
 * 
 * @example
 * ```typescript
 * // Use LocalStorage provider
 * provideFeatureFlagProvider(LocalStorageFeatureFlagProvider)
 * 
 * // Use Remote API provider with config
 * provideFeatureFlagProvider(RemoteApiFeatureFlagProvider, {
 *   apiUrl: '/api/flags',
 *   cacheMs: 30000
 * })
 * ```
 */
export function provideFeatureFlagProvider(
  providerClass: new (...args: unknown[]) => FeatureFlagProvider,
  config?: unknown
): Provider {
  if (config) {
    return {
      provide: FEATURE_FLAG_PROVIDER,
      useFactory: () => new providerClass(config),
    };
  }
  return {
    provide: FEATURE_FLAG_PROVIDER,
    useClass: providerClass,
  };
}

