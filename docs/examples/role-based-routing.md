# Role-Based Routing Demo

Complete example demonstrating role-based access control with ngxsmk-gatekeeper.

## Overview

This demo shows:
- Authentication middleware
- Role-based middleware (admin, moderator)
- Reusable pipelines
- Multiple protected routes with different role requirements

## Complete Example

```typescript
import { Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideGatekeeper, gatekeeperGuard, definePipeline } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware, createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// Create middleware
const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
});

const adminMiddleware = createRoleMiddleware({
  roles: ['admin'],
  mode: 'any',
});

const moderatorMiddleware = createRoleMiddleware({
  roles: ['moderator', 'admin'],
  mode: 'any',
});

// Create pipelines
const adminPipeline = definePipeline('adminOnly', [
  authMiddleware,
  adminMiddleware,
]);

const moderatorPipeline = definePipeline('moderatorOnly', [
  authMiddleware,
  moderatorMiddleware,
]);

// Routes
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [gatekeeperGuard], // Requires authentication
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [adminPipeline], // Requires admin role
        onFail: '/unauthorized',
      },
    },
  },
  {
    path: 'moderator',
    component: ModeratorComponent,
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [moderatorPipeline], // Requires moderator or admin
        onFail: '/unauthorized',
      },
    },
  },
];

// Bootstrap
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideGatekeeper({
      middlewares: [authMiddleware],
      onFail: '/login',
    }),
  ],
});
```

## How It Works

1. **Authentication**: All routes require authentication via `authMiddleware`
2. **Role Checks**: Admin and moderator routes use role-based middleware
3. **Pipelines**: Reusable middleware groups for different role requirements
4. **Route Overrides**: Each route can specify its own middleware chain

## User Context

The middleware checks for user data in context:

```typescript
{
  user: {
    isAuthenticated: true,
    roles: ['admin', 'user'], // For role middleware
  }
}
```

## Next Steps

- [Minimal Auth Demo](./minimal-auth) - Start with basic authentication
- [HTTP Protection Demo](./http-protection) - Protect HTTP requests
- [Pipelines](/guide/pipelines) - Learn about pipelines

