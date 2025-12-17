# Getting Started

**ngxsmk-gatekeeper** is a framework-agnostic middleware engine for Angular that provides route and HTTP request protection through a composable middleware pattern.

## What is ngxsmk-gatekeeper?

ngxsmk-gatekeeper solves the problem of protecting routes and HTTP requests in Angular applications by providing:

- **Unified Middleware Pattern**: Use the same middleware for both route and HTTP protection
- **Composable Logic**: Chain middleware functions together to build complex protection logic
- **Type-Safe**: Full TypeScript support with comprehensive types
- **Tree-Shakeable**: Only bundle what you use
- **Flexible**: Works with sync, Promise, and Observable patterns

## Installation

```bash
npm install ngxsmk-gatekeeper
```

## Basic Usage

### 1. Configure the Gatekeeper

In your `app.config.ts` or `main.ts`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideGatekeeper } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideGatekeeper({
      middlewares: [createAuthMiddleware()],
      onFail: '/login',
    }),
  ],
};
```

### 2. Protect Routes

Use the `gatekeeperGuard` to protect routes:

```typescript
import { Routes } from '@angular/router';
import { gatekeeperGuard } from 'ngxsmk-gatekeeper';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [gatekeeperGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [gatekeeperGuard],
  },
];
```

### 3. Protect HTTP Requests

HTTP requests are automatically protected when you configure the gatekeeper. The middleware runs for all HTTP requests.

## Available Middleware

ngxsmk-gatekeeper includes **30+ built-in middleware** functions:

### Security (8 features)
- IP Whitelisting/Blacklisting
- CSRF Protection
- Session Management
- API Key Validation
- Account Lockout
- Webhook Signature Verification
- Device Fingerprinting
- User-Agent Validation

### Access Control (3 features)
- Time-Based Access
- Maintenance Mode
- Geographic Restrictions

### Authentication (3 features)
- Multi-Factor Authentication (MFA)
- OAuth2/OIDC
- JWT Token Refresh

### Request Processing (4 features)
- Request Validation
- Request Size Limits
- Request Deduplication
- API Versioning

### Advanced Control (4 features)
- Conditional Middleware
- Circuit Breaker
- Retry Logic
- Concurrent Limits

### Analytics & Monitoring (3 features)
- Request Analytics
- A/B Testing
- Request Logging

### Performance (2 features)
- Cache Middleware
- Request Batching

See the [Middleware API](/api/middleware) for complete documentation.

## Next Steps

- [Installation Guide](/guide/installation) - Detailed installation instructions
- [Quick Start](/guide/quick-start) - Build your first protected route
- [Middleware Pattern](/guide/middleware-pattern) - Learn about the middleware pattern
- [Security Guide](/guide/security) - Security features and best practices
- [Access Control](/guide/access-control) - Time windows and geo-blocking
- [Examples](/examples/) - See complete working examples

