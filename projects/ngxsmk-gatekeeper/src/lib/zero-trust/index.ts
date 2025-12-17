/**
 * Zero Trust enforcement mode exports
 * 
 * Provides utilities for zero trust security model where:
 * - Every route and request must explicitly opt in
 * - Default behavior is deny
 * - Public routes must declare publicMiddleware()
 */

export * from './public.middleware';

