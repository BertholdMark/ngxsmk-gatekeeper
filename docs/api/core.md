# Core API

Core APIs for ngxsmk-gatekeeper.

## `provideGatekeeper(config)`

Configures the gatekeeper with middleware and options.

### Parameters

- `config: GatekeeperConfig` - Configuration object

### Returns

- `Provider[]` - Angular providers

### Example

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
  debug: true,
});
```

## `GatekeeperConfig`

Configuration interface for the gatekeeper.

```typescript
interface GatekeeperConfig {
  middlewares: (NgxMiddleware | MiddlewarePipeline)[];
  onFail: string;
  debug?: boolean;
  benchmark?: BenchmarkConfig;
  audit?: AuditMiddlewareConfig;
  compliance?: ComplianceConfig;
  tamperDetection?: TamperDetectionConfig;
}
```

## Types

### `NgxMiddleware`

Middleware function type.

```typescript
type NgxMiddleware = (context: MiddlewareContext) => 
  boolean | Promise<boolean> | Observable<boolean> | MiddlewareResponse;
```

### `MiddlewareContext`

Context object passed to middleware.

```typescript
interface MiddlewareContext {
  path?: string;
  params?: Record<string, string>;
  queryParams?: Record<string, string>;
  data?: Record<string, unknown>;
  request?: HttpRequest<unknown>;
  user?: User;
  [key: string]: unknown;
}
```

### `MiddlewareResponse`

Advanced middleware response.

```typescript
interface MiddlewareResponse {
  allow: boolean;
  redirect?: string;
  reason?: string;
}
```

## Next Steps

- [Middleware API](/api/middleware) - Middleware creation APIs
- [Guards API](/api/guards) - Route guard APIs

