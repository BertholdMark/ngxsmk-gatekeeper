/**
 * Extension API exports for ngxsmk-gatekeeper
 * 
 * Provides the plugin architecture for third-party extensions.
 * 
 * **Plugin Architecture:**
 * 
 * - Core remains open source
 * - Paid plugins loaded via separate packages
 * - Plugins register middleware via extension API
 * - Core has zero knowledge of paid features
 */

export * from './extension.types';
export * from './extension.registry';
export * from './extension.provider';

