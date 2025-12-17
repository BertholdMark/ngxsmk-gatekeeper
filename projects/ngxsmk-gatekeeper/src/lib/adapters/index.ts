/**
 * Adapter API exports for ngxsmk-gatekeeper
 * 
 * Provides the adapter architecture for authentication providers.
 * All adapters are open source and free to use.
 * 
 * **Adapter Architecture:**
 * 
 * - Core remains open source
 * - Adapters loaded via separate packages (all open source)
 * - Adapters implement AuthAdapter interface
 * - Core has zero knowledge of adapter implementations
 */

export * from './adapter.types';
export * from './adapter.middleware';
export * from './adapter.registry';
export * from './adapter.provider';

