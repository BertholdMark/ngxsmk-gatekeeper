/**
 * Angular-related exports for ngxsmk-gatekeeper
 */

export * from './gatekeeper.config';
export * from './gatekeeper.provider';
export * from './gatekeeper.guard';
export * from './gatekeeper.interceptor';
export * from './route-gatekeeper.config';
export * from './http-gatekeeper.context';
// SSR adapter is optional - export separately to allow tree-shaking
export * from './ssr-adapter';

