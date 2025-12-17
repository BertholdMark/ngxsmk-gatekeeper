# Middleware Pattern

The middleware pattern is at the core of ngxsmk-gatekeeper. Understanding this pattern is key to using the library effectively.

## What is Middleware?

Middleware is a function that receives a context object and returns a boolean (or Promise/Observable of boolean) indicating whether access should be allowed.

```typescript
type Middleware = (context: MiddlewareContext) => boolean | Promise<boolean> | Observable<boolean>;
```

## Creating Middleware

Use the `createMiddleware` helper to create middleware:

```typescript
import { createMiddleware } from 'ngxsmk-gatekeeper';
import { MiddlewareContext } from 'ngxsmk-gatekeeper';

export const authMiddleware = createMiddleware('auth', (context: MiddlewareContext) => {
  const isAuthenticated = checkAuthentication(context);
  return isAuthenticated;
});
```

## Middleware Context

The `MiddlewareContext` provides access to:

- **Route information**: For route guards (path, params, queryParams, data)
- **HTTP request**: For HTTP interceptors (method, URL, headers, body)
- **User data**: Custom user context you provide
- **Feature flags**: Feature flag provider access
- **Policy registry**: Policy registry access

The context interface structure:

```typescript
interface MiddlewareContext {
  // Route context (when used in guards)
  path?: string;
  params?: Record<string, string>;
  queryParams?: Record<string, string>;
  data?: Record<string, unknown>;
  
  // HTTP context (when used in interceptors)
  request?: HttpRequest;
  
  // Custom context
  user?: User;
}
```

> **Note:** The context supports additional properties through TypeScript's index signature for extensibility.

## Middleware Return Values

Middleware can return:

1. **Boolean**: Synchronous decision
   ```typescript
   return true; // Allow
   return false; // Block
   ```

2. **Promise&lt;boolean&gt;**: Async decision
   ```typescript
   return checkAuthAsync().then(isAuth => isAuth);
   ```

3. **Observable&lt;boolean&gt;**: Reactive decision
   ```typescript
   return authService.isAuthenticated$;
   ```

4. **MiddlewareResponse**: Advanced response with redirect
   ```typescript
   return {
     allow: false,
     redirect: '/login'
   };
   ```

## Chaining Middleware

Middleware is executed sequentially. If any middleware returns `false`, the chain stops and access is denied.

```typescript
provideGatekeeper({
  middlewares: [
    authMiddleware,      // Check authentication first
    roleMiddleware,      // Then check role
    featureFlagMiddleware // Finally check feature flag
  ],
  onFail: '/unauthorized',
});
```

## Built-in Middleware

The library includes several built-in middleware:

- `createAuthMiddleware()` - Authentication check
- `createRoleMiddleware(roles)` - Role-based access
- `createFeatureFlagMiddleware(flag)` - Feature flag check
- `createRateLimitMiddleware(options)` - Rate limiting

## Custom Middleware

Create custom middleware for your specific needs:

```typescript
export const customMiddleware = createMiddleware('custom', async (context) => {
  // Your custom logic here
  const result = await someAsyncCheck(context);
  return result;
});
```

## Next Steps

- Route Protection - Using middleware for route protection
- HTTP Protection - Using middleware for HTTP protection  
- Pipelines - Grouping middleware into reusable pipelines
