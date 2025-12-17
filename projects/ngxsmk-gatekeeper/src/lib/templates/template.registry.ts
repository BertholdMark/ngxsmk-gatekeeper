/**
 * Template registry for managing configuration templates
 */

import { Injectable } from '@angular/core';
import {
  Template,
  TemplateRegistryEntry,
} from './template.types';
import { GatekeeperConfig } from '../angular/gatekeeper.config';

/**
 * Template registry service
 */
@Injectable({
  providedIn: 'root',
})
export class TemplateRegistry {
  private readonly templates = new Map<string, TemplateRegistryEntry>();

  /**
   * Registers a template
   *
   * @param template - Template to register
   */
  register(template: Template): void {
    if (this.templates.has(template.metadata.id)) {
      console.warn(`[TemplateRegistry] Template "${template.metadata.id}" is already registered. Overwriting.`);
    }

    this.templates.set(template.metadata.id, {
      id: template.metadata.id,
      template,
      registeredAt: Date.now(),
    });
  }

  /**
   * Gets a template by ID
   *
   * @param id - Template ID
   * @returns Template or null if not found
   */
  get(id: string): Template | null {
    const entry = this.templates.get(id);
    return entry?.template || null;
  }

  /**
   * Gets all registered templates
   *
   * @returns Array of all templates
   */
  getAll(): Template[] {
    return Array.from(this.templates.values()).map(entry => entry.template);
  }

  /**
   * Gets templates by category
   *
   * @param category - Template category
   * @returns Array of templates in category
   */
  getByCategory(category: Template['metadata']['category']): Template[] {
    return this.getAll().filter(t => t.metadata.category === category);
  }

  /**
   * Searches templates
   *
   * @param query - Search query
   * @returns Matching templates
   */
  search(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(t => {
      const name = t.metadata.name.toLowerCase();
      const description = t.metadata.description.toLowerCase();
      const tags = t.metadata.tags?.join(' ').toLowerCase() || '';
      return name.includes(lowerQuery) || description.includes(lowerQuery) || tags.includes(lowerQuery);
    });
  }

  /**
   * Creates configuration from template
   *
   * @param id - Template ID
   * @param options - Template options
   * @returns Configuration
   */
  async createConfig(
    id: string,
    options?: Record<string, unknown>
  ): Promise<GatekeeperConfig | null> {
    const template = this.get(id);
    if (!template) {
      return null;
    }

    return await template.factory(options);
  }

  /**
   * Unregisters a template
   *
   * @param id - Template ID
   */
  unregister(id: string): boolean {
    return this.templates.delete(id);
  }
}

