import { InjectionToken, Provider } from '@angular/core';
import { GatekeeperConfig } from './gatekeeper.config';

/**
 * Re-export GatekeeperConfig for convenience
 */
export type { GatekeeperConfig } from './gatekeeper.config';

/**
 * Injection token for Gatekeeper configuration
 */
export const GATEKEEPER_CONFIG = new InjectionToken<GatekeeperConfig>(
  'GATEKEEPER_CONFIG'
);

/**
 * Provides the Gatekeeper configuration using Angular dependency injection
 *
 * @param config - Gatekeeper configuration object
 * @returns Provider for the Gatekeeper configuration
 */
export function provideGatekeeper(config: GatekeeperConfig): Provider {
  return {
    provide: GATEKEEPER_CONFIG,
    useValue: config,
  };
}

