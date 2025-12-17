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

The library includes **30+ built-in middleware** functions organized by category:

### Core Middleware
- `createAuthMiddleware()` - Authentication check
- `createRoleMiddleware(roles)` - Role-based access
- `createFeatureFlagMiddleware(flag)` - Feature flag check
- `createRateLimitMiddleware(options)` - Rate limiting

### Security Middleware (8 features)
- `createIPWhitelistMiddleware()` - Allow specific IPs
- `createIPBlacklistMiddleware()` - Block specific IPs
- `createCSRFMiddleware()` - CSRF protection
- `createSessionMiddleware()` - Session management
- `createAPIKeyMiddleware()` - API key validation
- `createAccountLockoutMiddleware()` - Brute force protection
- `createWebhookSignatureMiddleware()` - Webhook verification
- `createDeviceFingerprintMiddleware()` - Device tracking
- `createUserAgentMiddleware()` - User agent validation

### Access Control (3 features)
- `createTimeWindowMiddleware()` - Time-based access
- `createMaintenanceModeMiddleware()` - Maintenance mode
- `createGeoBlockMiddleware()` - Geographic restrictions

### Authentication (3 features)
- `createMFAMiddleware()` - Multi-factor authentication
- `createOAuth2Middleware()` - OAuth2/OIDC
- `createJWTRefreshMiddleware()` - JWT token refresh

### Request Processing (4 features)
- `createRequestValidationMiddleware()` - Request validation
- `createRequestSizeMiddleware()` - Size limits
- `createRequestDeduplicationMiddleware()` - Deduplication
- `createAPIVersioningMiddleware()` - API versioning

### Advanced Control (4 features)
- `createConditionalMiddleware()` - Conditional execution
- `createCircuitBreakerMiddleware()` - Circuit breaker pattern
- `createRetryMiddleware()` - Retry with backoff
- `createConcurrentLimitMiddleware()` - Concurrent limits

### Analytics & Monitoring (3 features)
- `createAnalyticsMiddleware()` - Request analytics
- `createABTestMiddleware()` - A/B testing
- `createRequestLoggingMiddleware()` - Request logging

### Performance (2 features)
- `createCacheMiddleware()` - Result caching
- `createRequestBatchingMiddleware()` - Request batching

See the [Middleware API](/api/middleware) for complete documentation and examples.

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

- [Route Protection](/guide/route-protection) - Using middleware for route protection
- [HTTP Protection](/guide/http-protection) - Using middleware for HTTP protection
- [Security Guide](/guide/security) - Security features and best practices
- [Access Control](/guide/access-control) - Time windows and geo-blocking
- [Request Processing](/guide/request-processing) - Validation and limits
- [Monitoring](/guide/monitoring) - Analytics and logging
- [Advanced Control](/guide/advanced-control) - Advanced patterns
- [Performance](/guide/performance) - Optimization features
- [Pipelines](/guide/pipelines) - Grouping middleware into reusable pipelines
- [Features Overview](/guide/features-overview) - Complete feature list
