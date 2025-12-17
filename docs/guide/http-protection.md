# HTTP Protection

Protect HTTP requests using ngxsmk-gatekeeper middleware.

## Basic HTTP Protection

The HTTP interceptor automatically protects all HTTP requests:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { gatekeeperInterceptor } from 'ngxsmk-gatekeeper';

provideHttpClient(
  withInterceptors([gatekeeperInterceptor])
);
```

## Request-Level Middleware

Override global middleware for specific requests:

```typescript
import { withGatekeeper } from 'ngxsmk-gatekeeper';

this.http.get('/api/admin/data', {
  context: withGatekeeper([adminMiddleware]),
});
```

## Custom Redirect on Failure

Specify a custom redirect for specific requests:

```typescript
this.http.delete(`/api/admin/data/${id}`, {
  context: withGatekeeper(
    [authMiddleware, adminMiddleware],
    '/unauthorized' // Custom redirect on failure
  ),
});
```

## Request Context

Access HTTP request information in middleware:

```typescript
const middleware = createMiddleware('api-check', (context) => {
  const method = context.request?.method;
  const url = context.request?.url;
  
  // Block DELETE requests to sensitive endpoints
  if (method === 'DELETE' && url?.includes('/sensitive')) {
    return context.user?.role === 'admin';
  }
  
  return true;
});
```

## Examples

### Protect All API Calls

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
});

// All HTTP requests are now protected
this.http.get('/api/data'); // Requires authentication
```

### Role-Based API Protection

```typescript
// Admin-only API call
this.http.get('/api/admin/data', {
  context: withGatekeeper([authMiddleware, adminMiddleware]),
});
```

### Public API Calls

```typescript
// Public API - no protection
this.http.get('/api/public/data'); // No middleware applied
```

## Combining Route and HTTP Protection

The same middleware configuration applies to both routes and HTTP requests:

```typescript
provideGatekeeper({
  middlewares: [authMiddleware, roleMiddleware],
  onFail: '/login',
});

// Routes are protected
canActivate: [gatekeeperGuard]

// HTTP requests are protected
gatekeeperInterceptor
```

## Error Handling

Handle middleware failures in HTTP requests:

```typescript
this.http.get('/api/protected/data').subscribe({
  next: (data) => console.log(data),
  error: (error) => {
    if (error.status === 403) {
      // Middleware blocked the request
      this.router.navigate(['/unauthorized']);
    }
  },
});
```

## Next Steps

- [Route Protection](/guide/route-protection) - Protect routes
- [Middleware Pattern](/guide/middleware-pattern) - Learn about middleware
- [Context & State](/guide/context-state) - Understand context object

