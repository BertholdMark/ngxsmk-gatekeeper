# Quick Start

This guide will walk you through creating your first protected route with ngxsmk-gatekeeper.

## Step 1: Install the Library

```bash
npm install ngxsmk-gatekeeper
```

## Step 2: Configure the Gatekeeper

In your `app.config.ts`:

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

## Step 3: Create a Simple Auth Middleware

Create `src/app/auth.middleware.ts`:

```typescript
import { createMiddleware } from 'ngxsmk-gatekeeper';
import { MiddlewareContext } from 'ngxsmk-gatekeeper';

export const authMiddleware = createMiddleware('auth', (context: MiddlewareContext) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return false; // Block access
  }
  
  return true; // Allow access
});
```

## Step 4: Protect a Route

In your routes configuration:

```typescript
import { Routes } from '@angular/router';
import { gatekeeperGuard } from 'ngxsmk-gatekeeper';
import { DashboardComponent } from './dashboard.component';
import { LoginComponent } from './login.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [gatekeeperGuard], // Protected route
  },
];
```

## Step 5: Create Login Component

Create `src/app/login.component.ts`:

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <h1>Login</h1>
    <button (click)="login()">Login</button>
  `,
})
export class LoginComponent {
  constructor(private router: Router) {}

  login() {
    localStorage.setItem('isAuthenticated', 'true');
    this.router.navigate(['/dashboard']);
  }
}
```

## Step 6: Test It

1. Start your development server: `ng serve`
2. Navigate to `/dashboard` - you should be redirected to `/login`
3. Click the login button
4. You should now be able to access `/dashboard`

## What's Next?

- [Middleware Pattern](/guide/middleware-pattern) - Learn how middleware works
- [Route Protection](/guide/route-protection) - Advanced route protection patterns
- [Security Guide](/guide/security) - Explore 8 security middleware features
- [Access Control](/guide/access-control) - Time windows and geo-blocking
- [Examples](/examples/) - See complete working examples
- [API Reference](/api/middleware) - All 30+ middleware functions

