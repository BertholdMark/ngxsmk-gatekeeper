/**
 * Example Plugin Implementation
 * 
 * This demonstrates how to create a plugin for ngxsmk-gatekeeper.
 * Plugins can be distributed as separate npm packages (including paid plugins).
 */

import { GatekeeperExtension, ExtensionContext } from 'ngxsmk-gatekeeper/lib/extensions';
import { NgxMiddleware } from 'ngxsmk-gatekeeper';
import { createMiddleware } from 'ngxsmk-gatekeeper/lib/helpers';

/**
 * Example plugin configuration
 */
export interface ExamplePluginConfig {
  /**
   * API key for the plugin service
   */
  apiKey: string;
  /**
   * Enable advanced features
   */
  enableAdvancedFeatures?: boolean;
  /**
   * Custom options
   */
  options?: Record<string, unknown>;
}

/**
 * Example plugin implementation
 * 
 * This plugin demonstrates:
 * - Implementing the GatekeeperExtension interface
 * - Registering middleware via extension context
 * - Reading configuration from gatekeeper config
 * - Providing plugin-specific functionality
 */
export class ExamplePlugin implements GatekeeperExtension {
  readonly id = 'example-plugin';
  readonly name = 'Example Plugin';
  readonly version = '1.0.0';
  readonly description = 'Example plugin demonstrating the plugin architecture';

  constructor(private config: ExamplePluginConfig) {
    if (!config.apiKey) {
      throw new Error('ExamplePlugin requires an apiKey');
    }
  }

  /**
   * Initialize the plugin and register middleware
   */
  async initialize(context: ExtensionContext): Promise<NgxMiddleware[]> {
    // Read configuration from gatekeeper config if needed
    const advancedFeatures = context.getConfig<boolean>('enableAdvancedFeatures') 
      ?? this.config.enableAdvancedFeatures 
      ?? false;

    const middlewares: NgxMiddleware[] = [];

    // Create authentication middleware
    const authMiddleware = createMiddleware('example-plugin-auth', async (ctx) => {
      // Plugin-specific authentication logic
      const user = ctx.user as { id?: string; token?: string } | undefined;

      if (!user?.id) {
        return false;
      }

      // Validate token with plugin service
      const isValid = await this.validateToken(user.token);
      if (!isValid) {
        return false;
      }

      return true;
    });

    // Register as pre-middleware (runs before user middleware)
    context.registerPreMiddleware(authMiddleware);
    middlewares.push(authMiddleware);

    // Create feature flag middleware (if advanced features enabled)
    if (advancedFeatures) {
      const featureMiddleware = createMiddleware('example-plugin-features', async (ctx) => {
        // Check feature flags
        const hasAccess = await this.checkFeatureAccess(ctx);
        return hasAccess;
      });

      // Register as merged middleware (runs with user middleware)
      context.registerMiddleware(featureMiddleware);
      middlewares.push(featureMiddleware);
    }

    // Create audit middleware (runs after user middleware)
    const auditMiddleware = createMiddleware('example-plugin-audit', async (ctx) => {
      // Log access attempt
      await this.logAccess(ctx);
      return true; // Always allow (audit only)
    });

    context.registerPostMiddleware(auditMiddleware);
    middlewares.push(auditMiddleware);

    return middlewares;
  }

  /**
   * Cleanup when plugin is unloaded
   */
  async destroy(): Promise<void> {
    // Cleanup resources
    // Close connections, clear timers, etc.
    console.log(`[${this.id}] Plugin destroyed`);
  }

  /**
   * Validate user token (plugin-specific implementation)
   */
  private async validateToken(token: string | undefined): Promise<boolean> {
    if (!token) {
      return false;
    }

    // Plugin-specific validation logic
    // In a real plugin, this would call an API
    try {
      // Example: Call plugin service
      // const response = await fetch(`https://api.example.com/validate?token=${token}&key=${this.config.apiKey}`);
      // return response.ok;
      
      // For example purposes, just check if token exists
      return token.length > 0;
    } catch (error) {
      console.error(`[${this.id}] Token validation error:`, error);
      return false;
    }
  }

  /**
   * Check feature access (plugin-specific implementation)
   */
  private async checkFeatureAccess(ctx: unknown): Promise<boolean> {
    // Plugin-specific feature check logic
    // In a real plugin, this would check feature flags, permissions, etc.
    return true;
  }

  /**
   * Log access attempt (plugin-specific implementation)
   */
  private async logAccess(ctx: unknown): Promise<void> {
    // Plugin-specific audit logging
    // In a real plugin, this would send logs to a service
    console.log(`[${this.id}] Access logged:`, ctx);
  }
}

/**
 * Usage example:
 * 
 * ```typescript
 * import { provideGatekeeper } from 'ngxsmk-gatekeeper';
 * import { provideExtensions } from 'ngxsmk-gatekeeper/lib/extensions';
 * import { ExamplePlugin } from './example-plugin';
 * 
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideGatekeeper({
 *       middlewares: [/* user middleware *\/],
 *       onFail: '/login',
 *     }),
 *     provideExtensions([
 *       new ExamplePlugin({
 *         apiKey: 'your-api-key',
 *         enableAdvancedFeatures: true,
 *       }),
 *     ]),
 *   ],
 * });
 * ```
 */

