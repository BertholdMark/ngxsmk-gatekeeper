/**
 * Diagnostics exports for ngxsmk-gatekeeper
 * 
 * Provides utilities to collect and export diagnostic information.
 * 
 * **IMPORTANT: Export is explicit and manual**
 * 
 * - Diagnostics are only collected when explicitly requested
 * - Export functions must be called manually by the user
 * - Never runs automatically or in the background
 */

export * from './diagnostics.types';
export * from './diagnostics.collector';
export * from './diagnostics.exporter';

