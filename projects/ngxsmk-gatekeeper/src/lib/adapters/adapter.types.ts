/**
 * Adapter API types for authentication providers
 * 
 * This API allows third-party adapters (Auth0, Firebase, etc.) to integrate
 * with ngxsmk-gatekeeper without the core having any knowledge of the adapter's implementation.
 * All adapters are open source and free to use.
 */

import { NgxMiddleware } from '../core';
import { MiddlewareContext } from '../core';

/**
 * Authentication result from an adapter
 */
export interface AuthResult {
  /**
   * Whether authentication was successful
   */
  authenticated: boolean;
  /**
   * User information (if authenticated)
   */
  user?: AuthUser;
  /**
   * Error message (if authentication failed)
   */
  error?: string;
  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Authenticated user information
 */
export interface AuthUser {
  /**
   * User identifier
   */
  id: string;
  /**
   * User email (optional)
   */
  email?: string;
  /**
   * User display name (optional)
   */
  name?: string;
  /**
   * User roles (optional)
   */
  roles?: string[];
  /**
   * User permissions (optional)
   */
  permissions?: string[];
  /**
   * Additional user metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Adapter configuration
 */
export interface AdapterConfig {
  /**
   * Adapter-specific configuration
   */
  [key: string]: unknown;
}

/**
 * Enterprise authentication adapter interface
 * 
 * Adapters implement this interface to integrate authentication providers
 * (Auth0, Firebase, Custom JWT, etc.) with ngxsmk-gatekeeper.
 * 
 * Adapters are distributed as separate packages and the core has zero
 * knowledge of their implementation.
 */
export interface AuthAdapter {
  /**
   * Unique identifier for the adapter
   * Should be in format: 'adapter-name' or '@vendor/adapter-name'
   */
  readonly id: string;
  /**
   * Human-readable name of the adapter
   */
  readonly name: string;
  /**
   * Version of the adapter
   */
  readonly version: string;
  /**
   * Optional description of the adapter
   */
  readonly description?: string;
  /**
   * Authenticates a request based on the middleware context
   * 
   * @param context - Middleware context containing request/route information
   * @returns Authentication result
   */
  authenticate(context: MiddlewareContext): AuthResult | Promise<AuthResult>;
  /**
   * Optional method to refresh authentication
   * 
   * @param context - Middleware context
   * @returns New authentication result
   */
  refresh?(context: MiddlewareContext): AuthResult | Promise<AuthResult>;
  /**
   * Optional method to logout/clear authentication
   * 
   * @param context - Middleware context
   */
  logout?(context: MiddlewareContext): void | Promise<void>;
  /**
   * Optional cleanup method called when adapter is unloaded
   */
  destroy?(): void | Promise<void>;
}

/**
 * Adapter middleware factory
 * 
 * Creates middleware that uses an adapter for authentication
 */
export interface AdapterMiddlewareFactory {
  /**
   * Creates authentication middleware using the adapter
   * 
   * @param adapter - Authentication adapter to use
   * @param options - Optional middleware configuration
   * @returns Middleware function
   */
  createMiddleware(
    adapter: AuthAdapter,
    options?: AdapterMiddlewareOptions
  ): NgxMiddleware;
}

/**
 * Options for adapter middleware
 */
export interface AdapterMiddlewareOptions {
  /**
   * Whether to require authentication (default: true)
   * If false, middleware allows unauthenticated users
   */
  requireAuth?: boolean;
  /**
   * Whether to refresh token automatically (default: false)
   */
  autoRefresh?: boolean;
  /**
   * Redirect path when authentication fails (optional)
   */
  redirectOnFail?: string;
  /**
   * Custom error handler
   */
  onError?: (error: string, context: MiddlewareContext) => void | Promise<void>;
  /**
   * Custom success handler
   */
  onSuccess?: (user: AuthUser, context: MiddlewareContext) => void | Promise<void>;
}

