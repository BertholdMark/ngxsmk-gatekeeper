# Minimal Auth Demo

A complete, copy-paste ready example demonstrating basic authentication protection with ngxsmk-gatekeeper.

## Overview

This demo shows:
- Simple authentication check
- Protected route (dashboard)
- Public route (home)
- Login/logout functionality

## Complete Example

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink, RouterOutlet, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideGatekeeper, gatekeeperGuard } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// Components
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Home</h1>
    <p>This is a public page. Anyone can access it.</p>
    <a routerLink="/dashboard">Go to Dashboard (requires auth)</a>
  `,
})
class HomeComponent {}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  template: `
    <h1>Login</h1>
    <p>Please log in to access the dashboard.</p>
    <button (click)="login()">Login</button>
  `,
})
class LoginComponent {
  private router = inject(Router);

  login() {
    localStorage.setItem('isAuthenticated', 'true');
    this.router.navigate(['/dashboard']);
  }
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  template: `
    <h1>Dashboard</h1>
    <p>This is a protected page. You must be authenticated to see this.</p>
    <p>✅ Authentication successful!</p>
  `,
})
class DashboardComponent {}

// Routes
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [gatekeeperGuard], // Protected route
  },
];

// Bootstrap
bootstrapApplication(HomeComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideGatekeeper({
      middlewares: [
        createAuthMiddleware({
          authPath: 'user.isAuthenticated',
        }),
      ],
      onFail: '/login',
    }),
  ],
});
```

## How It Works

1. **Auth Middleware**: Checks if user is authenticated via `user.isAuthenticated` in context
2. **Protected Route**: Dashboard route uses `gatekeeperGuard` to enforce authentication
3. **Public Route**: Home route is accessible without authentication
4. **Login Flow**: Login component sets authentication state and redirects

## Running the Demo

1. Copy the code above to your Angular project
2. Install ngxsmk-gatekeeper: `npm install ngxsmk-gatekeeper`
3. Run: `ng serve`
4. Navigate to `/dashboard` - you'll be redirected to `/login`
5. Click "Login" - you'll be redirected to `/dashboard`

## Next Steps

- [Role-Based Routing Demo](./role-based-routing) - Add role-based access control
- [HTTP Protection Demo](./http-protection) - Protect HTTP requests
- [Middleware Pattern](/guide/middleware-pattern) - Learn about middleware

