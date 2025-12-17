# Standalone Usage

Example of using ngxsmk-gatekeeper in Angular standalone applications.

## Overview

ngxsmk-gatekeeper is designed for Angular 17+ standalone applications and uses functional guards and interceptors.

## Standalone Setup

```typescript
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideGatekeeper,
  gatekeeperGuard,
  gatekeeperInterceptor,
  definePipeline,
} from 'ngxsmk-gatekeeper';
import { createAuthMiddleware, createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// Define middleware
const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
});

const adminPipeline = definePipeline('adminOnly', [
  authMiddleware,
  createRoleMiddleware({ roles: ['admin'] }),
]);

// Routes
const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component'),
    canActivate: [gatekeeperGuard],
  },
];

// Bootstrap
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([gatekeeperInterceptor])
    ),
    provideGatekeeper({
      middlewares: [authMiddleware],
      onFail: '/login',
    }),
  ],
});
```

## Standalone Components

All components are standalone:

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `...`,
})
export class DashboardComponent {}
```

## Functional Guards

Use functional guards (Angular 17+):

```typescript
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [gatekeeperGuard], // Functional guard
  },
];
```

## Functional Interceptors

Use functional interceptors (Angular 17+):

```typescript
provideHttpClient(
  withInterceptors([gatekeeperInterceptor]) // Functional interceptor
);
```

## Next Steps

- [Quick Start](/guide/quick-start) - Get started quickly
- [Installation](/guide/installation) - Installation guide

