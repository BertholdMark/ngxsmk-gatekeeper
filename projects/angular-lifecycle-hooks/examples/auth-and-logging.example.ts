/**
 * Example: Authentication Check and Request Logging
 * 
 * This example demonstrates:
 * - Authentication check before route navigation
 * - Request logging for all HTTP requests
 * - Error handling for failed requests
 */

import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router, RouterOutlet, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject } from '@angular/core';
import { provideLifecycleHooks, getHttpLifecycleInterceptor } from '../src/public-api';

// ============================================================================
// Mock Authentication Service
// ============================================================================

class AuthService {
  private isAuthenticated = false;

  async checkAuth(): Promise<boolean> {
    // Simulate async auth check
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.isAuthenticated), 100);
    });
  }

  login() {
    this.isAuthenticated = true;
    localStorage.setItem('isAuthenticated', 'true');
  }

  logout() {
    this.isAuthenticated = false;
    localStorage.removeItem('isAuthenticated');
  }

  constructor() {
    // Load auth state from localStorage
    this.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  }
}

// ============================================================================
// Components
// ============================================================================

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/dashboard">Dashboard</a>
      <button (click)="toggleAuth()">
        {{ authService.isAuthenticated ? 'Logout' : 'Login' }}
      </button>
    </nav>
    <router-outlet></router-outlet>
  `,
})
class AppComponent {
  authService = inject(AuthService);

  toggleAuth() {
    if (this.authService.isAuthenticated) {
      this.authService.logout();
    } else {
      this.authService.login();
    }
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  template: `<h1>Home</h1><p>Public page</p>`,
})
class HomeComponent {}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `<h1>Dashboard</h1><p>Protected page</p>`,
})
class DashboardComponent {}

// ============================================================================
// Routes
// ============================================================================

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '' },
];

// ============================================================================
// Lifecycle Hooks Configuration
// ============================================================================

bootstrapApplication(AppComponent, {
  providers: [
    // Provide AuthService
    { provide: AuthService, useClass: AuthService },

    // Configure lifecycle hooks
    provideLifecycleHooks({
      route: {
        beforeRoute: async (ctx) => {
          console.log(`[Route] Before navigation to: ${ctx.navigation.to}`);
          
          // Check authentication for protected routes
          if (ctx.navigation.to.startsWith('/dashboard')) {
            const authService = inject(AuthService);
            const isAuthenticated = await authService.checkAuth();
            
            if (!isAuthenticated) {
              console.warn(`[Route] Blocked: Unauthenticated access to ${ctx.navigation.to}`);
              // Note: To redirect, you would need to inject Router and navigate
              // For this example, we just block
              return false;
            }
          }
          
          return true;
        },
        afterRoute: (ctx) => {
          console.log(`[Route] After navigation to: ${ctx.navigation.to}`);
        },
        routeBlocked: (ctx) => {
          console.warn(`[Route] Navigation blocked to: ${ctx.navigation.to}`);
        },
      },
      http: {
        beforeRequest: (ctx) => {
          const timestamp = new Date(ctx.timestamp).toISOString();
          console.log(`[HTTP] [${timestamp}] ${ctx.request?.method} ${ctx.request?.url}`);
          return true;
        },
        afterResponse: (ctx) => {
          const timestamp = new Date(ctx.timestamp).toISOString();
          console.log(
            `[HTTP] [${timestamp}] ${ctx.response?.status} ${ctx.response?.statusText} ${ctx.request?.url}`
          );
        },
        requestBlocked: (ctx) => {
          console.warn(`[HTTP] Request blocked: ${ctx.request?.method} ${ctx.request?.url}`);
        },
        requestFailed: (ctx) => {
          console.error(
            `[HTTP] Request failed: ${ctx.request?.method} ${ctx.request?.url}`,
            ctx.error
          );
        },
      },
    }),

    // Router
    provideRouter(routes),

    // HTTP client with lifecycle interceptor
    provideHttpClient(
      withInterceptors([getHttpLifecycleInterceptor()])
    ),
  ],
});

