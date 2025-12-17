import { Routes } from '@angular/router';
import { gatekeeperGuard } from 'ngxsmk-gatekeeper';
import { exampleAuthMiddleware } from './example-middleware';

/**
 * Example routes with gatekeeper protection
 * 
 * This file demonstrates how to protect routes using ngxsmk-gatekeeper.
 * 
 * To use:
 * 1. Import this in your app routing module or standalone routes
 * 2. Merge with your existing routes
 * 3. Update the middleware to match your authentication logic
 */
export const exampleRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [exampleAuthMiddleware],
      },
    },
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [exampleAuthMiddleware],
      },
    },
  },
];

