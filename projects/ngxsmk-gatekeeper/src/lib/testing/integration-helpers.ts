/**
 * Integration test helpers for testing middleware chains
 */

import { NgxMiddleware, MiddlewareContext, MiddlewareResult } from '../core';
import { createMockContext, MockContextOptions } from './mock-context';
import { resolveMiddlewareResult } from './test-assertions';

/**
 * Options for running middleware chain tests
 */
export interface MiddlewareChainTestOptions {
  middlewares: NgxMiddleware[];
  contexts: MiddlewareContext[];
  expectedResults?: boolean[];
  stopOnFirstFailure?: boolean;
}

/**
 * Result of middleware chain execution
 */
export interface MiddlewareChainTestResult {
  context: MiddlewareContext;
  result: MiddlewareResult;
  middlewareResults: Array<{
    middleware: string;
    passed: boolean;
    duration: number;
  }>;
  totalDuration: number;
}

/**
 * Runs a middleware chain with a test context
 *
 * @param middlewares - Array of middleware functions
 * @param context - Test context
 * @returns Result of middleware chain execution
 *
 * @example
 * ```typescript
 * const middlewares = [authMiddleware, roleMiddleware];
 * const context = createAuthenticatedContext({ roles: ['admin'] });
 *
 * const result = await runMiddlewareChain(middlewares, context);
 * expect(result.result).toBe(true);
 * ```
 */
export async function runMiddlewareChain(
  middlewares: NgxMiddleware[],
  context: MiddlewareContext
): Promise<MiddlewareChainTestResult> {
  const startTime = Date.now();
  const middlewareResults: Array<{ middleware: string; passed: boolean; duration: number }> = [];
  let stoppedAt = -1;
  let finalResult = true;
  let redirect: string | undefined;

  // Resolve pipelines to flat array (if any are pipelines)
  // For now, assume all are middleware functions
  const resolvedMiddlewares = middlewares;

  for (let i = 0; i < resolvedMiddlewares.length; i++) {
    const middleware = resolvedMiddlewares[i];
    const middlewareStartTime = Date.now();

    try {
      if (!middleware) {
        throw new Error(`Middleware at index ${i} is undefined`);
      }
      const result = await resolveMiddlewareResult(middleware(context));
      const duration = Date.now() - middlewareStartTime;

      const middlewareName = (middleware as any).middlewareName || `Middleware[${i}]`;

      middlewareResults.push({
        middleware: middlewareName,
        passed: result.result,
        duration,
      });

      if (!result.result) {
        stoppedAt = i;
        finalResult = false;
        redirect = result.redirect;
        break;
      }
    } catch (error) {
      const duration = Date.now() - middlewareStartTime;
      const middlewareName = (middleware as any).middlewareName || `Middleware[${i}]`;

      middlewareResults.push({
        middleware: middlewareName,
        passed: false,
        duration,
      });

      stoppedAt = i;
      finalResult = false;
      break;
    }
  }

  const totalDuration = Date.now() - startTime;

  return {
    context,
    result: {
      result: finalResult,
      stoppedAt,
      ...(redirect !== undefined && { redirect }),
    },
    middlewareResults,
    totalDuration,
  };
}

/**
 * Runs multiple test cases against a middleware chain
 *
 * @param options - Test options
 * @returns Array of test results
 *
 * @example
 * ```typescript
 * const results = await runMiddlewareChainTests({
 *   middlewares: [authMiddleware, roleMiddleware],
 *   contexts: [
 *     createAuthenticatedContext({ roles: ['admin'] }),
 *     createUnauthenticatedContext(),
 *   ],
 *   expectedResults: [true, false],
 * });
 * ```
 */
export async function runMiddlewareChainTests(
  options: MiddlewareChainTestOptions
): Promise<MiddlewareChainTestResult[]> {
  const { middlewares, contexts, expectedResults } = options;
  const results: MiddlewareChainTestResult[] = [];

  for (let i = 0; i < contexts.length; i++) {
    const context = contexts[i];
    if (!context) {
      throw new Error(`Context at index ${i} is undefined`);
    }
    const result = await runMiddlewareChain(middlewares, context);

    if (expectedResults && expectedResults[i] !== undefined) {
      if (result.result.result !== expectedResults[i]) {
        throw new Error(
          `Test case ${i} failed: expected ${expectedResults[i]}, got ${result.result.result}`
        );
      }
    }

    results.push(result);
  }

  return results;
}

/**
 * Creates a test suite for a middleware chain
 *
 * @param middlewares - Array of middleware functions
 * @param testCases - Array of test case configurations
 * @returns Test results
 *
 * @example
 * ```typescript
 * const results = await createMiddlewareTestSuite(
 *   [authMiddleware, roleMiddleware],
 *   [
 *     {
 *       name: 'Authenticated admin',
 *       context: { user: { isAuthenticated: true, roles: ['admin'] } },
 *       expected: true,
 *     },
 *     {
 *       name: 'Unauthenticated user',
 *       context: { user: null },
 *       expected: false,
 *     },
 *   ]
 * );
 * ```
 */
export async function createMiddlewareTestSuite(
  middlewares: NgxMiddleware[],
  testCases: Array<{
    name: string;
    context: MockContextOptions;
    expected: boolean;
    expectedRedirect?: string;
  }>
): Promise<Array<MiddlewareChainTestResult & { name: string; expected: boolean; passed: boolean }>> {
  const results: Array<MiddlewareChainTestResult & { name: string; expected: boolean; passed: boolean }> = [];

  for (const testCase of testCases) {
    const context = createMockContext(testCase.context);
    const result = await runMiddlewareChain(middlewares, context);

    const passed =
      result.result.result === testCase.expected &&
      (!testCase.expectedRedirect || result.result.redirect === testCase.expectedRedirect);

    results.push({
      ...result,
      name: testCase.name,
      expected: testCase.expected,
      passed,
    });
  }

  return results;
}

/**
 * Asserts that a middleware chain result matches expected values
 *
 * @param result - Middleware chain test result
 * @param expected - Expected result
 * @param message - Optional error message
 * @throws Error if result does not match expected
 */
export function expectChainResult(
  result: MiddlewareChainTestResult,
  expected: { result: boolean; stoppedAt?: number; redirect?: string },
  message?: string
): void {
  if (result.result.result !== expected.result) {
    throw new Error(
      message ||
        `Expected chain result ${expected.result}, but got ${result.result.result}`
    );
  }

  if (expected.stoppedAt !== undefined && result.result.stoppedAt !== expected.stoppedAt) {
    throw new Error(
      message ||
        `Expected chain to stop at index ${expected.stoppedAt}, but stopped at ${result.result.stoppedAt}`
    );
  }

  if (expected.redirect !== undefined && result.result.redirect !== expected.redirect) {
    throw new Error(
      message ||
        `Expected redirect "${expected.redirect}", but got "${result.result.redirect}"`
    );
  }
}

