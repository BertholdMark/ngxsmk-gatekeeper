/**
 * License verification hook exports for ngxsmk-gatekeeper
 * 
 * Provides optional license verification hook for enterprise plugins.
 * 
 * **IMPORTANT: Core does not enforce licensing**
 * 
 * - Core provides hook only
 * - Enterprise plugins verify licenses
 * - Graceful degradation when license is invalid
 * - Never blocks application startup
 */

export * from './license.types';
export * from './license.registry';
export * from './license.provider';
export * from './license.middleware';

