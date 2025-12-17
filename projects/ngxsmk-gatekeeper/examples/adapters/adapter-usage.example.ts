/**
 * Example: Using Authentication Adapters
 * 
 * This demonstrates how to use authentication adapters
 * (Auth0, Firebase, Custom JWT) with ngxsmk-gatekeeper.
 * All adapters are open source and free to use.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

// Core library imports
import { provideGatekeeper, gatekeeperGuard, gatekeeperInterceptor } from 'ngxsmk-gatekeeper';
import { provideAdapters, createAdapterMiddleware } from 'ngxsmk-gatekeeper/lib/adapters';

// Adapter imports (open source packages)
import { Auth0Adapter } from 'ngxsmk-gatekeeper/lib/adapters/auth0';
import { FirebaseAdapter } from 'ngxsmk-gatekeeper/lib/adapters/firebase';
import { JWTAdapter } from 'ngxsmk-gatekeeper/lib/adapters/jwt';

/**
 * Example 1: Using Auth0 Adapter
 */
export function exampleAuth0() {
  bootstrapApplication(AppComponent, {
    providers: [
      // Register Auth0 adapter
      provideAdapters([
        new Auth0Adapter({
          domain: 'your-domain.auth0.com',
          clientId: 'your-client-id',
          audience: 'your-api-audience',
        }),
      ]),

      // Create middleware using the adapter
      provideGatekeeper({
        middlewares: [
          createAdapterMiddleware(
            new Auth0Adapter({
              domain: 'your-domain.auth0.com',
              clientId: 'your-client-id',
            }),
            {
              requireAuth: true,
              redirectOnFail: '/login',
              autoRefresh: true,
            }
          ),
        ],
        onFail: '/login',
      }),

      provideRouter(routes),
      provideHttpClient(withInterceptors([gatekeeperInterceptor])),
    ],
  });
}

/**
 * Example 2: Using Firebase Adapter
 */
export function exampleFirebase() {
  bootstrapApplication(AppComponent, {
    providers: [
      // Register Firebase adapter
      provideAdapters([
        new FirebaseAdapter({
          apiKey: 'your-api-key',
          authDomain: 'your-project.firebaseapp.com',
          projectId: 'your-project-id',
        }),
      ]),

      // Create middleware using the adapter
      provideGatekeeper({
        middlewares: [
          createAdapterMiddleware(
            new FirebaseAdapter({
              apiKey: 'your-api-key',
              authDomain: 'your-project.firebaseapp.com',
              projectId: 'your-project-id',
            }),
            {
              requireAuth: true,
              redirectOnFail: '/login',
            }
          ),
        ],
        onFail: '/login',
      }),

      provideRouter(routes),
      provideHttpClient(withInterceptors([gatekeeperInterceptor])),
    ],
  });
}

/**
 * Example 3: Using Custom JWT Adapter
 */
export function exampleJWT() {
  bootstrapApplication(AppComponent, {
    providers: [
      // Register JWT adapter
      provideAdapters([
        new JWTAdapter({
          secret: 'your-jwt-secret',
          issuer: 'https://your-api.com',
          audience: 'your-audience',
          userMapper: (decoded) => ({
            id: decoded.sub as string,
            email: decoded.email as string,
            roles: (decoded.roles as string[]) || [],
          }),
        }),
      ]),

      // Create middleware using the adapter
      provideGatekeeper({
        middlewares: [
          createAdapterMiddleware(
            new JWTAdapter({
              secret: 'your-jwt-secret',
              issuer: 'https://your-api.com',
            }),
            {
              requireAuth: true,
              redirectOnFail: '/login',
              onError: (error, context) => {
                console.error('Authentication error:', error);
              },
              onSuccess: (user, context) => {
                console.log('User authenticated:', user.id);
              },
            }
          ),
        ],
        onFail: '/login',
      }),

      provideRouter(routes),
      provideHttpClient(withInterceptors([gatekeeperInterceptor])),
    ],
  });
}

/**
 * Example 4: Multiple Adapters (Fallback)
 */
export function exampleMultipleAdapters() {
  const auth0Adapter = new Auth0Adapter({
    domain: 'your-domain.auth0.com',
    clientId: 'your-client-id',
  });

  const jwtAdapter = new JWTAdapter({
    secret: 'your-jwt-secret',
  });

  bootstrapApplication(AppComponent, {
    providers: [
      // Register multiple adapters
      provideAdapters([auth0Adapter, jwtAdapter]),

      // Create middleware with fallback logic
      provideGatekeeper({
        middlewares: [
          // Try Auth0 first
          createAdapterMiddleware(auth0Adapter, {
            requireAuth: false, // Don't fail if Auth0 fails
          }),
          // Fallback to JWT
          createAdapterMiddleware(jwtAdapter, {
            requireAuth: true,
            redirectOnFail: '/login',
          }),
        ],
        onFail: '/login',
      }),

      provideRouter(routes),
      provideHttpClient(withInterceptors([gatekeeperInterceptor])),
    ],
  });
}

/**
 * Example 5: Using Adapter with Route Guards
 */
export const exampleRoutes = [
  {
    path: 'dashboard',
    canActivate: [gatekeeperGuard],
    loadComponent: () => import('./dashboard.component'),
    // Adapter middleware is automatically included via provideGatekeeper
  },
  {
    path: 'admin',
    canActivate: [gatekeeperGuard],
    loadComponent: () => import('./admin.component'),
    data: {
      gatekeeper: {
        // Additional middleware can be added at route level
        middlewares: [
          // Route-specific middleware
        ],
      },
    },
  },
];

