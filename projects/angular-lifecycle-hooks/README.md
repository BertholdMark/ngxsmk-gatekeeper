# Angular Request Lifecycle Hooks

Global lifecycle hooks for Angular routing and HTTP requests, similar to component lifecycle hooks.

## Overview

Angular Request Lifecycle Hooks provides a way to hook into routing and HTTP request lifecycle events at the application level. This allows you to:

- Monitor and log all route navigations
- Track HTTP requests and responses
- Implement cross-cutting concerns (auth checks, analytics, logging)
- Block routes or requests based on custom logic

## Installation

```bash
npm install angular-lifecycle-hooks
```

## Quick Start

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideLifecycleHooks, getHttpLifecycleInterceptor } from 'angular-lifecycle-hooks';

bootstrapApplication(AppComponent, {
  providers: [
    // Configure lifecycle hooks
    provideLifecycleHooks({
      route: {
        beforeRoute: (ctx) => {
          console.log('Navigating to:', ctx.navigation.to);
          return true; // Allow navigation
        },
        afterRoute: (ctx) => {
          console.log('Navigated to:', ctx.navigation.to);
        },
      },
      http: {
        beforeRequest: (ctx) => {
          console.log('Request:', ctx.request?.url);
          return true; // Allow request
        },
        afterResponse: (ctx) => {
          console.log('Response:', ctx.response?.status);
        },
      },
    }),

    // Router
    provideRouter(routes),

    // HTTP client with lifecycle interceptor
    provideHttpClient(
      withInterceptors([getHttpLifecycleInterceptor()])
    ),
  ],
});
```

## API

### `provideLifecycleHooks(config)`

Configures lifecycle hooks for the application.

**Parameters:**
- `config.route` - Route lifecycle hooks (optional)
- `config.http` - HTTP lifecycle hooks (optional)

**Route Hooks:**
- `beforeRoute(ctx)` - Called before route navigation. Return `false` to block.
- `afterRoute(ctx)` - Called after successful navigation.
- `routeBlocked(ctx)` - Called when navigation is blocked.

**HTTP Hooks:**
- `beforeRequest(ctx)` - Called before HTTP request. Return `false` to block, or `retry()` to retry.
- `afterResponse(ctx)` - Called after successful response. Return `fallback()` to trigger fallback logic.
- `requestBlocked(ctx)` - Called when request is blocked.
- `requestFailed(ctx)` - Called when request fails (network error, etc.).

### Hook Scoping

Hooks can be scoped to specific routes, route patterns, HTTP methods, or API URLs. Use the helper functions to create scoped hooks:

```typescript
import { beforeRoute, beforeRequest } from 'angular-lifecycle-hooks';

provideLifecycleHooks({
  route: {
    // Scoped to admin routes only
    beforeRoute: [
      beforeRoute({ path: '/admin/**' }, (ctx) => {
        console.log('Admin route:', ctx.navigation.to);
        return true;
      }),
      // Multiple scoped hooks can be combined
      beforeRoute({ path: '/api/**' }, (ctx) => {
        console.log('API route:', ctx.navigation.to);
        return true;
      }),
    ],
    // Unscoped hook applies to all routes
    afterRoute: (ctx) => {
      console.log('Navigated to:', ctx.navigation.to);
    },
  },
  http: {
    // Scoped to POST requests only
    beforeRequest: [
      beforeRequest({ method: 'POST' }, (ctx) => {
        console.log('POST request:', ctx.request?.url);
        return true;
      }),
      // Scoped to specific API URL pattern and method
      beforeRequest({ url: '/api/**', method: 'GET' }, (ctx) => {
        console.log('API GET request:', ctx.request?.url);
        return true;
      }),
    ],
  },
});
```

**Scope Options:**

- **Route Scopes:**
  - `path` - Route path or pattern (supports glob patterns like `/admin/**`, `/api/*/users`)
  
- **HTTP Scopes:**
  - `url` - API URL or URL pattern (supports glob patterns like `/api/**`)
  - `method` - HTTP method(s) (e.g., `'POST'`, `['GET', 'POST']`)

**Pattern Matching:**
- `**` - Matches any number of path segments (e.g., `/admin/**` matches `/admin/users` and `/admin/users/123`)
- `*` - Matches any characters except `/` (e.g., `/api/*/users` matches `/api/v1/users` but not `/api/v1/v2/users`)
- `?` - Matches a single character except `/`

### Context Objects

**RouteHookContext:**
```typescript
{
  route?: {
    url: string;
    params: Record<string, string>;
    queryParams: Record<string, string>;
    data: Record<string, unknown>;
    fragment: string | null;
  };
  navigation: {
    from?: string;
    to: string;
    trigger: 'imperative' | 'popstate' | 'hashchange';
  };
  timestamp: number;
  metadata?: Record<string, unknown>;
}
```

**HttpHookContext:**
```typescript
{
  request?: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: unknown;
  };
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body?: unknown;
  };
  timestamp: number;
  metadata?: Record<string, unknown>;
}
```

## Use Cases

### Authentication Check

```typescript
import { beforeRoute } from 'angular-lifecycle-hooks';

provideLifecycleHooks({
  route: {
    // Only protect admin routes
    beforeRoute: [
      beforeRoute({ path: '/admin/**' }, async (ctx) => {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          return false; // Block navigation
        }
        return true;
      }),
    ],
  },
})
```

### Request Logging

```typescript
import { beforeRequest, afterResponse, requestFailed } from 'angular-lifecycle-hooks';

provideLifecycleHooks({
  http: {
    // Log only POST requests
    beforeRequest: [
      beforeRequest({ method: 'POST' }, (ctx) => {
        console.log(`[${new Date(ctx.timestamp).toISOString()}] ${ctx.request?.method} ${ctx.request?.url}`);
        return true;
      }),
    ],
    // Log all API responses
    afterResponse: [
      afterResponse({ url: '/api/**' }, (ctx) => {
        console.log(`[${new Date(ctx.timestamp).toISOString()}] ${ctx.response?.status} ${ctx.request?.url}`);
      }),
    ],
    requestFailed: (ctx) => {
      console.error(`[${new Date(ctx.timestamp).toISOString()}] Request failed:`, ctx.error);
    },
  },
})
```

### Analytics

```typescript
provideLifecycleHooks({
  route: {
    afterRoute: (ctx) => {
      analytics.track('page_view', {
        path: ctx.navigation.to,
        params: ctx.route?.params,
      });
    },
  },
  http: {
    afterResponse: (ctx) => {
      analytics.track('api_call', {
        url: ctx.request?.url,
        method: ctx.request?.method,
        status: ctx.response?.status,
      });
    },
  },
})
```

## Retry and Fallback Support

### Retry Support

`beforeRequest` hooks can trigger retries by returning a retry signal:

```typescript
import { provideLifecycleHooks, retry } from 'angular-lifecycle-hooks';

provideLifecycleHooks({
  http: {
    beforeRequest: (ctx) => {
      // Check if token needs refresh
      if (needsTokenRefresh(ctx)) {
        // Trigger retry after token refresh
        return retry({ 
          delay: 1000, 
          reason: 'Token refresh needed' 
        });
      }
      return true; // Allow request
    },
  },
  // Configure retry behavior
  retry: {
    maxRetries: 3,
    defaultDelay: 500,
    exponentialBackoff: true,
    maxDelay: 10000,
  },
});
```

**Retry Configuration:**
- `maxRetries` - Maximum number of retries (default: 3)
- `defaultDelay` - Default delay in milliseconds (default: 0)
- `exponentialBackoff` - Use exponential backoff (default: false)
- `maxDelay` - Maximum delay when using exponential backoff (default: 10000ms)

### Fallback Support

`afterResponse` hooks can trigger fallback logic by returning a fallback signal:

```typescript
import { provideLifecycleHooks, fallback } from 'angular-lifecycle-hooks';

provideLifecycleHooks({
  http: {
    afterResponse: (ctx) => {
      // Check if service is unavailable
      if (ctx.response?.status === 503) {
        // Trigger fallback with cached data
        return fallback({ 
          data: getCachedData(),
          reason: 'Service unavailable, using cache' 
        });
      }
    },
  },
});
```

**Fallback Usage:**
- Fallback signals are returned from `afterResponse` hooks
- The fallback data is available in `hookResult.fallback.data`
- Applications can handle fallback logic based on the signal

## Limitations

1. **Router Hooks**: Router hooks cannot programmatically redirect. Use Angular guards for redirects.
2. **HTTP Blocking**: Blocking HTTP requests cancels them but doesn't provide redirect capability.
3. **Order**: Hooks execute in deterministic order but cannot be reordered.
4. **Error Handling**: Hook errors are logged but don't affect application flow (except blocking hooks).
5. **Performance**: Hooks add minimal overhead but should be kept lightweight.
6. **Retry Limits**: Retries are capped at the configured `maxRetries` value to prevent infinite loops.

## Requirements

- Angular 17+
- Standalone components only
- No NgModules support

## Architecture

The library is split into two layers:

1. **Core** (`lib/core/`) - Framework-agnostic hook engine (no Angular dependencies)
2. **Angular** (`lib/angular/`) - Angular-specific adapters (Router, HTTP)

This design allows:
- Tree-shaking when hooks are not used
- Testing core logic without Angular
- Potential future framework support

## Tree-Shaking

Hooks are fully tree-shakeable:
- If `route` hooks are not provided, router integration is not included
- If `http` hooks are not provided, HTTP interceptor is not included
- Core hook runner is only included when hooks are used

## Type Safety

Full TypeScript support with:
- Typed context objects
- Type-safe hook functions
- IntelliSense support

## Examples

See the [examples](./examples/) directory for complete examples.

## License

MIT

