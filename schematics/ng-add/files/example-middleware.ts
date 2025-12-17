import { createMiddleware } from 'ngxsmk-gatekeeper';
import { MiddlewareContext } from 'ngxsmk-gatekeeper/lib/core';

/**
 * Example middleware - checks if user is authenticated
 * 
 * This is a simple example. Replace with your actual authentication logic.
 */
export const exampleAuthMiddleware = createMiddleware('example-auth', (context: MiddlewareContext) => {
  // Check if user is authenticated
  // Replace this with your actual authentication check
  const user = context['user'] as { isAuthenticated?: boolean } | undefined;
  return user?.isAuthenticated ?? false;
});

