# ngxsmk-gatekeeper

[![npm version](https://img.shields.io/npm/v/ngxsmk-gatekeeper.svg)](https://www.npmjs.com/package/ngxsmk-gatekeeper)
[![npm downloads](https://img.shields.io/npm/dm/ngxsmk-gatekeeper.svg)](https://www.npmjs.com/package/ngxsmk-gatekeeper)
[![Angular](https://img.shields.io/badge/Angular-17%2B-red.svg)](https://angular.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)

A framework-agnostic middleware engine for Angular that provides route and HTTP request protection through a composable middleware pattern.

## ✨ Developer Experience First

**ngxsmk-gatekeeper** is designed with developer experience as a top priority:

- 🎯 **Simple API** - Intuitive, composable middleware pattern
- 🔧 **Type-Safe** - Full TypeScript support with comprehensive types
- 🚀 **Tree-Shakeable** - Only bundle what you use
- 📦 **Zero Dependencies** - Lightweight core, optional features
- 🛠️ **Flexible** - Works with sync, Promise, and Observable patterns
- 🎨 **Composable** - Build complex protection logic from simple pieces
- 🔍 **Debuggable** - Built-in debug mode and performance benchmarking
- 📚 **Well-Documented** - Comprehensive docs with examples
- ⚡ **Performant** - Minimal overhead, optimized execution
- 🔒 **Framework-Agnostic Core** - Core logic independent of Angular

## What Problem Does It Solve?

Angular applications often need to protect routes and HTTP requests based on authentication, authorization, feature flags, or other business logic. Traditionally, this requires:

- Writing custom route guards for each protection scenario
- Creating HTTP interceptors that duplicate guard logic
- Managing complex conditional logic across multiple files
- Difficulty in composing and reusing protection logic

**ngxsmk-gatekeeper** solves this by providing:

- A unified middleware pattern for both route and HTTP protection
- Composable middleware functions that can be chained together
- A single configuration that applies to both routes and HTTP requests
- Support for synchronous, Promise-based, and Observable-based middleware
- Built-in middleware examples for common scenarios

## Fully Open Source

**ngxsmk-gatekeeper** is **100% open source** and **completely free** to use. All features are available without any restrictions:

| Feature | Status |
|---------|--------|
| **Core Middleware Engine** | ✅ Included |
| **Route & HTTP Protection** | ✅ Included |
| **Debug Mode & Benchmarking** | ✅ Included |
| **Built-in Middleware Examples** | ✅ Included |
| **TypeScript Support** | ✅ Included |
| **Tree-Shaking** | ✅ Included |
| **Plugin Architecture** | ✅ Extension API |
| **Authentication Adapters** | ✅ Auth0, Firebase, Custom JWT |
| **Audit Logging** | ✅ Comprehensive audit with SIEM integration |
| **Compliance Mode (SOC2, ISO)** | ✅ Structured logs, execution traces |
| **License Verification** | ✅ Full license management |
| **Middleware Plugins** | ✅ Advanced auth, rate limiting, etc. |
| **Custom Plugin Development** | ✅ Via extension API |

### All Features Included

The library includes everything you need:

- **Compliance & Auditing**: SOC2 and ISO 27001 compliant logging with structured audit trails
- **Authentication Adapters**: Pre-built adapters for Auth0, Firebase, and custom JWT systems
- **Advanced Features**: Middleware plugins for complex authorization scenarios
- **Plugin System**: Extensible architecture for custom functionality

Everything is **open source** and **free to use**. [Learn more about the plugin architecture](./src/lib/extensions/PLUGIN_ARCHITECTURE.md).

## Comparison to Next.js Middleware

If you're familiar with Next.js middleware, this library provides a similar developer experience:

| Feature | Next.js Middleware | ngxsmk-gatekeeper |
|---------|-------------------|-------------------|
| Route protection | ✅ | ✅ |
| HTTP request protection | ✅ | ✅ |
| Composable middleware | ✅ | ✅ |
| Async support | ✅ | ✅ |
| Framework integration | Next.js specific | Angular specific |
| Execution context | Request/Response | Route/HTTP Request |

**Key Differences:**

- Next.js middleware runs at the edge/server level, while ngxsmk-gatekeeper runs in the Angular application
- Next.js middleware has access to request/response objects, while ngxsmk-gatekeeper works with Angular's route and HTTP request contexts
- ngxsmk-gatekeeper is designed specifically for Angular's dependency injection and routing systems

## 🚀 Quick Start

### Installation

```bash
npm install ngxsmk-gatekeeper
```

### 30-Second Setup

```typescript
import { provideGatekeeper, gatekeeperGuard } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// 1. Create middleware
const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
});

// 2. Configure
bootstrapApplication(AppComponent, {
  providers: [
    provideGatekeeper({
      middlewares: [authMiddleware],
      onFail: '/login',
    }),
  ],
});

// 3. Protect routes
const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [gatekeeperGuard],
    loadComponent: () => import('./dashboard.component'),
  },
];
```

That's it! Your routes are now protected. 🎉

## 📖 Demo Examples

Ready-to-use, copy-paste examples to get started quickly:

- **[Minimal Auth Demo](./examples/demos/minimal-auth-demo.ts)** - Basic authentication protection
- **[Role-Based Routing Demo](./examples/demos/role-based-routing-demo.ts)** - Role-based access control
- **[HTTP Protection Demo](./examples/demos/http-protection-demo.ts)** - Protecting HTTP requests

Each demo is complete and can be copied directly into your Angular project.

## 🎨 Developer Experience Features

### Debug Mode

Enable detailed logging to understand middleware execution:

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
  debug: true, // Enable debug logging
});
```

**Features:**
- 📊 Execution order and timing
- ✅/❌ Pass/fail status for each middleware
- 🛣️ Route path and context information
- 📦 Lazy module chunk names (for CanLoad)
- 🚫 Blocked chunk loading warnings

### Benchmark Mode

Monitor performance and get optimization suggestions:

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
  benchmark: {
    enabled: true,
    middlewareThreshold: 100, // Warn if middleware > 100ms
    chainThreshold: 500,       // Warn if chain > 500ms
  },
});
```

**Features:**
- ⚠️ Automatic warnings when thresholds exceeded
- 💡 Optimization suggestions
- 📈 Performance statistics
- 🔍 Identify slow middlewares

### Global Debug Hook

Access middleware execution data from browser console or extensions:

```typescript
// In browser console
const hook = window.__NGXSMK_GATEKEEPER__;
if (hook) {
  const stats = hook.getStats();
  const latest = hook.getLatestChain();
  console.log('Latest chain:', latest);
}
```

**Features:**
- 🔌 Available in dev mode only
- 📊 Execution history and statistics
- 🔒 Sensitive data automatically filtered
- 🛠️ Perfect for browser extensions

### TypeScript Support

Full type safety throughout:

```typescript
// Type-safe middleware creation
const middleware = createMiddleware('myMiddleware', (context: MiddlewareContext) => {
  // context is fully typed
  const user = context.user; // TypeScript knows the structure
  return Boolean(user?.isAuthenticated);
});

// Type-safe configuration
const config: GatekeeperConfig = {
  middlewares: [middleware],
  onFail: '/login',
  // TypeScript will catch typos and invalid options
};
```

## Building the Library

To build the library for development or production:

```bash
# Build for production (default)
npm run build

# Build for development with watch mode
npm run watch

# Build for development
ng build ngxsmk-gatekeeper --configuration development
```

The built library will be output to `dist/ngxsmk-gatekeeper/`.

**Note:** The library uses `ng-packagr` for building and only includes code exported from `src/public-api.ts`. Demo components and test files are automatically excluded from the build.

## 📋 Angular Versions Supported

| Angular Version | Status | Support Level | End of Support |
|----------------|--------|---------------|----------------|
| ![Angular 17](https://img.shields.io/badge/Angular-17-red.svg) | ✅ **LTS** | Long Term Support | 6 months after Angular 19 LTS ends |
| ![Angular 18](https://img.shields.io/badge/Angular-18-red.svg) | ✅ **Active** | Full Support | 6 months after Angular 20 LTS ends |
| ![Angular 19](https://img.shields.io/badge/Angular-19-red.svg) | ✅ **Active** | Full Support | 6 months after Angular 21 LTS ends |
| ![Angular 20](https://img.shields.io/badge/Angular-20-red.svg) | ✅ **Active** | Full Support | 6 months after Angular 22 LTS ends |
| ![Angular 21+](https://img.shields.io/badge/Angular-21%2B-red.svg) | ✅ **Active** | Full Support | 6 months after next LTS ends |

**Minimum Supported Version:** Angular 17.0.0

**Design Philosophy:** This library is built using only public and stable Angular APIs, ensuring long-term compatibility. The architecture is designed to continue working without changes for future Angular releases.

**Key Compatibility Features:**
- ✅ Uses functional guards and interceptors (Angular 15+ pattern)
- ✅ Standalone-only architecture (no NgModule dependencies)
- ✅ Uses `inject()` function instead of constructor injection
- ✅ No reliance on Angular internals or zone-specific behavior
- ✅ Framework-agnostic core layer

### Versioning and LTS Strategy

**ngxsmk-gatekeeper** follows [Semantic Versioning (Semver)](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes - migration guide provided
- **MINOR** (x.y.0): New features - backward compatible
- **PATCH** (x.y.z): Bug fixes - fully backward compatible

#### Upgrade Guarantees

- **Major Versions**: Breaking changes announced 3+ months in advance with migration guides
- **Minor Versions**: Backward compatible - no breaking changes
- **Patch Versions**: Bug fixes and security patches only - fully backward compatible
- **Previous Major Version**: Supported for 6 months after new major release

#### Deprecation Policy

1. **Deprecation Announcement** (Minor version): Feature marked as deprecated with console warnings
2. **Deprecation Period** (6-12 months): Feature continues to work, migration guide available
3. **Removal** (Next major version): Feature removed with clear migration path

#### Angular Version Support

- **New Angular Versions**: Support added within 30 days of Angular release
- **Old Angular Versions**: Dropped 6 months after Angular's end of support
- **LTS Versions**: Supported for full Angular LTS period + 6 months

**For detailed LTS strategy, deprecation policy, and versioning rules, see [LTS_STRATEGY.md](./LTS_STRATEGY.md).**

## Basic Usage

### 1. Configure Gatekeeper

```typescript
import { provideGatekeeper } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
});

bootstrapApplication(AppComponent, {
  providers: [
    provideGatekeeper({
      middlewares: [authMiddleware],
      onFail: '/login',
    }),
    // ... other providers
  ],
});
```

### 2. Protect Routes

**Using Functional Guards (Recommended for Angular 17+):**

```typescript
import { gatekeeperGuard, gatekeeperLoadGuard } from 'ngxsmk-gatekeeper';
import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component'),
    canActivate: [gatekeeperGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin.routes'),
    canLoad: [gatekeeperLoadGuard],
  },
];
```

**Legacy Class-Based Guards (Deprecated):**

```typescript
import { GatekeeperGuard } from 'ngxsmk-gatekeeper';

const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component'),
    canActivate: [GatekeeperGuard.canActivate],
  },
];
```

### 3. Protect HTTP Requests

**Using Functional Interceptors (Recommended for Angular 17+):**

```typescript
import { gatekeeperInterceptor } from 'ngxsmk-gatekeeper';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([gatekeeperInterceptor])
    ),
  ],
});
```

**Legacy Class-Based Interceptors (Deprecated):**

```typescript
import { gatekeeperInterceptor } from 'ngxsmk-gatekeeper';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useValue: gatekeeperInterceptor,
      multi: true,
    },
  ],
});
```

## Route Protection Example

```typescript
import { provideGatekeeper, GatekeeperGuard } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware, createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';
import { Routes } from '@angular/router';

// Create middleware chain
const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
});

const adminMiddleware = createRoleMiddleware({
  roles: ['admin'],
  mode: 'any',
});

// Configure Gatekeeper
provideGatekeeper({
  middlewares: [authMiddleware, adminMiddleware],
  onFail: '/unauthorized',
});

// Apply to routes
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin.routes'),
    canActivate: [gatekeeperGuard],
    canLoad: [gatekeeperLoadGuard],
  },
];
```

The middleware chain executes before route activation. If any middleware returns `false`, the user is redirected to the `onFail` route.

## HTTP Protection Example

```typescript
import { gatekeeperInterceptor } from 'ngxsmk-gatekeeper';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([gatekeeperInterceptor])
    ),
  ],
});
```

The same middleware chain configured with `provideGatekeeper` will execute before each HTTP request. If middleware fails, the request is cancelled and optionally redirects to the `onFail` route.

**Note:** The HTTP interceptor uses the same middleware configuration as route guards, ensuring consistent protection logic.

## Writing Custom Middleware

### Using the Helper Function

```typescript
import { createMiddleware, MiddlewareContext } from 'ngxsmk-gatekeeper';

const customMiddleware = createMiddleware('custom', (context: MiddlewareContext) => {
  // Access route or HTTP request data
  const user = context.user;
  const route = context.route;
  const request = context.request;
  
  // Return boolean, Promise<boolean>, or Observable<boolean>
  return user?.hasPermission('custom-permission') ?? false;
});
```

### Direct Implementation

```typescript
import { NgxMiddleware, MiddlewareContext } from 'ngxsmk-gatekeeper';

const asyncMiddleware: NgxMiddleware = async (context: MiddlewareContext) => {
  const result = await someAsyncCheck(context);
  return result;
};

const observableMiddleware: NgxMiddleware = (context: MiddlewareContext) => {
  return someService.checkPermission(context).pipe(
    map(result => result.isAllowed)
  );
};
```

### Middleware Context

The `MiddlewareContext` object contains different properties depending on where the middleware is executed:

**For Route Guards:**
- `route` - ActivatedRouteSnapshot or Route
- `state` - RouterStateSnapshot (for canActivate)
- `params` - Route parameters
- `queryParams` - Query parameters
- `data` - Route data
- `url` - Current URL

**For HTTP Interceptors:**
- `request` - HttpRequest object
- `url` - Request URL
- `method` - HTTP method
- `headers` - Request headers
- `body` - Request body
- `params` - Request parameters

**Custom Properties:**
You can add custom properties to the context by extending it in your application code.

## 📦 Built-in Middleware & Presets

The library includes optional middleware examples and preset packs:

### Middleware Examples

These are tree-shakeable - only import what you need:

### Authentication Middleware

```typescript
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated', // default
  requireUser: true, // default
});
```

### Role Middleware

```typescript
import { createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// User must have at least one role (OR)
const adminMiddleware = createRoleMiddleware({
  roles: ['admin', 'moderator'],
  mode: 'any', // default
  rolesPath: 'user.roles', // default
});

// User must have all roles (AND)
const superAdminMiddleware = createRoleMiddleware({
  roles: ['admin', 'super'],
  mode: 'all',
});
```

### Feature Flag Middleware

```typescript
import { createFeatureFlagMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const featureMiddleware = createFeatureFlagMiddleware({
  flagName: 'newDashboard',
  flagsPath: 'featureFlags', // default
  strict: true, // default - must be explicitly true
});
```

### Preset Packs (Optional)

Quick-start presets for common scenarios:

```typescript
import { authPreset, adminPreset, publicOnlyPreset } from 'ngxsmk-gatekeeper/lib/presets';

// Authentication preset
const auth = authPreset({ redirect: '/login' });

// Admin preset (auth + admin role)
const admin = adminPreset({
  role: { roles: ['admin'], mode: 'any' },
  redirect: '/unauthorized'
});

// Public routes preset
const publicRoute = publicOnlyPreset({
  redirectAuthenticated: true,
  redirectPath: '/dashboard'
});
```

**Note:** Presets are optional imports and tree-shakeable.

## ⚡ Performance & Optimization

### Tree-Shaking

All optional features are tree-shakeable. Only import what you need:

```typescript
// Only middleware is bundled
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// Only presets are bundled
import { authPreset } from 'ngxsmk-gatekeeper/lib/presets';

// Only providers are bundled
import { LocalStorageFeatureFlagProvider } from 'ngxsmk-gatekeeper/lib/providers';
```

### Best Practices

1. **Order matters** - Place fast checks first
2. **Use pipelines** - Group related middleware for reuse
3. **Enable benchmark mode** - Identify bottlenecks
4. **Cache expensive operations** - Avoid repeated computations
5. **Use presets** - Pre-optimized middleware combinations

## ⚠️ Limitations

1. **Route-Level Configuration:** You can configure different middleware per route using route data (see API Reference).

2. **Context Dependency:** Middleware relies on data being present in the `MiddlewareContext`. You must ensure your application populates the context with necessary data (e.g., user information) before middleware execution.

3. **No Built-in Auth Service:** The library does not include authentication logic. You must provide user data in the context yourself.

4. **Angular 17+ Required:** Requires Angular 17.0.0+ and standalone components. Not compatible with NgModules-based applications or Angular versions below 17. See [LTS_STRATEGY.md](./LTS_STRATEGY.md) for version support details.

5. **Sequential Execution:** Middleware executes sequentially and stops on the first `false` result. There is no parallel execution or conditional branching.

6. **No Request Modification:** Unlike Next.js middleware, you cannot modify requests or responses. Middleware only determines allow/deny.

7. **Client-Side Protection:** This library runs in the browser. For production applications, always implement server-side protection as well.

## 🔒 Security

**ngxsmk-gatekeeper** takes security seriously. We follow professional open source security practices:

- **Responsible Disclosure**: Security vulnerabilities are handled through our [Security Policy](./SECURITY.md)
- **Regular Updates**: Security patches are released promptly
- **Security Audits**: Regular dependency audits and security reviews
- **Transparent Process**: Clear security reporting and disclosure process

**Found a security vulnerability?** Please follow our [responsible disclosure process](./SECURITY.md#reporting-a-vulnerability). Do not create public GitHub issues for security vulnerabilities.

## 📚 Documentation

- **[LTS Strategy](./LTS_STRATEGY.md)** - Long-term support, versioning, and deprecation policy
- **[Security Policy](./SECURITY.md)** - Security policy and responsible disclosure
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project
- **[Code of Conduct](./CODE_OF_CONDUCT.md)** - Community guidelines
- **[Release Checklist](./RELEASE_CHECKLIST.md)** - Release process and quality gates

## API Reference

### Core Types

- `MiddlewareContext` - Context object passed to middleware functions
- `NgxMiddleware` - Middleware function type
- `MiddlewareResult` - Result of middleware execution

### Angular Integration

- `provideGatekeeper(config)` - Configures the Gatekeeper
- `gatekeeperGuard` - Functional route guard for canActivate
- `gatekeeperLoadGuard` - Functional route guard for canLoad
- `gatekeeperInterceptor` - Functional HTTP interceptor
- `GatekeeperGuard` - Deprecated class-based guard (use functional guards instead)
- `GatekeeperInterceptor` - Deprecated class-based interceptor (use functional interceptor instead)

### Helpers

- `createMiddleware(name, handler)` - Creates middleware with name metadata

### Built-in Middleware

- `createAuthMiddleware(options)` - Authentication check
- `createRoleMiddleware(options)` - Role-based authorization
- `createFeatureFlagMiddleware(options)` - Feature flag check

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Ways to Contribute

- 🐛 [Report bugs](https://github.com/your-username/ngxsmk-gatekeeper/issues/new?template=bug_report.md)
- 💡 [Suggest features](https://github.com/your-username/ngxsmk-gatekeeper/issues/new?template=feature_request.md)
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository

## 💼 Enterprise Features

For organizations that need additional capabilities, enterprise plugins and adapters are available:

- **Enterprise Authentication Adapters**: Pre-built integrations for Auth0, Firebase, and custom JWT systems
- **Compliance & Auditing**: SOC2 and ISO 27001 compliant logging with structured audit trails
- **Premium Middleware Plugins**: Advanced authorization features and rate limiting
- **Priority Support**: Direct support channel for enterprise customers

The core library remains fully open source and functional without enterprise features. Enterprise plugins are optional additions that integrate seamlessly via the extension API.

**Learn more:**
- [Plugin Architecture](./src/lib/extensions/PLUGIN_ARCHITECTURE.md) - How to use and create plugins
- [Adapter Architecture](./src/lib/adapters/ADAPTER_ARCHITECTURE.md) - Enterprise authentication adapters
- [Compliance Mode](./src/lib/compliance/README.md) - SOC2 and ISO compliance features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Next.js middleware pattern
- Built with ❤️ for the Angular community
#   n g x s m k - g a t e k e e p e r  
 