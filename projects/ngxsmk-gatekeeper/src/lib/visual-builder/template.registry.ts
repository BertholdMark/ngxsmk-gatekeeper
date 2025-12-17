/**
 * Template registry for visual builder
 * 
 * Provides middleware templates that can be used in the visual builder
 */

import { MiddlewareTemplate } from './visual-builder.types';
import { NgxMiddleware } from '../core';
import {
  createAuthMiddleware,
  createRoleMiddleware,
  createFeatureFlagMiddleware,
  createRateLimitMiddleware,
  createIPWhitelistMiddleware,
  createIPBlacklistMiddleware,
  createCSRFMiddleware,
  createSessionMiddleware,
  createAPIKeyMiddleware,
} from '../middlewares';

/**
 * Create default middleware templates
 */
export function createDefaultTemplates(): MiddlewareTemplate[] {
  return [
    // Authentication
    {
      id: 'auth',
      name: 'Authentication',
      description: 'Check if user is authenticated',
      category: 'Authentication',
      icon: 'lock',
      color: '#2196f3',
      factory: (config) =>
        createAuthMiddleware({
          authPath: (config?.['authPath'] as string) || 'user.isAuthenticated',
        }),
      configSchema: {
        authPath: {
          type: 'string',
          label: 'Auth Path',
          description: 'Path to check authentication status',
          default: 'user.isAuthenticated',
          required: true,
        },
      },
    },

    // Role-based access
    {
      id: 'role',
      name: 'Role Check',
      description: 'Check if user has required roles',
      category: 'Access Control',
      icon: 'shield',
      color: '#4caf50',
      factory: (config) =>
        createRoleMiddleware({
          roles: (config?.['roles'] as string[]) || [],
          mode: (config?.['mode'] as 'any' | 'all') || 'any',
        }),
      configSchema: {
        roles: {
          type: 'array',
          label: 'Roles',
          description: 'Required roles',
          default: [],
          required: true,
        },
        mode: {
          type: 'string',
          label: 'Mode',
          description: 'Require any or all roles',
          default: 'any',
          options: ['any', 'all'],
          required: false,
        },
      },
    },

    // Feature flag
    {
      id: 'feature-flag',
      name: 'Feature Flag',
      description: 'Check if feature is enabled',
      category: 'Feature Control',
      icon: 'flag',
      color: '#ff9800',
      factory: (config) =>
        createFeatureFlagMiddleware({
          flagName: (config?.['flag'] as string) || '',
        }),
      configSchema: {
        flag: {
          type: 'string',
          label: 'Feature Flag',
          description: 'Feature flag name',
          default: '',
          required: true,
        },
      },
    },

    // Rate limiting
    {
      id: 'rate-limit',
      name: 'Rate Limit',
      description: 'Limit request rate',
      category: 'Performance',
      icon: 'speed',
      color: '#9c27b0',
      factory: (config) =>
        createRateLimitMiddleware({
          maxRequests: (config?.['maxRequests'] as number) || 100,
          windowMs: (config?.['windowMs'] as number) || 60000,
        }),
      configSchema: {
        maxRequests: {
          type: 'number',
          label: 'Max Requests',
          description: 'Maximum number of requests',
          default: 100,
          required: true,
        },
        windowMs: {
          type: 'number',
          label: 'Window (ms)',
          description: 'Time window in milliseconds',
          default: 60000,
          required: true,
        },
      },
    },

    // IP Whitelist
    {
      id: 'ip-whitelist',
      name: 'IP Whitelist',
      description: 'Allow only specific IP addresses',
      category: 'Security',
      icon: 'check-circle',
      color: '#4caf50',
      factory: (config) =>
        createIPWhitelistMiddleware({
          allowedIPs: (config?.['allowedIPs'] as string[]) || [],
        }),
      configSchema: {
        allowedIPs: {
          type: 'array',
          label: 'Allowed IPs',
          description: 'List of allowed IP addresses',
          default: [],
          required: true,
        },
      },
    },

    // IP Blacklist
    {
      id: 'ip-blacklist',
      name: 'IP Blacklist',
      description: 'Block specific IP addresses',
      category: 'Security',
      icon: 'block',
      color: '#f44336',
      factory: (config) =>
        createIPBlacklistMiddleware({
          blockedIPs: (config?.['blockedIPs'] as string[]) || [],
        }),
      configSchema: {
        blockedIPs: {
          type: 'array',
          label: 'Blocked IPs',
          description: 'List of blocked IP addresses',
          default: [],
          required: true,
        },
      },
    },

    // CSRF Protection
    {
      id: 'csrf',
      name: 'CSRF Protection',
      description: 'Protect against CSRF attacks',
      category: 'Security',
      icon: 'security',
      color: '#ff5722',
      factory: (config) =>
        createCSRFMiddleware({
          tokenHeader: (config?.['tokenHeader'] as string) || 'X-CSRF-Token',
        }),
      configSchema: {
        tokenHeader: {
          type: 'string',
          label: 'Token Header',
          description: 'CSRF token header name',
          default: 'X-CSRF-Token',
          required: false,
        },
      },
    },

    // Session Management
    {
      id: 'session',
      name: 'Session Management',
      description: 'Manage user sessions',
      category: 'Security',
      icon: 'account-circle',
      color: '#607d8b',
      factory: (config) => {
        const timeoutMs = (config?.['timeoutMs'] as number) || 3600000;
        return createSessionMiddleware({
          timeout: Math.floor(timeoutMs / 1000), // Convert to seconds
        });
      },
      configSchema: {
        timeoutMs: {
          type: 'number',
          label: 'Timeout (ms)',
          description: 'Session timeout in milliseconds',
          default: 3600000,
          required: false,
        },
      },
    },

    // API Key
    {
      id: 'api-key',
      name: 'API Key',
      description: 'Validate API keys',
      category: 'Security',
      icon: 'vpn-key',
      color: '#795548',
      factory: (config) =>
        createAPIKeyMiddleware({
          headerName: (config?.['apiKeyHeader'] as string) || 'X-API-Key',
          validKeys: (config?.['validKeys'] as string[]) || [],
          validateKey: () => true, // Will use validKeys instead
        }),
      configSchema: {
        apiKeyHeader: {
          type: 'string',
          label: 'API Key Header',
          description: 'Header name for API key',
          default: 'X-API-Key',
          required: false,
        },
        validKeys: {
          type: 'array',
          label: 'Valid Keys',
          description: 'List of valid API keys',
          default: [],
          required: true,
        },
      },
    },
  ];
}

/**
 * Template registry class
 */
export class TemplateRegistry {
  private templates: Map<string, MiddlewareTemplate> = new Map();

  constructor(templates: MiddlewareTemplate[] = []) {
    templates.forEach((template) => {
      this.register(template);
    });
  }

  /**
   * Register a template
   */
  register(template: MiddlewareTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get a template by ID
   */
  get(id: string): MiddlewareTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get all templates
   */
  getAll(): MiddlewareTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getByCategory(category: string): MiddlewareTemplate[] {
    return this.getAll().filter((t) => t.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.getAll().forEach((t) => {
      categories.add(t.category);
    });
    return Array.from(categories);
  }

  /**
   * Create middleware from template
   */
  createMiddleware(templateId: string, config?: Record<string, unknown>): NgxMiddleware | null {
    const template = this.get(templateId);
    if (!template) {
      return null;
    }

    try {
      return template.factory(config);
    } catch (error) {
      console.error(`Failed to create middleware from template ${templateId}:`, error);
      return null;
    }
  }
}

/**
 * Create default template registry
 */
export function createDefaultTemplateRegistry(): TemplateRegistry {
  return new TemplateRegistry(createDefaultTemplates());
}

