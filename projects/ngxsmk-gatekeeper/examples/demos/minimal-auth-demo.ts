/**
 * Minimal Authentication Demo
 * 
 * This is a complete, copy-paste ready example demonstrating basic authentication
 * protection with ngxsmk-gatekeeper.
 * 
 * To use this demo:
 * 1. Copy this file to your Angular project
 * 2. Install ngxsmk-gatekeeper: npm install ngxsmk-gatekeeper
 * 3. Update imports to match your project structure
 * 4. Add your components (LoginComponent, DashboardComponent, HomeComponent)
 */

import { Component, inject, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink, RouterOutlet, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideGatekeeper, gatekeeperGuard } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// ============================================================================
// STEP 1: Create Components (must be defined before routes)
// ============================================================================

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
    // Set authentication state
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('isAuthenticated', 'true');
    }
    
    // Navigate to dashboard
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/login">Login</a>
      <a routerLink="/dashboard">Dashboard</a>
      <button (click)="toggleAuth()">
        {{ isAuthenticated ? 'Logout' : 'Login' }}
      </button>
    </nav>
    <router-outlet></router-outlet>
  `,
})
class AppComponent implements OnInit {
  private router = inject(Router);
  isAuthenticated = false;

  toggleAuth() {
    this.isAuthenticated = !this.isAuthenticated;
    
    // Store authentication state (in a real app, use a service)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('isAuthenticated', String(this.isAuthenticated));
    }

    if (this.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    // Load authentication state
    if (typeof window !== 'undefined') {
      this.isAuthenticated = window.localStorage.getItem('isAuthenticated') === 'true';
    }
  }
}

// ============================================================================
// STEP 2: Create Authentication Middleware
// ============================================================================

const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated', // Path to check in context
});

// ============================================================================
// STEP 3: Define Routes
// ============================================================================

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [gatekeeperGuard], // Protect this route
  },
  {
    path: '**',
    redirectTo: '',
  },
];

// ============================================================================
// STEP 4: Bootstrap Application
// ============================================================================

bootstrapApplication(AppComponent, {
  providers: [
    // Configure Gatekeeper
    provideGatekeeper({
      middlewares: [authMiddleware],
      onFail: '/login', // Redirect to login if authentication fails
      debug: true, // Enable debug logging (optional)
    }),

    // Router configuration
    provideRouter(routes),

    // HTTP client
    provideHttpClient(),
  ],
});

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/login">Login</a>
      <a routerLink="/dashboard">Dashboard</a>
      <button (click)="toggleAuth()">
        {{ isAuthenticated ? 'Logout' : 'Login' }}
      </button>
    </nav>
    <router-outlet></router-outlet>
  `,
})
class AppComponent implements OnInit {
  private router = inject(Router);
  isAuthenticated = false;

  toggleAuth() {
    this.isAuthenticated = !this.isAuthenticated;
    
    // Store authentication state (in a real app, use a service)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('isAuthenticated', String(this.isAuthenticated));
    }

    if (this.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    // Load authentication state
    if (typeof window !== 'undefined') {
      this.isAuthenticated = window.localStorage.getItem('isAuthenticated') === 'true';
    }
  }
}

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
    // Set authentication state
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('isAuthenticated', 'true');
    }
    
    // Navigate to dashboard
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

// ============================================================================
// IMPORTANT: Provide User Context
// ============================================================================

/**
 * In a real application, you need to provide user context to the middleware.
 * This is typically done in a service or by modifying the guard/interceptor.
 * 
 * For this demo, you can create a custom guard that adds user context:
 * 
 * ```typescript
 * import { inject } from '@angular/core';
 * import { CanActivateFn, Router } from '@angular/router';
 * import { gatekeeperGuard } from 'ngxsmk-gatekeeper';
 * 
 * export const authGuard: CanActivateFn = (route, state) => {
 *   const router = inject(Router);
 *   const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
 *   
 *   // Create context with user data
 *   const context = {
 *     user: {
 *       isAuthenticated,
 *     },
 *   };
 *   
 *   // Call gatekeeper guard with context
 *   // Note: This is a simplified example. In practice, you'd modify
 *   // the guard to inject user context automatically.
 *   return gatekeeperGuard(route, state);
 * };
 * ```
 * 
 * For a production app, consider:
 * - Using an authentication service
 * - Injecting user context in guards/interceptors
 * - Using dependency injection to provide user data
 */

