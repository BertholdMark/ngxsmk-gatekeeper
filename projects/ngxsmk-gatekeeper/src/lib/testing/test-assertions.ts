/**
 * Test assertion utilities for middleware testing
 */

import { MiddlewareReturn, MiddlewareResponse } from '../core';
import { firstValueFrom, isObservable } from 'rxjs';

/**
 * Result of middleware execution
 */
export interface MiddlewareTestResult {
  result: boolean;
  redirect?: string;
  duration: number;
}

/**
 * Asserts that middleware returns true (allows access)
 *
 * @param result - Middleware return value
 * @param message - Optional error message
 * @throws Error if middleware does not return true
 */
export async function expectMiddlewareToAllow(
  result: MiddlewareReturn,
  message?: string
): Promise<void> {
  const resolved = await resolveMiddlewareResult(result);
  if (!resolved.result) {
    throw new Error(
      message || `Expected middleware to allow access, but it returned false${resolved.redirect ? ` with redirect: ${resolved.redirect}` : ''}`
    );
  }
}

/**
 * Asserts that middleware returns false (denies access)
 *
 * @param result - Middleware return value
 * @param message - Optional error message
 * @throws Error if middleware does not return false
 */
export async function expectMiddlewareToDeny(
  result: MiddlewareReturn,
  message?: string
): Promise<void> {
  const resolved = await resolveMiddlewareResult(result);
  if (resolved.result) {
    throw new Error(
      message || 'Expected middleware to deny access, but it returned true'
    );
  }
}

/**
 * Asserts that middleware redirects to a specific path
 *
 * @param result - Middleware return value
 * @param expectedRedirect - Expected redirect path
 * @param message - Optional error message
 * @throws Error if middleware does not redirect to expected path
 */
export async function expectMiddlewareToRedirect(
  result: MiddlewareReturn,
  expectedRedirect: string,
  message?: string
): Promise<void> {
  const resolved = await resolveMiddlewareResult(result);
  if (!resolved.redirect) {
    throw new Error(
      message || `Expected middleware to redirect, but no redirect was provided`
    );
  }
  if (resolved.redirect !== expectedRedirect) {
    throw new Error(
      message || `Expected redirect to "${expectedRedirect}", but got "${resolved.redirect}"`
    );
  }
}

/**
 * Resolves middleware return value to a simple result
 *
 * @param result - Middleware return value (boolean, Promise, or Observable)
 * @returns Resolved result with boolean and optional redirect
 */
export async function resolveMiddlewareResult(
  result: MiddlewareReturn
): Promise<{ result: boolean; redirect?: string }> {
  const startTime = Date.now();

  let resolved: boolean | MiddlewareResponse;

  // Handle Observable
  if (isObservable(result)) {
    resolved = await firstValueFrom(result);
  }
  // Handle Promise
  else if (result instanceof Promise) {
    resolved = await result;
  }
  // Handle synchronous result
  else {
    resolved = result;
  }

  // Normalize to response object
  const response: MiddlewareResponse =
    typeof resolved === 'boolean'
      ? { allow: resolved }
      : resolved;

  const duration = Date.now() - startTime;

  return {
    result: response.allow,
    redirect: response.redirect,
    duration,
  } as MiddlewareTestResult;
}

/**
 * Asserts that middleware executes within a time limit
 *
 * @param result - Middleware return value
 * @param maxDuration - Maximum allowed duration in milliseconds
 * @param message - Optional error message
 * @throws Error if middleware exceeds time limit
 */
export async function expectMiddlewareToCompleteWithin(
  result: MiddlewareReturn,
  maxDuration: number,
  message?: string
): Promise<MiddlewareTestResult> {
  const startTime = Date.now();
  const resolved = await resolveMiddlewareResult(result);
  const duration = Date.now() - startTime;

  if (duration > maxDuration) {
    throw new Error(
      message || `Expected middleware to complete within ${maxDuration}ms, but it took ${duration}ms`
    );
  }

  return { ...resolved, duration } as MiddlewareTestResult;
}

/**
 * Asserts that middleware result matches expected value
 *
 * @param result - Middleware return value
 * @param expected - Expected result (boolean or response object)
 * @param message - Optional error message
 * @throws Error if result does not match expected
 */
export async function expectMiddlewareResult(
  result: MiddlewareReturn,
  expected: boolean | MiddlewareResponse,
  message?: string
): Promise<void> {
  const resolved = await resolveMiddlewareResult(result);
  const expectedResult = typeof expected === 'boolean' ? { allow: expected } : expected;

  if (resolved.result !== expectedResult.allow) {
    throw new Error(
      message || `Expected result ${expectedResult.allow}, but got ${resolved.result}`
    );
  }

  if (expectedResult.redirect && resolved.redirect !== expectedResult.redirect) {
    throw new Error(
      message || `Expected redirect "${expectedResult.redirect}", but got "${resolved.redirect}"`
    );
  }
}

/**
 * Creates a test result object for further assertions
 *
 * @param result - Middleware return value
 * @returns Test result object with assertions
 */
export async function testMiddlewareResult(
  result: MiddlewareReturn
): Promise<MiddlewareTestResult> {
  const startTime = Date.now();
  const resolved = await resolveMiddlewareResult(result);
  const duration = Date.now() - startTime;
  return {
    ...resolved,
    duration,
  };
}

