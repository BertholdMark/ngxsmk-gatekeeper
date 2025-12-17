# Configuration

Complete guide to configuring ngxsmk-gatekeeper in your Angular application.

## Basic Configuration

The `provideGatekeeper` function accepts a `GatekeeperConfig` object:

```typescript
import { provideGatekeeper } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

provideGatekeeper({
  middlewares: [createAuthMiddleware()],
  onFail: '/login',
});
```

## Configuration Options

### `middlewares`

Array of middleware functions and/or pipelines to execute.

```typescript
middlewares: [
  authMiddleware,
  roleMiddleware,
  adminPipeline, // Pipelines can be mixed with individual middlewares
]
```

### `onFail`

Redirect path or URL when middleware chain fails.

```typescript
onFail: '/login' // Redirect to login page
onFail: '/unauthorized' // Redirect to unauthorized page
```

### `debug`

Enable debug logging for middleware execution.

```typescript
debug: true // Enable debug mode
```

**Features:**
- Execution order and timing
- Pass/fail status for each middleware
- Route path and context information
- Lazy module chunk names (for CanLoad)

### `benchmark`

Benchmark configuration for performance monitoring.

```typescript
benchmark: {
  enabled: true,
  middlewareThreshold: 100, // Warn if middleware > 100ms
  chainThreshold: 500,      // Warn if chain > 500ms
  sampleSize: 50,           // Number of executions to track
}
```

### `audit`

Audit logging configuration.

```typescript
audit: {
  enabled: true,
  sinks: [consoleSink, fileSink],
  userIdPath: 'user.id',
}
```

### `compliance`

Compliance mode configuration (SOC2, ISO 27001).

```typescript
compliance: {
  enabled: true,
  logFormat: 'json', // 'json' | 'text'
  sinks: [complianceSink],
}
```

### `tamperDetection`

Tamper detection configuration.

```typescript
tamperDetection: {
  enabled: true,
  checkGuards: true,
  checkInterceptors: true,
}
```

## Route-Level Configuration

Override global configuration per route:

```typescript
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [adminPipeline], // Override global middleware
        onFail: '/unauthorized',      // Override global onFail
      },
    },
  },
];
```

## HTTP Request-Level Configuration

Override global configuration per HTTP request:

```typescript
this.http.get('/api/admin/data', {
  context: withGatekeeper(
    [authMiddleware, adminMiddleware],
    '/unauthorized' // Custom redirect on failure
  ),
});
```

## Complete Example

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideGatekeeper, gatekeeperInterceptor } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware, createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([gatekeeperInterceptor])
    ),
    provideGatekeeper({
      middlewares: [
        createAuthMiddleware({ authPath: 'user.isAuthenticated' }),
        createRoleMiddleware({ roles: ['user'], mode: 'any' }),
      ],
      onFail: '/login',
      debug: true,
      benchmark: {
        enabled: true,
        middlewareThreshold: 100,
        chainThreshold: 500,
      },
    }),
  ],
};
```

## Next Steps

- [Route Protection](/guide/route-protection) - Learn about route-level configuration
- [HTTP Protection](/guide/http-protection) - Learn about HTTP request configuration
- [Debug Mode](/guide/debug-mode) - Enable and use debug features

