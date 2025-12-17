/**
 * Preset middleware packs for ngxsmk-gatekeeper
 * 
 * These presets are optional imports and can be tree-shaken if not used.
 * Each preset returns a composed pipeline that can be used in GatekeeperConfig.
 * 
 * @example
 * ```typescript
 * // Import only what you need (tree-shakeable)
 * import { authPreset } from 'ngxsmk-gatekeeper/lib/presets';
 * 
 * // Use in configuration
 * provideGatekeeper({
 *   middlewares: [authPreset()],
 *   onFail: '/login'
 * });
 * ```
 */

export * from './auth.preset';
export * from './admin.preset';
export * from './public-only.preset';

