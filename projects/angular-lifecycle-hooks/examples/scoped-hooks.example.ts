/**
 * Example: Scoped Hooks
 * 
 * This example demonstrates:
 * - Scoped route hooks (specific routes/patterns)
 * - Scoped HTTP hooks (specific methods/URLs)
 * - Combining multiple scoped hooks
 */

import { Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { 
  provideLifecycleHooks, 
  getHttpLifecycleInterceptor,
  beforeRoute,
  beforeRequest,
  afterResponse,
  afterRoute
} from '../src/public-api';

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
      <a routerLink="/admin">Admin</a>
      <a routerLink="/admin/users">Admin Users</a>
      <a routerLink="/api-demo">API Demo</a>
    </nav>
    <router-outlet></router-outlet>
  `,
})
class AppComponent {}

@Component({
  selector: 'app-home',
  standalone: true,
  template: `<h1>Home</h1><p>Public page</p>`,
})
class HomeComponent {}

@Component({
  selector: 'app-admin',
  standalone: true,
  template: `<h1>Admin</h1><p>Admin page</p>`,
})
class AdminComponent {}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  template: `<h1>Admin Users</h1><p>Admin users page</p>`,
})
class AdminUsersComponent {}

@Component({
  selector: 'app-api-demo',
  standalone: true,
  template: `
    <h1>API Demo</h1>
    <button (click)="makeGetRequest()">Make GET Request</button>
    <button (click)="makePostRequest()">Make POST Request</button>
  `,
})
class ApiDemoComponent {
  http = inject(HttpClient);

  makeGetRequest() {
    this.http.get('/api/users').subscribe();
  }

  makePostRequest() {
    this.http.post('/api/users', { name: 'John' }).subscribe();
  }
}

// ============================================================================
// Routes
// ============================================================================

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin/users', component: AdminUsersComponent },
  { path: 'api-demo', component: ApiDemoComponent },
  { path: '**', redirectTo: '' },
];

// ============================================================================
// Scoped Lifecycle Hooks Configuration
// ============================================================================

bootstrapApplication(AppComponent, {
  providers: [
    // Configure scoped lifecycle hooks
    provideLifecycleHooks({
      route: {
        // Scoped hooks: only apply to admin routes
        beforeRoute: [
          beforeRoute({ path: '/admin/**' }, (ctx) => {
            console.log(`[Scoped Route] Admin route access: ${ctx.navigation.to}`);
            // Add admin-specific logic here
            return true;
          }),
          // Another scoped hook for a specific route
          beforeRoute({ path: '/admin/users' }, (ctx) => {
            console.log(`[Scoped Route] Admin users route: ${ctx.navigation.to}`);
            return true;
          }),
        ],
        // Unscoped hook: applies to all routes
        afterRoute: (ctx) => {
          console.log(`[Route] Navigated to: ${ctx.navigation.to}`);
        },
      },
      http: {
        // Scoped hooks: only apply to POST requests
        beforeRequest: [
          beforeRequest({ method: 'POST' }, (ctx) => {
            console.log(`[Scoped HTTP] POST request: ${ctx.request?.method} ${ctx.request?.url}`);
            // Add POST-specific logic here (e.g., validation)
            return true;
          }),
          // Scoped hook for API URLs with GET method
          beforeRequest({ url: '/api/**', method: 'GET' }, (ctx) => {
            console.log(`[Scoped HTTP] API GET request: ${ctx.request?.url}`);
            return true;
          }),
        ],
        // Scoped hook: only log responses for API URLs
        afterResponse: [
          afterResponse({ url: '/api/**' }, (ctx) => {
            console.log(
              `[Scoped HTTP] API response: ${ctx.response?.status} ${ctx.request?.url}`
            );
          }),
        ],
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

