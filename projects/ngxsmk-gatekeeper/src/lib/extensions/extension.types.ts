/**
 * Extension API types for plugin architecture
 * 
 * This API allows third-party plugins (including paid plugins) to register
 * middleware without the core having any knowledge of the plugin's implementation.
 */

import { NgxMiddleware } from '../core';
import { MiddlewarePipeline } from '../helpers';

/**
 * Extension point for plugins to register middleware
 * 
 * Plugins implement this interface to register their middleware with the core.
 * The core has zero knowledge of what the plugin does - it only knows that
 * the plugin provides middleware.
 */
export interface GatekeeperExtension {
  /**
   * Unique identifier for the extension
   * Should be in format: 'plugin-name' or '@vendor/plugin-name'
   */
  readonly id: string;
  /**
   * Human-readable name of the extension
   */
  readonly name: string;
  /**
   * Version of the extension
   */
  readonly version: string;
  /**
   * Optional description of what the extension provides
   */
  readonly description?: string;
  /**
   * Initializes the extension and returns middleware to register
   * 
   * This method is called when the extension is loaded.
   * It should return the middleware that the extension wants to register.
   * 
   * @param context - Extension context with access to core APIs
   * @returns Middleware or pipeline to register, or empty array if none
   */
  initialize(context: ExtensionContext): (NgxMiddleware | MiddlewarePipeline)[] | Promise<(NgxMiddleware | MiddlewarePipeline)[]>;
  /**
   * Optional cleanup method called when extension is unloaded
   */
  destroy?(): void | Promise<void>;
}

/**
 * Extension context provided to plugins during initialization
 * 
 * This gives plugins access to core APIs they need, without exposing
 * internal implementation details.
 */
export interface ExtensionContext {
  /**
   * Gets a value from the gatekeeper configuration
   * Plugins can use this to read configuration values
   */
  getConfig<T = unknown>(key: string): T | undefined;
  /**
   * Gets the full gatekeeper configuration
   * Plugins can use this to read the entire configuration
   */
  getFullConfig(): Record<string, unknown>;
  /**
   * Registers middleware that will be executed before user-configured middleware
   * Use this for middleware that should run early (e.g., authentication)
   */
  registerPreMiddleware(...middlewares: (NgxMiddleware | MiddlewarePipeline)[]): void;
  /**
   * Registers middleware that will be executed after user-configured middleware
   * Use this for middleware that should run late (e.g., logging, cleanup)
   */
  registerPostMiddleware(...middlewares: (NgxMiddleware | MiddlewarePipeline)[]): void;
  /**
   * Registers middleware that will be merged with user-configured middleware
   * Use this for middleware that should be part of the main chain
   */
  registerMiddleware(...middlewares: (NgxMiddleware | MiddlewarePipeline)[]): void;
}

/**
 * Extension registration result
 */
export interface ExtensionRegistration {
  /**
   * Extension that was registered
   */
  extension: GatekeeperExtension;
  /**
   * Whether registration was successful
   */
  success: boolean;
  /**
   * Error message if registration failed
   */
  error?: string;
  /**
   * Middleware that was registered
   */
  registeredMiddleware: (NgxMiddleware | MiddlewarePipeline)[];
}

