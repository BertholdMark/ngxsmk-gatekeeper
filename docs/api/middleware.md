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
  return context['user']?.isAuthenticated ?? false;
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

## Core Middleware

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

### `createFeatureFlagMiddleware(options)`

Creates feature flag middleware.

```typescript
const featureMiddleware = createFeatureFlagMiddleware({
  flagName: 'new-feature',
  redirect: '/upgrade'
});
```

### `createRateLimitMiddleware(options)`

Creates rate limiting middleware.

```typescript
const rateLimitMiddleware = createRateLimitMiddleware({
  maxRequests: 100,
  windowMs: 60000,
});
```

## Security Middleware

### `createIPWhitelistMiddleware(options)`

Allows requests only from whitelisted IP addresses.

```typescript
const whitelistMiddleware = createIPWhitelistMiddleware({
  allowedIPs: ['192.168.1.1', '10.0.0.0/8'],
  blockMode: 'redirect',
  redirect: '/access-denied'
});
```

### `createIPBlacklistMiddleware(options)`

Blocks requests from blacklisted IP addresses.

```typescript
const blacklistMiddleware = createIPBlacklistMiddleware({
  blockedIPs: ['1.2.3.4'],
  reason: 'Suspicious activity',
  redirect: '/blocked'
});
```

### `createCSRFMiddleware(options)`

Protects against Cross-Site Request Forgery attacks.

```typescript
const csrfMiddleware = createCSRFMiddleware({
  tokenHeader: 'X-CSRF-Token',
  cookieName: 'csrf-token',
  protectedMethods: ['POST', 'PUT', 'DELETE']
});
```

### `createSessionMiddleware(options)`

Manages session timeout and expiration.

```typescript
const sessionMiddleware = createSessionMiddleware({
  timeout: 3600, // 1 hour
  extendOnActivity: true,
  redirect: '/login'
});
```

### `createAPIKeyMiddleware(options)`

Validates API keys from headers or query parameters.

```typescript
const apiKeyMiddleware = createAPIKeyMiddleware({
  headerName: 'X-API-Key',
  validateKey: async (key) => await checkAPIKey(key),
  rateLimitPerKey: true
});
```

### `createAccountLockoutMiddleware(options)`

Locks accounts after multiple failed authentication attempts.

```typescript
const lockoutMiddleware = createAccountLockoutMiddleware({
  maxAttempts: 5,
  lockoutDuration: 900, // 15 minutes
  resetOnSuccess: true
});
```

### `createWebhookSignatureMiddleware(options)`

Verifies webhook signatures for security.

```typescript
const webhookMiddleware = createWebhookSignatureMiddleware({
  secret: 'webhook-secret',
  algorithm: 'sha256',
  headerName: 'X-Signature'
});
```

### `createDeviceFingerprintMiddleware(options)`

Tracks and validates device fingerprints.

```typescript
const fingerprintMiddleware = createDeviceFingerprintMiddleware({
  trackDevices: true,
  blockSuspicious: true,
  requireDeviceRegistration: false
});
```

### `createUserAgentMiddleware(options)`

Validates user agents and blocks bots.

```typescript
const userAgentMiddleware = createUserAgentMiddleware({
  allowedAgents: [/Chrome/, /Firefox/],
  blockBots: true,
  redirect: '/unsupported-browser'
});
```

## Access Control Middleware

### `createTimeWindowMiddleware(options)`

Restricts access based on time windows.

```typescript
const businessHoursMiddleware = createTimeWindowMiddleware({
  allowedHours: { start: 9, end: 17 },
  allowedDays: [DayOfWeek.Monday, DayOfWeek.Friday],
  timezone: 'America/New_York'
});
```

### `createMaintenanceModeMiddleware(options)`

Enables maintenance mode with IP whitelisting.

```typescript
const maintenanceMiddleware = createMaintenanceModeMiddleware({
  enabled: process.env.MAINTENANCE_MODE === 'true',
  allowedIPs: ['10.0.0.1'], // Admin IPs
  message: 'Scheduled maintenance',
  redirect: '/maintenance'
});
```

### `createGeoBlockMiddleware(options)`

Blocks or allows access based on geographic location.

```typescript
const geoBlockMiddleware = createGeoBlockMiddleware({
  allowedCountries: ['US', 'CA', 'GB'],
  blockedCountries: ['CN', 'RU'],
  redirect: '/geo-blocked'
});
```

## Authentication Middleware

### `createMFAMiddleware(options)`

Enforces multi-factor authentication.

```typescript
const mfaMiddleware = createMFAMiddleware({
  required: true,
  methods: ['totp', 'sms', 'email'],
  redirect: '/mfa-verify'
});
```

### `createOAuth2Middleware(options)`

Handles OAuth2 authentication.

```typescript
const oauth2Middleware = createOAuth2Middleware({
  provider: 'google',
  clientId: 'your-client-id',
  scopes: ['openid', 'profile', 'email'],
  validateToken: async (token) => await verifyToken(token)
});
```

### `createJWTRefreshMiddleware(options)`

Automatically refreshes JWT tokens.

```typescript
const jwtRefreshMiddleware = createJWTRefreshMiddleware({
  refreshThreshold: 300, // 5 minutes before expiry
  autoRefresh: true,
  refreshEndpoint: '/api/auth/refresh'
});
```

## Request Processing Middleware

### `createRequestValidationMiddleware(options)`

Validates request data (body, query, params, headers).

```typescript
const validationMiddleware = createRequestValidationMiddleware({
  bodySchema: (data) => {
    return typeof data === 'object' && 'email' in data;
  },
  validateBody: true,
  validateQuery: false
});
```

### `createRequestSizeMiddleware(options)`

Enforces request size limits.

```typescript
const sizeLimitMiddleware = createRequestSizeMiddleware({
  maxBodySize: '10mb',
  maxQuerySize: '1kb',
  maxHeaderSize: '8kb'
});
```

### `createRequestDeduplicationMiddleware(options)`

Prevents duplicate requests within a time window.

```typescript
const dedupMiddleware = createRequestDeduplicationMiddleware({
  window: 1000, // 1 second
  maxDuplicates: 1,
  keyGenerator: (ctx) => `${ctx['request']?.method}:${ctx['request']?.url}`
});
```

### `createAPIVersioningMiddleware(options)`

Handles API versioning.

```typescript
const versioningMiddleware = createAPIVersioningMiddleware({
  defaultVersion: 'v1',
  supportedVersions: ['v1', 'v2'],
  headerName: 'API-Version'
});
```

## Advanced Control Middleware

### `createConditionalMiddleware(options)`

Conditionally executes different middleware based on context.

```typescript
const conditionalMiddleware = createConditionalMiddleware({
  condition: (ctx) => ctx['user']?.role === 'admin',
  ifTrue: adminMiddleware,
  ifFalse: userMiddleware
});
```

### `createCircuitBreakerMiddleware(options)`

Implements circuit breaker pattern for resilience.

```typescript
const circuitBreakerMiddleware = createCircuitBreakerMiddleware({
  name: 'external-api',
  middleware: externalAPIMiddleware,
  failureThreshold: 5,
  timeout: 60000,
  fallback: () => false
});
```

### `createRetryMiddleware(options)`

Retries failed requests with backoff.

```typescript
const retryMiddleware = createRetryMiddleware({
  middleware: externalAPIMiddleware,
  maxRetries: 3,
  backoff: 'exponential',
  retryableErrors: [500, 502, 503]
});
```

### `createConcurrentLimitMiddleware(options)`

Limits concurrent requests.

```typescript
const concurrentLimitMiddleware = createConcurrentLimitMiddleware({
  maxConcurrent: 10,
  perUser: true,
  queueStrategy: 'reject'
});
```

## Analytics & Monitoring Middleware

### `createAnalyticsMiddleware(options)`

Tracks request analytics.

```typescript
const analyticsMiddleware = createAnalyticsMiddleware({
  sink: {
    track: async (event) => {
      await sendToAnalyticsService(event);
    }
  },
  trackMetrics: true,
  includeUserInfo: false
});
```

### `createABTestMiddleware(options)`

Implements A/B testing.

```typescript
const abTestMiddleware = createABTestMiddleware({
  tests: {
    'new-dashboard': {
      variants: [
        { name: 'A', weight: 50 },
        { name: 'B', weight: 50 }
      ],
      persist: true
    }
  }
});
```

### `createRequestLoggingMiddleware(options)`

Logs request information.

```typescript
const loggingMiddleware = createRequestLoggingMiddleware({
  logLevel: 'info',
  includeBody: false,
  includeHeaders: true,
  format: 'json',
  sensitiveHeaders: ['authorization', 'cookie']
});
```

## Performance Middleware

### `createCacheMiddleware(options)`

Caches middleware results.

```typescript
const cacheMiddleware = createCacheMiddleware({
  ttl: 3600, // 1 hour
  keyGenerator: (ctx) => ctx['request']?.url || '',
  storage: new MemoryCacheStorage()
});
```

### `createRequestBatchingMiddleware(options)`

Batches requests together.

```typescript
const batchingMiddleware = createRequestBatchingMiddleware({
  batchWindow: 100, // ms
  maxBatchSize: 10,
  combineRequests: (requests) => requests[0]!
});
```

## Next Steps

- [Core API](/api/core) - Core APIs
- [Middleware Pattern](/guide/middleware-pattern) - Learn about middleware
- [Security Guide](/guide/security) - Security best practices
