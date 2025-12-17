/**
 * HTTP Protection Demo
 * 
 * This is a complete, copy-paste ready example demonstrating HTTP request
 * protection with ngxsmk-gatekeeper.
 * 
 * To use this demo:
 * 1. Copy this file to your Angular project
 * 2. Install ngxsmk-gatekeeper: npm install ngxsmk-gatekeeper
 * 3. Update imports to match your project structure
 * 4. Add your components
 */

import { Component, inject, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterLink, RouterOutlet, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { JsonPipe, NgIf } from '@angular/common';
import { provideGatekeeper, gatekeeperInterceptor, withGatekeeper } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware, createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// ============================================================================
// STEP 1: Create Middleware
// ============================================================================

// Authentication middleware - checks if user is logged in
const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
});

// Admin middleware - requires 'admin' role
const adminMiddleware = createRoleMiddleware({
  roles: ['admin'],
  mode: 'any',
});

// ============================================================================
// STEP 2: Create Data Service (must be defined before components)
// ============================================================================

class DataService {
  private http = inject(HttpClient);

  // Public API - no authentication required
  getPublicData() {
    return this.http.get('/api/public/data');
  }

  // Protected API - requires authentication (uses global middleware)
  getProtectedData() {
    return this.http.get('/api/protected/data');
  }

  // Admin API - requires authentication AND admin role
  getAdminData() {
    return this.http.get('/api/admin/data', {
      context: withGatekeeper([
        authMiddleware,
        adminMiddleware,
      ]),
    });
  }

  // Admin API with custom redirect
  deleteAdminData(id: string) {
    return this.http.delete(`/api/admin/data/${id}`, {
      context: withGatekeeper(
        [authMiddleware, adminMiddleware],
        '/unauthorized' // Custom redirect on failure
      ),
    });
  }
}

// ============================================================================
// STEP 3: Create Components (must be defined before routes)
// ============================================================================

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  template: `
    <h1>Login</h1>
    <p>Choose a role to login as:</p>
    <button (click)="login('user')">Login as User</button>
    <button (click)="login('admin')">Login as Admin</button>
  `,
})
class LoginComponent {
  login(role: string) {
    const user = {
      name: `User ${role}`,
      role,
      isAuthenticated: true,
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user', JSON.stringify(user));
    }
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [JsonPipe, NgIf],
  template: `
    <h1>HTTP Protection Demo</h1>
    
    <div>
      <h2>Public API</h2>
      <button (click)="callPublicApi()">Call Public API</button>
      <pre>{{ publicData | json }}</pre>
    </div>

    <div>
      <h2>Protected API (Requires Auth)</h2>
      <button (click)="callProtectedApi()">Call Protected API</button>
      <pre>{{ protectedData | json }}</pre>
      <p *ngIf="protectedError" style="color: red;">Error: {{ protectedError }}</p>
    </div>

    <div>
      <h2>Admin API (Requires Admin Role)</h2>
      <button (click)="callAdminApi()">Call Admin API</button>
      <pre>{{ adminData | json }}</pre>
      <p *ngIf="adminError" style="color: red;">Error: {{ adminError }}</p>
    </div>
  `,
})
class HomeComponent {
  private dataService = inject(DataService);
  
  publicData: unknown = null;
  protectedData: unknown = null;
  protectedError: string | null = null;
  adminData: unknown = null;
  adminError: string | null = null;

  callPublicApi() {
    this.dataService.getPublicData().subscribe({
      next: (data) => {
        this.publicData = data;
        console.log('Public API response:', data);
      },
      error: (error) => {
        console.error('Public API error:', error);
      },
    });
  }

  callProtectedApi() {
    this.protectedError = null;
    this.dataService.getProtectedData().subscribe({
      next: (data) => {
        this.protectedData = data;
        console.log('Protected API response:', data);
      },
      error: (error) => {
        this.protectedError = error.message || 'Request blocked by middleware';
        console.error('Protected API error:', error);
      },
    });
  }

  callAdminApi() {
    this.adminError = null;
    this.dataService.getAdminData().subscribe({
      next: (data) => {
        this.adminData = data;
        console.log('Admin API response:', data);
      },
      error: (error) => {
        this.adminError = error.message || 'Request blocked - admin role required';
        console.error('Admin API error:', error);
      },
    });
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/login">Login</a>
      <div>
        <span>User: {{ currentUser?.name || 'Not logged in' }}</span>
        <span>Role: {{ currentUser?.role || 'none' }}</span>
        <button (click)="login('user')">Login as User</button>
        <button (click)="login('admin')">Login as Admin</button>
        <button (click)="logout()">Logout</button>
      </div>
    </nav>
    <router-outlet></router-outlet>
  `,
})
class AppComponent implements OnInit {
  currentUser: { name: string; role: string; isAuthenticated: boolean } | null = null;

  login(role: string) {
    this.currentUser = {
      name: `User ${role}`,
      role,
      isAuthenticated: true,
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }

  logout() {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('user');
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
  }
}

// ============================================================================
// STEP 4: Define Routes
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
    path: '**',
    redirectTo: '',
  },
];

// ============================================================================
// STEP 5: Bootstrap Application
// ============================================================================

bootstrapApplication(AppComponent, {
  providers: [
    // Configure Gatekeeper
    provideGatekeeper({
      middlewares: [authMiddleware], // Global middleware for all HTTP requests
      onFail: '/login',
      debug: true, // Enable debug logging
    }),

    // Router configuration
    provideRouter(routes),

    // HTTP client with Gatekeeper interceptor
    provideHttpClient(
      withInterceptors([gatekeeperInterceptor])
    ),
  ],
});

// ============================================================================
// IMPORTANT: How HTTP Protection Works
// ============================================================================

/**
 * HTTP Protection with ngxsmk-gatekeeper:
 * 
 * 1. **Global Protection**: All HTTP requests go through the interceptor
 *    and are checked against global middleware (authMiddleware in this example).
 * 
 * 2. **Per-Request Protection**: Use withGatekeeper() to add middleware
 *    for specific requests:
 * 
 *    ```typescript
 *    this.http.get('/api/admin/data', {
 *      context: withGatekeeper([authMiddleware, adminMiddleware])
 *    });
 *    ```
 * 
 * 3. **Request Blocking**: If middleware returns false, the request is
 *    cancelled (returns EMPTY observable) and never sent to the server.
 * 
 * 4. **User Context**: The interceptor automatically builds context from
 *    the HTTP request. You need to provide user data in the context.
 * 
 * 5. **Custom Redirects**: You can specify a redirect path:
 * 
 *    ```typescript
 *    context: withGatekeeper([middleware], '/unauthorized')
 *    ```
 * 
 * Note: In a real application, you would:
 * - Use an authentication service to provide user context
 * - Store authentication tokens in a secure way
 * - Handle errors appropriately
 * - Implement proper error handling and user feedback
 */
