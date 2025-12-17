# Route Protection

Protect Angular routes using ngxsmk-gatekeeper middleware.

## Basic Route Protection

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
];
```

## Route-Level Middleware

Override global middleware for specific routes:

```typescript
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [adminPipeline],
        onFail: '/unauthorized',
      },
    },
  },
];
```

## Lazy Loading Protection

Protect lazy-loaded routes using `gatekeeperLoadGuard`:

```typescript
import { gatekeeperLoadGuard } from 'ngxsmk-gatekeeper';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin.routes'),
    canLoad: [gatekeeperLoadGuard],
    data: {
      gatekeeper: {
        middlewares: [adminPipeline],
      },
    },
  },
];
```

## Multiple Guards

You can combine `gatekeeperGuard` with other guards:

```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [gatekeeperGuard, customGuard],
  },
];
```

## Route Data Access

Access route data in middleware:

```typescript
const middleware = createMiddleware('custom', (context) => {
  const routeData = context.data;
  const requiresAuth = routeData?.['requiresAuth'];
  
  if (requiresAuth && !context.user?.isAuthenticated) {
    return false;
  }
  
  return true;
});
```

## Dynamic Route Protection

Protect routes based on route parameters:

```typescript
const middleware = createMiddleware('param-check', (context) => {
  const userId = context.params?.['userId'];
  const currentUser = context.user?.id;
  
  return userId === currentUser;
});
```

## Redirect on Failure

Configure redirect behavior:

```typescript
// Global redirect
provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
});

// Route-specific redirect
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [adminPipeline],
        onFail: '/unauthorized', // Override global redirect
      },
    },
  },
];
```

## Examples

### Simple Authentication

```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [gatekeeperGuard], // Uses global authMiddleware
  },
];
```

### Role-Based Protection

```typescript
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [adminPipeline],
      },
    },
  },
];
```

### Feature Flag Protection

```typescript
const routes: Routes = [
  {
    path: 'beta-feature',
    component: BetaFeatureComponent,
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [featureFlagMiddleware],
      },
    },
  },
];
```

## Next Steps

- [HTTP Protection](/guide/http-protection) - Protect HTTP requests
- [Middleware Pattern](/guide/middleware-pattern) - Learn about middleware
- [Pipelines](/guide/pipelines) - Create reusable middleware groups

