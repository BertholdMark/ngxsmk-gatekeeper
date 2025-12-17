# API Reference

Complete API reference for ngxsmk-gatekeeper.

## Core APIs

- [Core API](/api/core) - Core types and utilities
- [Middleware API](/api/middleware) - All middleware functions (30+ built-in)
- [Guards API](/api/guards) - Route guard functions
- [Interceptors API](/api/interceptors) - HTTP interceptor functions

## Quick Links

### Security Middleware
- IP Whitelisting/Blacklisting
- CSRF Protection
- Session Management
- API Key Validation
- Account Lockout
- Webhook Signature Verification
- Device Fingerprinting
- User-Agent Validation

### Access Control
- Time-Based Access
- Maintenance Mode
- Geographic Restrictions

### Authentication
- Multi-Factor Authentication (MFA)
- OAuth2/OIDC
- JWT Token Refresh

### Request Processing
- Request Validation
- Request Size Limits
- Request Deduplication
- API Versioning

### Advanced Control
- Conditional Middleware
- Circuit Breaker
- Retry Logic
- Concurrent Limits

### Analytics & Monitoring
- Request Analytics
- A/B Testing
- Request Logging

### Performance
- Cache Middleware
- Request Batching

## Core APIs

### `provideGatekeeper(config)`

Configures the gatekeeper with middleware and options.

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
  debug: true,
});
```

### `gatekeeperGuard`

Functional guard for route protection.

```typescript
canActivate: [gatekeeperGuard]
```

### `gatekeeperLoadGuard`

Functional guard for lazy-loaded routes.

```typescript
canLoad: [gatekeeperLoadGuard]
```

### `gatekeeperInterceptor`

Functional HTTP interceptor.

```typescript
withInterceptors([gatekeeperInterceptor])
```

### `withGatekeeper(middlewares, onFail?)`

Helper for per-request middleware configuration.

```typescript
this.http.get('/api/data', {
  context: withGatekeeper([adminMiddleware]),
});
```

## Middleware APIs

### `createMiddleware(name, handler)`

Creates a custom middleware function.

```typescript
const middleware = createMiddleware('custom', (context) => {
  return true;
});
```

### `definePipeline(name, middlewares)`

Creates a reusable middleware pipeline.

```typescript
const pipeline = definePipeline('admin', [authMiddleware, adminMiddleware]);
```

## Built-in Middleware

- `createAuthMiddleware(options)` - Authentication check
- `createRoleMiddleware(options)` - Role-based access
- `createFeatureFlagMiddleware(flag)` - Feature flag check
- `createRateLimitMiddleware(options)` - Rate limiting

## Types

### `MiddlewareContext`

Context object passed to middleware functions.

### `MiddlewareResponse`

Response object for advanced middleware behavior.

### `GatekeeperConfig`

Configuration object for `provideGatekeeper`.

## Next Steps

- [Core API](/api/core) - Core API details
- [Middleware API](/api/middleware) - Middleware API details
- [Guards API](/api/guards) - Guards API details
- [Interceptors API](/api/interceptors) - Interceptors API details

