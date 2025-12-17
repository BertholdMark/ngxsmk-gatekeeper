/**
 * Adapter registry for managing authentication adapters
 * 
 * This registry is internal to the core and manages adapter registration.
 * Adapters register themselves via the adapter API, but the core doesn't
 * know what they do - it only manages their middleware.
 */

import { Injectable } from '@angular/core';
import { AuthAdapter } from './adapter.types';

/**
 * Adapter registry service
 * 
 * Manages adapter registration and provides access to registered adapters.
 * This service is internal to the core and has no knowledge of what adapters do.
 */
@Injectable({
  providedIn: 'root',
})
export class AdapterRegistry {
  private readonly adapters = new Map<string, AuthAdapter>();

  /**
   * Registers an adapter
   * 
   * @param adapter - Adapter to register
   * @returns Whether registration was successful
   */
  register(adapter: AuthAdapter): boolean {
    if (this.adapters.has(adapter.id)) {
      console.warn(`[AdapterRegistry] Adapter with id "${adapter.id}" is already registered`);
      return false;
    }

    this.adapters.set(adapter.id, adapter);
    return true;
  }

  /**
   * Unregisters an adapter
   * 
   * @param adapterId - ID of adapter to unregister
   * @returns Whether unregistration was successful
   */
  async unregister(adapterId: string): Promise<boolean> {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      return false;
    }

    try {
      // Call destroy if available
      if (adapter.destroy) {
        await adapter.destroy();
      }

      // Remove from registry
      this.adapters.delete(adapterId);
      return true;
    } catch (error) {
      console.error(`[AdapterRegistry] Error unregistering adapter "${adapterId}":`, error);
      return false;
    }
  }

  /**
   * Gets a registered adapter by ID
   * 
   * @param adapterId - ID of adapter to get
   * @returns Adapter or undefined if not found
   */
  get(adapterId: string): AuthAdapter | undefined {
    return this.adapters.get(adapterId);
  }

  /**
   * Gets all registered adapters
   * 
   * @returns Array of registered adapters
   */
  getAll(): AuthAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Checks if an adapter is registered
   * 
   * @param adapterId - ID of adapter to check
   * @returns Whether adapter is registered
   */
  has(adapterId: string): boolean {
    return this.adapters.has(adapterId);
  }
}

