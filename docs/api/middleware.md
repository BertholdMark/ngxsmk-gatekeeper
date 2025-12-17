# Middleware API

APIs for creating and managing middleware.

## `createMiddleware(name, handler)`

Creates a custom middleware function.

### Parameters

- `name: string` - Middleware name (for debugging)
- `handler: MiddlewareHandler` - Middleware function

### Returns

- `NgxMiddleware` - Middleware function

### Example

```typescript
const middleware = createMiddleware('custom', (context) => {
  return context.user?.isAuthenticated ?? false;
});
```

## `definePipeline(name, middlewares)`

Creates a reusable middleware pipeline.

### Parameters

- `name: string` - Pipeline name
- `middlewares: NgxMiddleware[]` - Array of middleware

### Returns

- `MiddlewarePipeline` - Pipeline object

### Example

```typescript
const pipeline = definePipeline('admin', [
  authMiddleware,
  adminMiddleware,
]);
```

## Built-in Middleware

### `createAuthMiddleware(options)`

Creates authentication middleware.

```typescript
const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
});
```

### `createRoleMiddleware(options)`

Creates role-based middleware.

```typescript
const adminMiddleware = createRoleMiddleware({
  roles: ['admin'],
  mode: 'any', // 'any' | 'all'
});
```

### `createFeatureFlagMiddleware(flag)`

Creates feature flag middleware.

```typescript
const featureMiddleware = createFeatureFlagMiddleware('new-feature');
```

### `createRateLimitMiddleware(options)`

Creates rate limiting middleware.

```typescript
const rateLimitMiddleware = createRateLimitMiddleware({
  maxRequests: 100,
  windowMs: 60000,
});
```

## Next Steps

- [Core API](/api/core) - Core APIs
- [Middleware Pattern](/guide/middleware-pattern) - Learn about middleware

