# Context & State

Understanding the middleware context object and how to use it effectively.

## Middleware Context

The `MiddlewareContext` is passed to every middleware function and provides access to route and HTTP request information.

## Context Properties

### Route Context (Guards)

When used in route guards, the context includes:

- `path` - Route path
- `params` - Route parameters
- `queryParams` - Query string parameters
- `data` - Route data
- `fragment` - URL fragment

```typescript
const middleware = createMiddleware('route-check', (context) => {
  const userId = context.params?.['userId'];
  const role = context.data?.['requiredRole'];
  
  return context.user?.role === role;
});
```

### HTTP Context (Interceptors)

When used in HTTP interceptors, the context includes:

- `request` - HttpRequest object
- `method` - HTTP method (GET, POST, etc.)
- `url` - Request URL

```typescript
const middleware = createMiddleware('api-check', (context) => {
  const method = context.request?.method;
  const url = context.request?.url;
  
  if (method === 'DELETE' && url?.includes('/admin')) {
    return context.user?.role === 'admin';
  }
  
  return true;
});
```

### Custom Context

You can add custom properties to the context:

```typescript
// In your guard or interceptor
context['customProperty'] = 'value';
context['featureFlags'] = getFeatureFlags();
```

## Accessing Context in Middleware

```typescript
const middleware = createMiddleware('custom', (context) => {
  // Route information
  const path = context.path;
  const params = context.params;
  
  // HTTP information
  const request = context.request;
  const method = context['method'];
  
  // User information
  const user = context.user;
  const isAuthenticated = user?.isAuthenticated;
  
  // Custom properties
  const custom = context['customProperty'];
  
  return true;
});
```

## Providing User Context

User context must be provided by your application. Common approaches:

### Using a Service

```typescript
// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  user$ = new BehaviorSubject<User | null>(null);
  
  getCurrentUser(): User | null {
    return this.user$.value;
  }
}
```

### Using LocalStorage

```typescript
// In your guard
const user = JSON.parse(localStorage.getItem('user') || 'null');
context['user'] = user;
```

### Using Dependency Injection

Modify the guard to inject user context:

```typescript
export const customGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const user = authService.getCurrentUser();
  
  // User context is automatically added by the guard
  return gatekeeperGuard(route, state);
};
```

## Context Best Practices

1. **Type Safety**: Use TypeScript interfaces for context structure
2. **Immutable**: Don't mutate context directly
3. **Sensitive Data**: Avoid storing sensitive data in context
4. **Performance**: Keep context objects lightweight

## Next Steps

- [Middleware Pattern](/guide/middleware-pattern) - Learn about middleware
- [Route Protection](/guide/route-protection) - Use context in route guards
- [HTTP Protection](/guide/http-protection) - Use context in HTTP interceptors

