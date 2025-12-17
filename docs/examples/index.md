# Examples

Complete, copy-paste ready examples demonstrating how to use ngxsmk-gatekeeper.

## 🎮 Try It Live

**Want to try ngxsmk-gatekeeper without installing?** Check out our [Interactive Playground](../playground/) where you can run examples directly in your browser:

- [StackBlitz Playground](../playground/) - Run examples in StackBlitz
- [CodeSandbox Playground](../playground/) - Run examples in CodeSandbox

**Or use the Visual Builder** to create middleware chains with drag-and-drop:
- [Visual Middleware Builder](../visual-builder/) - Build visually, export code

## 📋 Copy-Paste Examples

## Core Examples

### [Minimal Auth Demo](./minimal-auth)

Basic authentication protection example showing:
- Simple authentication check
- Protected route (dashboard)
- Public route (home)
- Login/logout functionality

**Perfect for:** Getting started with basic route protection.

### [Role-Based Routing Demo](./role-based-routing)

Role-based access control example showing:
- Authentication middleware
- Role-based middleware (admin, moderator)
- Reusable pipelines
- Multiple protected routes with different role requirements

**Perfect for:** Applications that need role-based access control.

### [HTTP Protection Demo](./http-protection)

HTTP request protection example showing:
- Global HTTP request protection
- Per-request middleware configuration
- Role-based API protection
- Request blocking on middleware failure

**Perfect for:** Protecting API calls based on authentication and roles.

## Developer Tools Examples

### Angular Schematics

Generate middleware and pipelines with Angular CLI:

```bash
ng add ngxsmk-gatekeeper
ng generate ngxsmk-gatekeeper:middleware auth
ng generate ngxsmk-gatekeeper:pipeline admin
```

**Perfect for:** Quickly scaffolding middleware and pipelines.

### CLI Tool

Analyze and test your configuration:

```bash
npx @ngxsmk-gatekeeper/cli init
npx @ngxsmk-gatekeeper/cli analyze
npx @ngxsmk-gatekeeper/cli test
```

**Perfect for:** Validating configurations and testing middleware.

### Visual Builder

Build middleware chains visually:

```typescript
import { VisualBuilderService } from 'ngxsmk-gatekeeper/lib/visual-builder';

const builder = new VisualBuilderService();
// Use drag-and-drop interface to build middleware chains
```

**Perfect for:** Visual development and prototyping.

### Testing Utilities

Test middleware with mock contexts:

```typescript
import { createMockContext, expectMiddlewareToAllow } from 'ngxsmk-gatekeeper/lib/testing';

const context = createMockContext({ user: { isAuthenticated: true } });
await expectMiddlewareToAllow(authMiddleware(context));
```

**Perfect for:** Unit and integration testing.

### Template Library

Use pre-built configurations:

```typescript
import { createTemplateLoader } from 'ngxsmk-gatekeeper/lib/templates';

const loader = createTemplateLoader();
const config = await loader.createConfig('saas', {
  roles: ['user', 'admin'],
});
```

**Perfect for:** Quick setup with industry-specific configurations.

### Observability Dashboard

Monitor middleware execution in real-time:

```typescript
import { provideObservability } from 'ngxsmk-gatekeeper/lib/observability';

provideObservability({
  websocketUrl: 'ws://localhost:8080',
  enableRealtime: true,
});
```

**Perfect for:** Debugging and performance monitoring.

### Showcase Gallery

See real-world implementations:

- Browse case studies from real companies
- Learn from production examples
- Get inspired by community implementations

**Perfect for:** Learning best practices and patterns.

## How to Use Examples

1. **Copy the example code** to your Angular project
2. **Install ngxsmk-gatekeeper**: `npm install ngxsmk-gatekeeper`
3. **Update imports** if needed (paths may vary)
4. **Run the application**: `ng serve`

## More Examples

- [Adapters](./adapters) - Authentication adapter examples (Auth0, Firebase, JWT)
- [Plugins](./plugins) - Plugin development examples
- [Standalone Usage](./standalone) - Using the library in standalone components

## Important Notes

### User Context

These examples use localStorage for simplicity. In a real application:

- Use an authentication service
- Provide user context through dependency injection
- Store tokens securely
- Handle authentication state properly

### Production Considerations

- **Server-side validation**: Always implement server-side protection
- **Token management**: Use secure token storage and refresh
- **Error handling**: Implement proper error handling and user feedback
- **Security**: Never rely solely on client-side protection

## New Feature Examples

### Security Examples

```typescript
// IP Whitelisting
import { createIPWhitelistMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const whitelist = createIPWhitelistMiddleware({
  allowedIPs: ['192.168.1.1', '10.0.0.0/8'],
  redirect: '/access-denied'
});

// CSRF Protection
import { createCSRFMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const csrf = createCSRFMiddleware({
  tokenHeader: 'X-CSRF-Token',
  protectedMethods: ['POST', 'PUT', 'DELETE']
});

// Session Management
import { createSessionMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const session = createSessionMiddleware({
  timeout: 3600,
  extendOnActivity: true,
  redirect: '/login'
});
```

### Access Control Examples

```typescript
// Time-Based Access
import { createTimeWindowMiddleware, DayOfWeek } from 'ngxsmk-gatekeeper/lib/middlewares';

const businessHours = createTimeWindowMiddleware({
  allowedHours: { start: 9, end: 17 },
  allowedDays: [DayOfWeek.Monday, DayOfWeek.Friday],
  timezone: 'America/New_York'
});

// Maintenance Mode
import { createMaintenanceModeMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const maintenance = createMaintenanceModeMiddleware({
  enabled: process.env.MAINTENANCE === 'true',
  allowedIPs: ['10.0.0.1'],
  redirect: '/maintenance'
});
```

### Monitoring Examples

```typescript
// Analytics
import { createAnalyticsMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const analytics = createAnalyticsMiddleware({
  sink: { track: async (event) => await sendToAnalytics(event) }
});

// A/B Testing
import { createABTestMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const abTest = createABTestMiddleware({
  tests: {
    'dashboard': {
      variants: [{ name: 'A', weight: 50 }, { name: 'B', weight: 50 }],
      persist: true
    }
  }
});
```

## All Available Middleware

ngxsmk-gatekeeper includes **30+ built-in middleware** functions:

- **Security**: IP filtering, CSRF, session, API keys, account lockout, webhooks, device fingerprinting, user-agent validation
- **Access Control**: Time windows, maintenance mode, geo-blocking
- **Authentication**: MFA, OAuth2/OIDC, JWT refresh
- **Request Processing**: Validation, size limits, deduplication, versioning
- **Advanced Control**: Conditional, circuit breaker, retry, concurrent limits
- **Analytics**: Request analytics, A/B testing, logging
- **Performance**: Caching, request batching

See the [Middleware API](/api/middleware) for complete documentation.

## Next Steps

After trying these examples:

1. **Read the documentation**: See [Getting Started](/guide/getting-started)
2. **Explore middleware**: Check out [Middleware Pattern](/guide/middleware-pattern)
3. **Security features**: See [Security Guide](/guide/security)
4. **Create custom middleware**: Use `createMiddleware()` helper
5. **Build pipelines**: Group middleware for reuse

