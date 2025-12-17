# Interceptors API

APIs for HTTP request protection using interceptors.

## `gatekeeperInterceptor`

Functional HTTP interceptor (Angular 17+).

### Usage

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';

provideHttpClient(
  withInterceptors([gatekeeperInterceptor])
);
```

### Type

```typescript
const gatekeeperInterceptor: HttpInterceptorFn = (req, next) => {
  // Implementation
};
```

## `withGatekeeper(middlewares, onFail?)`

Helper for per-request middleware configuration.

### Parameters

- `middlewares: NgxMiddleware[]` - Middleware array
- `onFail?: string` - Optional redirect path

### Returns

- `HttpContext` - HTTP context for the request

### Example

```typescript
this.http.get('/api/admin/data', {
  context: withGatekeeper([authMiddleware, adminMiddleware]),
});
```

### With Custom Redirect

```typescript
this.http.delete(`/api/admin/data/${id}`, {
  context: withGatekeeper(
    [authMiddleware, adminMiddleware],
    '/unauthorized'
  ),
});
```

## Request Configuration

HTTP requests can override global middleware:

```typescript
// Uses global middleware
this.http.get('/api/data');

// Overrides with custom middleware
this.http.get('/api/admin/data', {
  context: withGatekeeper([adminMiddleware]),
});
```

## Next Steps

- [HTTP Protection](/guide/http-protection) - Complete HTTP protection guide
- [Guards API](/api/guards) - Route protection APIs

