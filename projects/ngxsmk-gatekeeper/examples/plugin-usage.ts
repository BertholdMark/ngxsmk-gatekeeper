/**
 * Example: Using plugins with ngxsmk-gatekeeper
 * 
 * This example demonstrates how to use plugins with the core library.
 * All plugins are open source and free to use.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

// Core library imports
import { provideGatekeeper, gatekeeperGuard, gatekeeperInterceptor } from 'ngxsmk-gatekeeper';
import { provideExtensions } from 'ngxsmk-gatekeeper/lib/extensions';
import { authMiddleware } from './middlewares/auth.middleware';

// Plugin imports (open source packages)
import { AuthPlugin } from 'ngxsmk-gatekeeper/lib/plugins/auth';
import { AuditPlugin } from 'ngxsmk-gatekeeper/lib/plugins/audit';

bootstrapApplication(AppComponent, {
  providers: [
    // Core gatekeeper configuration (open source)
    provideGatekeeper({
      middlewares: [
        // User-configured middleware
        authMiddleware,
      ],
      onFail: '/login',
      debug: true,
    }),

    // Register plugins (all open source and free)
    provideExtensions([
      // Authentication plugin with MFA support
      new AuthPlugin({
        apiKey: 'your-api-key',
        mfaRequired: true,
      }),

      // Audit logging plugin
      new AuditPlugin({
        endpoint: 'https://audit.example.com',
        batchSize: 100,
      }),
    ]),

    // Router configuration
    provideRouter(routes),

    // HTTP client with gatekeeper interceptor
    provideHttpClient(
      withInterceptors([gatekeeperInterceptor])
    ),
  ],
});

/**
 * Example route configuration
 * 
 * Plugins automatically add their middleware to the chain.
 * The execution order is:
 * 1. Plugin pre-middleware
 * 2. User-configured middleware
 * 3. Plugin merged middleware
 * 4. Plugin post-middleware
 */
export const exampleRoutes = [
  {
    path: 'dashboard',
    canActivate: [gatekeeperGuard],
    loadComponent: () => import('./dashboard.component'),
    // Plugin middleware is automatically included
    // No need to explicitly reference plugins
  },
  {
    path: 'admin',
    canActivate: [gatekeeperGuard],
    loadComponent: () => import('./admin.component'),
    data: {
      gatekeeper: {
        // Route-level middleware (merged with plugin middleware)
        middlewares: [/* additional middleware */],
      },
    },
  },
];

