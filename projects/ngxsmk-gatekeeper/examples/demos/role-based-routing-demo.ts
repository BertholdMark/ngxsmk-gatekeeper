/**
 * Role-Based Routing Demo
 * 
 * This is a complete, copy-paste ready example demonstrating role-based
 * access control with ngxsmk-gatekeeper.
 * 
 * To use this demo:
 * 1. Copy this file to your Angular project
 * 2. Install ngxsmk-gatekeeper: npm install ngxsmk-gatekeeper
 * 3. Update imports to match your project structure
 * 4. Add your components
 */

import { Component, inject, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink, RouterOutlet, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideGatekeeper, gatekeeperGuard, definePipeline } from 'ngxsmk-gatekeeper';
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
  mode: 'any', // User must have at least one of the roles
});

// Moderator middleware - requires 'moderator' or 'admin' role
const moderatorMiddleware = createRoleMiddleware({
  roles: ['moderator', 'admin'],
  mode: 'any',
});

// ============================================================================
// STEP 2: Create Pipelines (Reusable Middleware Groups)
// ============================================================================

// Admin-only pipeline: requires authentication AND admin role
const adminPipeline = definePipeline('adminOnly', [
  authMiddleware,
  adminMiddleware,
]);

// Moderator pipeline: requires authentication AND (moderator OR admin) role
const moderatorPipeline = definePipeline('moderatorOnly', [
  authMiddleware,
  moderatorMiddleware,
]);

// User pipeline: requires authentication only
const userPipeline = definePipeline('userOnly', [
  authMiddleware,
]);

// ============================================================================
// STEP 3: Define Routes with Role-Based Protection
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
    canActivate: [gatekeeperGuard],
    // Uses global authMiddleware (any authenticated user)
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [adminPipeline], // Override: requires admin role
        onFail: '/unauthorized',
      },
    },
  },
  {
    path: 'moderator',
    component: ModeratorComponent,
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [moderatorPipeline], // Requires moderator or admin role
        onFail: '/unauthorized',
      },
    },
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
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
    // Configure Gatekeeper with global middleware
    provideGatekeeper({
      middlewares: [authMiddleware], // Global: require authentication for all routes
      onFail: '/login',
      debug: true, // Enable debug logging
    }),

    // Router configuration
    provideRouter(routes),

    // HTTP client
    provideHttpClient(),
  ],
});

// ============================================================================
// IMPORTANT: Provide User Context with Roles
// ============================================================================

/**
 * In a real application, you need to provide user context with roles to the middleware.
 * The middleware checks for user.roles array in the context.
 * 
 * Example user context structure:
 * 
 * ```typescript
 * {
 *   user: {
 *     isAuthenticated: true,
 *     roles: ['admin', 'user'], // Array of user roles
 *   }
 * }
 * ```
 * 
 * For this demo to work, you would need to:
 * 1. Create an authentication service that provides user data
 * 2. Modify guards/interceptors to inject user context
 * 3. Or use a custom guard that adds user context before calling gatekeeperGuard
 * 
 * See the plugin architecture documentation for advanced patterns.
 */

