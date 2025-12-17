/**
 * Standalone usage example for ngxsmk-gatekeeper
 * 
 * This file demonstrates how to configure and use the Gatekeeper library
 * in an Angular standalone application.
 */

import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideGatekeeper,
  gatekeeperGuard,
  gatekeeperLoadGuard,
  gatekeeperInterceptor,
  definePipeline,
  withGatekeeper,
} from '../src/public-api';
import { createAuthMiddleware, createRoleMiddleware } from '../src/lib/middlewares';

// Example: Define individual middlewares
const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
});

// Example: Define reusable pipelines
const adminPipeline = definePipeline('adminOnly', [
  authMiddleware,
  createRoleMiddleware({
    roles: ['admin'],
    mode: 'any',
  }),
]);

const moderatorPipeline = definePipeline('moderatorOnly', [
  authMiddleware,
  createRoleMiddleware({
    roles: ['moderator', 'admin'],
    mode: 'any',
  }),
]);

// Example: Configure Gatekeeper with pipelines
const gatekeeperConfig = provideGatekeeper({
  middlewares: [
    adminPipeline, // Use pipeline
    // You can also mix pipelines and individual middlewares
  ],
  onFail: '/login',
  debug: true, // Enable debug logging
});

// Example: Define routes with functional guards
const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component'),
    canActivate: [gatekeeperGuard],
    // Route-level middleware overrides global middleware
    data: {
      gatekeeper: {
        middlewares: [authMiddleware],
      },
    },
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin.routes'),
    canLoad: [gatekeeperLoadGuard],
    // Use pipeline in route-level config
    data: {
      gatekeeper: {
        middlewares: [adminPipeline],
        onFail: '/unauthorized', // Route-specific redirect
      },
    },
  },
  {
    path: 'login',
    loadComponent: () => import('./login.component'),
  },
];

// Example: Use per-request middleware in HTTP calls
// (This would typically be in a service)
/*
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { createFeatureFlagMiddleware } from '../src/lib/middlewares';

class DataService {
  private http = inject(HttpClient);
  
  getBetaData() {
    return this.http.get('/api/data', {
      context: withGatekeeper([
        createFeatureFlagMiddleware({ flagName: 'beta' })
      ])
    });
  }
  
  postAdminData(data: unknown) {
    return this.http.post('/api/admin', data, {
      context: withGatekeeper([adminPipeline], '/unauthorized')
    });
  }
}
*/

// Example: Bootstrap application with providers
@Component({
  selector: 'app-root',
  standalone: true,
  template: '<router-outlet></router-outlet>',
})
class AppComponent {}

bootstrapApplication(AppComponent, {
  providers: [
    // Gatekeeper configuration
    gatekeeperConfig,
    
    // Router with routes
    provideRouter(routes),
    
    // HTTP client with Gatekeeper interceptor
    provideHttpClient(
      withInterceptors([gatekeeperInterceptor])
    ),
  ],
});

