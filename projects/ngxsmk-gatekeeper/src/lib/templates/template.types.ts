/**
 * Template library types
 */

import { GatekeeperConfig } from '../angular/gatekeeper.config';

/**
 * Template category
 */
export enum TemplateCategory {
  Basic = 'basic',
  Enterprise = 'enterprise',
  SaaS = 'saas',
  ECommerce = 'ecommerce',
  Admin = 'admin',
  Public = 'public',
  API = 'api',
  Security = 'security',
  Compliance = 'compliance',
}

/**
 * Template metadata
 */
export interface TemplateMetadata {
  /**
   * Template ID
   */
  id: string;
  /**
   * Template name
   */
  name: string;
  /**
   * Template description
   */
  description: string;
  /**
   * Template category
   */
  category: TemplateCategory;
  /**
   * Tags for searching
   */
  tags?: string[];
  /**
   * Template version
   */
  version: string;
  /**
   * Author information
   */
  author?: string;
  /**
   * Usage examples
   */
  examples?: string[];
  /**
   * Required dependencies
   */
  dependencies?: string[];
  /**
   * Compatibility information
   */
  compatibility?: {
    ngxsmkGatekeeper?: string;
    angular?: string;
  };
}

/**
 * Template configuration
 */
export interface TemplateConfig extends GatekeeperConfig {
  /**
   * Template metadata
   */
  metadata: TemplateMetadata;
  /**
   * Template variables that can be customized
   */
  variables?: Record<string, unknown>;
}

/**
 * Template factory function
 */
export type TemplateFactory = (
  options?: Record<string, unknown>
) => GatekeeperConfig | Promise<GatekeeperConfig>;

/**
 * Template definition
 */
export interface Template {
  /**
   * Template metadata
   */
  metadata: TemplateMetadata;
  /**
   * Template factory function
   */
  factory: TemplateFactory;
}

/**
 * Template registry entry
 */
export interface TemplateRegistryEntry {
  /**
   * Template ID
   */
  id: string;
  /**
   * Template instance
   */
  template: Template;
  /**
   * Registration timestamp
   */
  registeredAt: number;
}

