/**
 * Global debug hook type declarations
 * 
 * @experimental This API is experimental and may change in future versions.
 * Only available in development mode.
 */

import { NgxsmkGatekeeperDebugHook } from './debug-hook';

declare global {
  interface Window {
    /**
     * Global debug hook for ngxsmk-gatekeeper
     * 
     * @experimental This API is experimental and may change in future versions.
     * Only available in development mode when debug is enabled.
     * 
     * @example
     * ```typescript
     * // Access from browser console or extension
     * const hook = window.__NGXSMK_GATEKEEPER__;
     * if (hook) {
     *   const stats = hook.getStats();
     *   const latestChain = hook.getLatestChain();
     *   console.log('Latest chain:', latestChain);
     * }
     * ```
     */
    __NGXSMK_GATEKEEPER__?: NgxsmkGatekeeperDebugHook;
  }
}

