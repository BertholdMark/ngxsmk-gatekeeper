/**
 * Angular provider for marketplace
 */

import { InjectionToken, Provider } from '@angular/core';
import { MarketplaceConfig } from './marketplace.types';

/**
 * Injection token for marketplace configuration
 */
export const MARKETPLACE_CONFIG = new InjectionToken<MarketplaceConfig>(
  'MARKETPLACE_CONFIG'
);

/**
 * Provides marketplace configuration
 *
 * @param config - Marketplace configuration
 * @returns Provider for marketplace configuration
 */
export function provideMarketplace(config: MarketplaceConfig = {}): Provider {
  return {
    provide: MARKETPLACE_CONFIG,
    useValue: config,
  };
}

