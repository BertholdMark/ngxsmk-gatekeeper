/**
 * Unit test helpers for individual middleware testing
 */

import { NgxMiddleware, MiddlewareContext } from '../core';
import { createMockContext, MockContextOptions } from './mock-context';
import { resolveMiddlewareResult, expectMiddlewareToAllow, expectMiddlewareToDeny } from './test-assertions';

/**
 * Test case for middleware unit testing
 */
export interface MiddlewareTestCase {
  name: string;
  context: MockContextOptions;
  expected: boolean;
  expectedRedirect?: string;
  maxDuration?: number;
}

/**
 * Runs a single middleware with a test context
 *
 * @param middleware - Middleware function to test
 * @param context - Test context
 * @returns Result of middleware execution
 *
 * @example
 * ```typescript
 * const context = createAuthenticatedContext();
 * const result = await testMiddleware(authMiddleware, context);
 * expect(result.result).toBe(true);
 * ```
 */
export async function testMiddleware(
  middleware: NgxMiddleware,
  context: MiddlewareContext
): Promise<{ result: boolean; redirect?: string; duration: number }> {
  const startTime = Date.now();
  const result = await resolveMiddlewareResult(middleware(context));
  const duration = Date.now() - startTime;

  return {
    ...result,
    duration,
  };
}

/**
 * Runs multiple test cases against a single middleware
 *
 * @param middleware - Middleware function to test
 * @param testCases - Array of test cases
 * @returns Array of test results
 *
 * @example
 * ```typescript
 * const results = await testMiddlewareWithCases(authMiddleware, [
 *   {
 *     name: 'Authenticated user',
 *     context: { user: { isAuthenticated: true } },
 *     expected: true,
 *   },
 *   {
 *     name: 'Unauthenticated user',
 *     context: { user: null },
 *     expected: false,
 *   },
 * ]);
 * ```
 */
export async function testMiddlewareWithCases(
  middleware: NgxMiddleware,
  testCases: MiddlewareTestCase[]
): Promise<Array<{ name: string; passed: boolean; result: { result: boolean; redirect?: string; duration: number } }>> {
  const results: Array<{ name: string; passed: boolean; result: { result: boolean; redirect?: string; duration: number } }> = [];

  for (const testCase of testCases) {
    const context = createMockContext(testCase.context);
    const result = await testMiddleware(middleware, context);

    let passed = result.result === testCase.expected;

    if (testCase.expectedRedirect !== undefined) {
      passed = passed && result.redirect === testCase.expectedRedirect;
    }

    if (testCase.maxDuration !== undefined && result.duration > testCase.maxDuration) {
      passed = false;
    }

    results.push({
      name: testCase.name,
      passed,
      result,
    });
  }

  return results;
}

/**
 * Creates a test helper for a specific middleware
 *
 * @param middleware - Middleware function to test
 * @returns Test helper object with convenience methods
 *
 * @example
 * ```typescript
 * const authTester = createMiddlewareTester(authMiddleware);
 *
 * // Test with authenticated user
 * await authTester.withAuthenticatedUser().expectToAllow();
 *
 * // Test with unauthenticated user
 * await authTester.withUnauthenticatedUser().expectToDeny();
 * ```
 */
export function createMiddlewareTester(middleware: NgxMiddleware) {
  return {
    /**
     * Test with authenticated user
     */
    withAuthenticatedUser(user?: Partial<{ isAuthenticated: boolean; roles: string[] }>) {
      const context = createMockContext({
        user: {
          isAuthenticated: true,
          roles: ['user'],
          ...user,
        },
      });

      return {
        expectToAllow: async () => {
          await expectMiddlewareToAllow(middleware(context));
        },
        expectToDeny: async () => {
          await expectMiddlewareToDeny(middleware(context));
        },
        expectResult: async (expected: boolean) => {
          const result = await testMiddleware(middleware, context);
          if (result.result !== expected) {
            throw new Error(`Expected ${expected}, but got ${result.result}`);
          }
        },
      };
    },

    /**
     * Test with unauthenticated user
     */
    withUnauthenticatedUser() {
      const context = createMockContext({ user: null });

      return {
        expectToAllow: async () => {
          await expectMiddlewareToAllow(middleware(context));
        },
        expectToDeny: async () => {
          await expectMiddlewareToDeny(middleware(context));
        },
        expectResult: async (expected: boolean) => {
          const result = await testMiddleware(middleware, context);
          if (result.result !== expected) {
            throw new Error(`Expected ${expected}, but got ${result.result}`);
          }
        },
      };
    },

    /**
     * Test with custom context
     */
    withContext(contextOptions: MockContextOptions) {
      const context = createMockContext(contextOptions);

      return {
        expectToAllow: async () => {
          await expectMiddlewareToAllow(middleware(context));
        },
        expectToDeny: async () => {
          await expectMiddlewareToDeny(middleware(context));
        },
        expectResult: async (expected: boolean) => {
          const result = await testMiddleware(middleware, context);
          if (result.result !== expected) {
            throw new Error(`Expected ${expected}, but got ${result.result}`);
          }
        },
        getResult: async () => {
          return testMiddleware(middleware, context);
        },
      };
    },
  };
}

