# 🛡️ ngxsmk-gatekeeper - The Ultimate Angular Route & HTTP Protection Library

[![npm version](https://img.shields.io/npm/v/ngxsmk-gatekeeper.svg)](https://www.npmjs.com/package/ngxsmk-gatekeeper)
[![npm downloads](https://img.shields.io/npm/dm/ngxsmk-gatekeeper.svg)](https://www.npmjs.com/package/ngxsmk-gatekeeper)
[![Angular](https://img.shields.io/badge/Angular-17%2B-red.svg)](https://angular.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)

> **Stop writing duplicate route guards and HTTP interceptors. Start protecting your Angular app in 30 seconds.**

**ngxsmk-gatekeeper** is the most powerful, developer-friendly middleware engine for Angular. Protect routes and HTTP requests with a single, composable configuration. **100% open source. Zero dependencies. Production-ready.**

## 🚀 Why Developers Love This Library

**The Problem:** You're writing custom guards for routes, separate interceptors for HTTP, duplicating logic, and struggling to compose protection rules.

**The Solution:** One middleware pattern. One configuration. Works everywhere. Type-safe. Tree-shakeable. Zero bloat.

### ⚡ Get Protected in 30 Seconds

```bash
npm install ngxsmk-gatekeeper
```

```typescript
import { provideGatekeeper, gatekeeperGuard } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// 1. Create middleware (one line)
const authMiddleware = createAuthMiddleware({ authPath: 'user.isAuthenticated' });

// 2. Configure (one provider)
bootstrapApplication(AppComponent, {
  providers: [
    provideGatekeeper({ middlewares: [authMiddleware], onFail: '/login' }),
  ],
});

// 3. Protect routes (one guard)
const routes: Routes = [
  { path: 'dashboard', canActivate: [gatekeeperGuard], loadComponent: () => import('./dashboard.component') },
];
```

**Done.** Your routes are protected. HTTP requests too. No boilerplate. No duplication.

## ✨ What Makes This Special?

### 🎯 Built for Angular Developers

- **Next.js Middleware Experience** - If you love Next.js middleware, you'll love this
- **Functional API** - Modern Angular 17+ patterns, no legacy code
- **Standalone-Only** - Built for the future of Angular
- **TypeScript First** - Full type safety, autocomplete, zero runtime errors

### 🚀 Performance That Matters

- **Tree-Shakeable** - Only bundle what you use (zero overhead)
- **Zero Dependencies** - Lightweight core, no bloat
- **Optimized Execution** - Fast middleware chains, minimal overhead
- **Built-in Benchmarking** - Identify bottlenecks automatically

### 🔧 Developer Experience That Delights

- **Debug Mode** - See exactly what's happening in your middleware
- **Composable** - Build complex logic from simple pieces
- **Flexible** - Sync, Promise, or Observable - your choice
- **Well-Documented** - Comprehensive docs with real examples

## 🎨 Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Route Protection** | Protect routes with functional guards | ✅ Production Ready |
| **HTTP Protection** | Protect API calls with interceptors | ✅ Production Ready |
| **Composable Middleware** | Chain middleware like Next.js | ✅ Production Ready |
| **Type-Safe** | Full TypeScript support | ✅ Production Ready |
| **Tree-Shakeable** | Zero bundle overhead | ✅ Production Ready |
| **Debug Mode** | Built-in debugging and benchmarking | ✅ Production Ready |
| **Authentication Adapters** | Auth0, Firebase, JWT support | ✅ Included |
| **Compliance Mode** | SOC2, ISO 27001 ready | ✅ Included |
| **Plugin Architecture** | Extensible and customizable | ✅ Included |

## 📖 Real-World Examples

### 🔐 Authentication Protection

```typescript
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
});

provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
});
```

### 👥 Role-Based Access Control

```typescript
import { createAuthMiddleware, createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';
import { definePipeline } from 'ngxsmk-gatekeeper';

// Create reusable pipeline
const adminPipeline = definePipeline('adminOnly', [
  createAuthMiddleware(),
  createRoleMiddleware({ roles: ['admin'], mode: 'any' }),
]);

// Use in routes
const routes: Routes = [
  {
    path: 'admin',
    canActivate: [gatekeeperGuard],
    data: { gatekeeper: { middlewares: [adminPipeline] } },
  },
];
```

### 🌐 HTTP Request Protection

```typescript
import { gatekeeperInterceptor } from 'ngxsmk-gatekeeper';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Same middleware works for HTTP too!
provideHttpClient(
  withInterceptors([gatekeeperInterceptor])
);
```

## 🎯 Perfect For

- ✅ **Enterprise Applications** - SOC2, ISO compliance ready
- ✅ **SaaS Products** - Multi-tenant, role-based access
- ✅ **E-commerce** - Payment protection, cart security
- ✅ **Admin Dashboards** - Complex permission systems
- ✅ **Public APIs** - Rate limiting, authentication
- ✅ **Any Angular App** - That needs route or HTTP protection

## 🔥 Why Choose ngxsmk-gatekeeper?

### vs. Writing Custom Guards

| Custom Guards | ngxsmk-gatekeeper |
|---------------|-------------------|
| ❌ Duplicate logic for routes and HTTP | ✅ One middleware, works everywhere |
| ❌ Hard to compose and reuse | ✅ Composable pipelines |
| ❌ No type safety | ✅ Full TypeScript support |
| ❌ Difficult to debug | ✅ Built-in debug mode |
| ❌ No performance insights | ✅ Built-in benchmarking |

### vs. Other Libraries

- **More Flexible** - Works with sync, Promise, and Observable
- **Better DX** - Debug mode, benchmarking, type safety
- **Zero Dependencies** - Lighter than alternatives
- **Modern API** - Functional guards, standalone-only
- **Production Ready** - Used in real applications

## 🚀 Quick Start Guide

### Step 1: Install

```bash
npm install ngxsmk-gatekeeper
```

### Step 2: Configure

```typescript
import { provideGatekeeper } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

bootstrapApplication(AppComponent, {
  providers: [
    provideGatekeeper({
      middlewares: [createAuthMiddleware()],
      onFail: '/login',
    }),
  ],
});
```

### Step 3: Protect Routes

```typescript
import { gatekeeperGuard } from 'ngxsmk-gatekeeper';

const routes: Routes = [
  { path: 'dashboard', canActivate: [gatekeeperGuard], loadComponent: () => import('./dashboard.component') },
];
```

### Step 4: Protect HTTP (Optional)

```typescript
import { gatekeeperInterceptor } from 'ngxsmk-gatekeeper';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

provideHttpClient(
  withInterceptors([gatekeeperInterceptor])
);
```

**That's it!** Your app is now protected. 🎉

## 📚 Complete Documentation

- **[📖 Full Documentation](https://your-docs-url)** - Complete guide with examples
- **[🚀 Quick Start Guide](./docs/guide/quick-start.md)** - Get started in 5 minutes
- **[🎯 Middleware Pattern](./docs/guide/middleware-pattern.md)** - Learn the core concept
- **[🔐 Route Protection](./docs/guide/route-protection.md)** - Protect your routes
- **[🌐 HTTP Protection](./docs/guide/http-protection.md)** - Protect API calls
- **[📦 Examples](./docs/examples/)** - Copy-paste ready examples

## 💡 Advanced Features

### 🔍 Debug Mode

See exactly what's happening:

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  debug: true, // Enable debug logging
});
```

**Output:**
```
[Gatekeeper] Chain started: /dashboard
[Gatekeeper] Middleware[0] (auth): ✓ Passed (2.3ms)
[Gatekeeper] Chain completed: ✓ Allowed (3.4ms)
```

### ⚡ Performance Benchmarking

Identify bottlenecks automatically:

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  benchmark: {
    enabled: true,
    middlewareThreshold: 100, // Warn if > 100ms
    chainThreshold: 500,       // Warn if > 500ms
  },
});
```

### 🎨 Custom Middleware

Build your own protection logic:

```typescript
import { createMiddleware } from 'ngxsmk-gatekeeper';

const customMiddleware = createMiddleware('custom', (context) => {
  // Your logic here
  return context.user?.hasPermission('custom-permission') ?? false;
});
```

## 🎓 Learn More

### 📖 Documentation

- **[Getting Started](./docs/guide/getting-started.md)** - Introduction and overview
- **[Installation](./docs/guide/installation.md)** - Setup instructions
- **[Middleware Pattern](./docs/guide/middleware-pattern.md)** - Core concepts
- **[API Reference](./docs/api/)** - Complete API documentation

### 🎯 Examples

- **[Minimal Auth Demo](./projects/ngxsmk-gatekeeper/examples/demos/minimal-auth-demo.ts)** - Basic authentication
- **[Role-Based Routing](./projects/ngxsmk-gatekeeper/examples/demos/role-based-routing-demo.ts)** - RBAC example
- **[HTTP Protection](./projects/ngxsmk-gatekeeper/examples/demos/http-protection-demo.ts)** - API protection

## 🏆 Production Ready

- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Tree-Shakeable** - Zero bundle overhead
- ✅ **Well-Tested** - Comprehensive test coverage
- ✅ **Well-Documented** - Complete documentation
- ✅ **Security-First** - Responsible disclosure policy
- ✅ **Long-Term Support** - Clear LTS strategy

## 📋 Requirements

- **Angular 17+** (Standalone components required)
- **TypeScript 5.9+**
- **Node.js 18+**

## 🤝 Contributing

We welcome contributions! Whether it's:

- 🐛 Bug reports
- 💡 Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions
- ⭐ Starring the repo

**Read our [Contributing Guide](./CONTRIBUTING.md) to get started.**

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

**100% open source. Free forever. No restrictions.**

## 🌟 Show Your Support

If this library helps you build better Angular applications:

- ⭐ **Star the repository**
- 📢 **Share with your team**
- 🐦 **Tweet about it**
- 💬 **Leave feedback**

## 🔗 Links

- 📦 [npm Package](https://www.npmjs.com/package/ngxsmk-gatekeeper)
- 📚 [Documentation](https://your-docs-url)
- 🐛 [Issue Tracker](https://github.com/your-username/ngxsmk-gatekeeper/issues)
- 💬 [Discussions](https://github.com/your-username/ngxsmk-gatekeeper/discussions)
- 🔒 [Security Policy](./SECURITY.md)

## 🙏 Acknowledgments

Built with ❤️ for the Angular community. Inspired by Next.js middleware pattern.

---

**Made by developers, for developers.** 🚀

**Questions?** Open an issue or start a discussion. We're here to help!
