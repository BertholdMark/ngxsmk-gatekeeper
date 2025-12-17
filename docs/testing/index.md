# Testing Utilities

Complete guide to testing middleware with ngxsmk-gatekeeper testing utilities.

## Overview

ngxsmk-gatekeeper provides comprehensive testing utilities for:
- **Unit Testing** - Test individual middleware functions
- **Integration Testing** - Test middleware chains
- **Mock Contexts** - Generate test contexts easily
- **Assertions** - Built-in assertion helpers

## Installation

Testing utilities are included in the main package:

```bash
npm install ngxsmk-gatekeeper
```

## Quick Start

```typescript
import {
  createAuthenticatedContext,
  expectMiddlewareToAllow,
  testMiddleware,
} from 'ngxsmk-gatekeeper/lib/testing';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// Create middleware
const authMiddleware = createAuthMiddleware();

// Create test context
const context = createAuthenticatedContext();

// Test middleware
await expectMiddlewareToAllow(authMiddleware(context));
```

## Mock Contexts

### Basic Context Creation

```typescript
import { createMockContext } from 'ngxsmk-gatekeeper/lib/testing';

// Simple context
const context = createMockContext({
  user: { isAuthenticated: true },
});

// With route information
const routeContext = createMockContext({
  contextType: 'route',
  route: {
    path: '/dashboard',
    params: { id: '123' },
  },
});

// With HTTP request
const httpContext = createMockContext({
  contextType: 'http',
  request: {
    method: 'POST',
    url: '/api/users',
    headers: { 'Authorization': 'Bearer token' },
  },
});
```

### Pre-built Contexts

```typescript
import {
  createAuthenticatedContext,
  createUnauthenticatedContext,
  createRoleContext,
  createHttpContext,
  createRouteContext,
} from 'ngxsmk-gatekeeper/lib/testing';

// Authenticated user
const authContext = createAuthenticatedContext({
  roles: ['admin'],
  email: 'admin@example.com',
});

// Unauthenticated user
const unauthContext = createUnauthenticatedContext();

// User with specific roles
const adminContext = createRoleContext(['admin', 'superuser']);

// HTTP request context
const httpContext = createHttpContext({
  method: 'GET',
  url: '/api/data',
});

// Route context
const routeContext = createRouteContext({
  path: '/dashboard',
  params: { id: '123' },
});
```

## Unit Testing

### Basic Unit Test

```typescript
import { testMiddleware } from 'ngxsmk-gatekeeper/lib/testing';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const authMiddleware = createAuthMiddleware();

describe('AuthMiddleware', () => {
  it('should allow authenticated users', async () => {
    const context = createAuthenticatedContext();
    const result = await testMiddleware(authMiddleware, context);
    
    expect(result.result).toBe(true);
  });

  it('should deny unauthenticated users', async () => {
    const context = createUnauthenticatedContext();
    const result = await testMiddleware(authMiddleware, context);
    
    expect(result.result).toBe(false);
  });
});
```

### Using Test Cases

```typescript
import { testMiddlewareWithCases } from 'ngxsmk-gatekeeper/lib/testing';

const testCases = [
  {
    name: 'Authenticated user',
    context: { user: { isAuthenticated: true } },
    expected: true,
  },
  {
    name: 'Unauthenticated user',
    context: { user: null },
    expected: false,
  },
  {
    name: 'User with admin role',
    context: { user: { isAuthenticated: true, roles: ['admin'] } },
    expected: true,
  },
];

const results = await testMiddlewareWithCases(authMiddleware, testCases);

results.forEach(result => {
  expect(result.passed).toBe(true);
});
```

### Using Middleware Tester

```typescript
import { createMiddlewareTester } from 'ngxsmk-gatekeeper/lib/testing';

const authTester = createMiddlewareTester(authMiddleware);

// Fluent API
await authTester.withAuthenticatedUser().expectToAllow();
await authTester.withUnauthenticatedUser().expectToDeny();

// Custom context
await authTester.withContext({
  user: { isAuthenticated: true, roles: ['admin'] },
}).expectToAllow();
```

## Integration Testing

### Testing Middleware Chains

```typescript
import {
  runMiddlewareChain,
  runMiddlewareChainTests,
} from 'ngxsmk-gatekeeper/lib/testing';

const middlewares = [authMiddleware, roleMiddleware];

// Test single chain execution
const context = createAuthenticatedContext({ roles: ['admin'] });
const result = await runMiddlewareChain(middlewares, context);

expect(result.result.result).toBe(true);
expect(result.middlewareResults).toHaveLength(2);
```

### Multiple Test Cases

```typescript
const results = await runMiddlewareChainTests({
  middlewares: [authMiddleware, roleMiddleware],
  contexts: [
    createAuthenticatedContext({ roles: ['admin'] }),
    createUnauthenticatedContext(),
    createRoleContext(['user']),
  ],
  expectedResults: [true, false, false],
});
```

### Test Suite

```typescript
import { createMiddlewareTestSuite } from 'ngxsmk-gatekeeper/lib/testing';

const results = await createMiddlewareTestSuite(
  [authMiddleware, roleMiddleware],
  [
    {
      name: 'Authenticated admin',
      context: { user: { isAuthenticated: true, roles: ['admin'] } },
      expected: true,
    },
    {
      name: 'Unauthenticated user',
      context: { user: null },
      expected: false,
    },
    {
      name: 'User without admin role',
      context: { user: { isAuthenticated: true, roles: ['user'] } },
      expected: false,
    },
  ]
);

results.forEach(result => {
  expect(result.passed).toBe(true);
});
```

## Assertions

### Basic Assertions

```typescript
import {
  expectMiddlewareToAllow,
  expectMiddlewareToDeny,
  expectMiddlewareToRedirect,
} from 'ngxsmk-gatekeeper/lib/testing';

// Assert middleware allows
await expectMiddlewareToAllow(middleware(context));

// Assert middleware denies
await expectMiddlewareToDeny(middleware(context));

// Assert middleware redirects
await expectMiddlewareToRedirect(
  middleware(context),
  '/login'
);
```

### Performance Assertions

```typescript
import { expectMiddlewareToCompleteWithin } from 'ngxsmk-gatekeeper/lib/testing';

// Assert middleware completes within time limit
await expectMiddlewareToCompleteWithin(
  middleware(context),
  100 // milliseconds
);
```

### Custom Assertions

```typescript
import { expectMiddlewareResult } from 'ngxsmk-gatekeeper/lib/testing';

// Assert specific result
await expectMiddlewareResult(
  middleware(context),
  { allow: true }
);

// Assert with redirect
await expectMiddlewareResult(
  middleware(context),
  { allow: false, redirect: '/login' }
);
```

## Complete Example

```typescript
import { describe, it, expect } from '@jest/globals';
import {
  createAuthenticatedContext,
  createUnauthenticatedContext,
  createRoleContext,
  testMiddlewareWithCases,
  runMiddlewareChain,
  expectMiddlewareToAllow,
  expectMiddlewareToDeny,
} from 'ngxsmk-gatekeeper/lib/testing';
import {
  createAuthMiddleware,
  createRoleMiddleware,
} from 'ngxsmk-gatekeeper/lib/middlewares';

describe('Middleware Tests', () => {
  const authMiddleware = createAuthMiddleware();
  const adminMiddleware = createRoleMiddleware({ roles: ['admin'] });

  describe('AuthMiddleware', () => {
    it('should allow authenticated users', async () => {
      const context = createAuthenticatedContext();
      await expectMiddlewareToAllow(authMiddleware(context));
    });

    it('should deny unauthenticated users', async () => {
      const context = createUnauthenticatedContext();
      await expectMiddlewareToDeny(authMiddleware(context));
    });
  });

  describe('RoleMiddleware', () => {
    it('should allow users with admin role', async () => {
      const context = createRoleContext(['admin']);
      await expectMiddlewareToAllow(adminMiddleware(context));
    });

    it('should deny users without admin role', async () => {
      const context = createRoleContext(['user']);
      await expectMiddlewareToDeny(adminMiddleware(context));
    });
  });

  describe('Middleware Chain', () => {
    it('should allow authenticated admin', async () => {
      const middlewares = [authMiddleware, adminMiddleware];
      const context = createAuthenticatedContext({ roles: ['admin'] });
      
      const result = await runMiddlewareChain(middlewares, context);
      
      expect(result.result.result).toBe(true);
      expect(result.middlewareResults).toHaveLength(2);
      expect(result.middlewareResults[0].passed).toBe(true);
      expect(result.middlewareResults[1].passed).toBe(true);
    });

    it('should deny unauthenticated user', async () => {
      const middlewares = [authMiddleware, adminMiddleware];
      const context = createUnauthenticatedContext();
      
      const result = await runMiddlewareChain(middlewares, context);
      
      expect(result.result.result).toBe(false);
      expect(result.result.stoppedAt).toBe(0); // Stopped at first middleware
    });
  });
});
```

## Best Practices

1. **Use Pre-built Contexts** - Use `createAuthenticatedContext()` instead of manually creating contexts
2. **Test Edge Cases** - Test with null, undefined, and empty values
3. **Test Performance** - Use `expectMiddlewareToCompleteWithin()` for performance-critical middleware
4. **Test Chains** - Always test middleware chains, not just individual middleware
5. **Use Descriptive Names** - Name test cases clearly to understand what's being tested

## Next Steps

- [Mock Contexts API Reference](../api/testing/mock-context)
- [Test Assertions API Reference](../api/testing/assertions)
- [Integration Helpers API Reference](../api/testing/integration)
- [Unit Helpers API Reference](../api/testing/unit)

