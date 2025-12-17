/**
 * Environment-aware middleware exports
 * 
 * Provides utilities for creating middleware that behaves differently
 * based on the runtime environment (development, staging, production).
 * 
 * No build-time replacements required - environment is detected at runtime.
 */

export * from './environment.utils';
export * from './environment.middleware';

