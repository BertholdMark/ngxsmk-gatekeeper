/**
 * Testing utilities for ngxsmk-gatekeeper
 *
 * This module provides utilities for testing middleware, including:
 * - Mock context generators
 * - Test assertion utilities
 * - Integration test helpers
 * - Unit test helpers
 *
 * @example
 * ```typescript
 * import {
 *   createMockContext,
 *   createAuthenticatedContext,
 *   expectMiddlewareToAllow,
 *   testMiddleware,
 * } from 'ngxsmk-gatekeeper/lib/testing';
 *
 * // Create a test context
 * const context = createAuthenticatedContext({ roles: ['admin'] });
 *
 * // Test middleware
 * await expectMiddlewareToAllow(authMiddleware(context));
 * ```
 */

// Mock context generators
export * from './mock-context';

// Test assertions
export * from './test-assertions';

// Integration test helpers
export * from './integration-helpers';

// Unit test helpers
export * from './unit-helpers';

