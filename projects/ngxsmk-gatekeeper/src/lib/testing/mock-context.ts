/**
 * Mock context generators for testing middleware
 */

import { MiddlewareContext } from '../core';

/**
 * User object for testing
 */
export interface MockUser {
  id?: string;
  email?: string;
  isAuthenticated?: boolean;
  roles?: string[];
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * HTTP request mock for testing
 */
export interface MockHttpRequest {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

/**
 * Route context mock for testing
 */
export interface MockRouteContext {
  path?: string;
  params?: Record<string, string>;
  queryParams?: Record<string, string>;
  data?: Record<string, unknown>;
}

/**
 * Options for creating mock context
 */
export interface MockContextOptions {
  user?: MockUser | null;
  request?: MockHttpRequest;
  route?: MockRouteContext;
  shared?: Record<string, unknown>;
  contextType?: 'route' | 'http';
  [key: string]: unknown;
}

/**
 * Creates a mock middleware context for testing
 *
 * @param options - Options for creating the mock context
 * @returns A mock MiddlewareContext object
 *
 * @example
 * ```typescript
 * // Simple authenticated user context
 * const context = createMockContext({
 *   user: { isAuthenticated: true, roles: ['admin'] }
 * });
 *
 * // HTTP request context
 * const httpContext = createMockContext({
 *   contextType: 'http',
 *   request: {
 *     method: 'POST',
 *     url: '/api/users',
 *     headers: { 'Authorization': 'Bearer token' }
 *   }
 * });
 *
 * // Route context
 * const routeContext = createMockContext({
 *   contextType: 'route',
 *   route: {
 *     path: '/dashboard',
 *     params: { id: '123' }
 *   }
 * });
 * ```
 */
export function createMockContext(options: MockContextOptions = {}): MiddlewareContext {
  const {
    user = null,
    request,
    route,
    shared = {},
    contextType = 'route',
    ...additional
  } = options;

  const context: MiddlewareContext = {
    shared: { ...shared },
    contextType,
    ...additional,
  };

  // Add user if provided
  if (user !== null) {
    context['user'] = user;
  }

  // Add request if provided
  if (request) {
    context['request'] = request;
    if (contextType === 'http') {
      context['url'] = request.url;
      context['method'] = request.method;
    }
  }

  // Add route if provided
  if (route) {
    context['route'] = route;
    if (contextType === 'route') {
      context['path'] = route.path;
      context['params'] = route.params;
      context['queryParams'] = route.queryParams;
      if (route.data) {
        context['data'] = route.data;
      }
    }
  }

  return context;
}

/**
 * Creates a mock context with an authenticated user
 *
 * @param user - User object (optional, defaults to authenticated user)
 * @returns Mock context with authenticated user
 */
export function createAuthenticatedContext(user?: Partial<MockUser>): MiddlewareContext {
  return createMockContext({
    user: {
      id: '1',
      email: 'user@example.com',
      isAuthenticated: true,
      roles: ['user'],
      ...user,
    },
  });
}

/**
 * Creates a mock context with an unauthenticated user
 *
 * @returns Mock context with no user
 */
export function createUnauthenticatedContext(): MiddlewareContext {
  return createMockContext({
    user: null,
  });
}

/**
 * Creates a mock context with a user having specific roles
 *
 * @param roles - Array of role names
 * @param user - Additional user properties
 * @returns Mock context with user having specified roles
 */
export function createRoleContext(roles: string[], user?: Partial<MockUser>): MiddlewareContext {
  return createMockContext({
    user: {
      id: '1',
      email: 'user@example.com',
      isAuthenticated: true,
      roles,
      ...user,
    },
  });
}

/**
 * Creates a mock HTTP request context
 *
 * @param request - HTTP request details
 * @param user - Optional user object
 * @returns Mock context for HTTP request
 */
export function createHttpContext(
  request: MockHttpRequest,
  user?: MockUser | null
): MiddlewareContext {
  return createMockContext({
    contextType: 'http',
    request,
    user: user ?? null,
  });
}

/**
 * Creates a mock route context
 *
 * @param route - Route details
 * @param user - Optional user object
 * @returns Mock context for route
 */
export function createRouteContext(
  route: MockRouteContext,
  user?: MockUser | null
): MiddlewareContext {
  return createMockContext({
    contextType: 'route',
    route,
    user: user ?? null,
  });
}

/**
 * Creates multiple mock contexts for batch testing
 *
 * @param contexts - Array of context options
 * @returns Array of mock contexts
 */
export function createMockContexts(
  contexts: MockContextOptions[]
): MiddlewareContext[] {
  return contexts.map(options => createMockContext(options));
}

