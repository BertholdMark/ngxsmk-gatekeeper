import { Injectable } from '@angular/core';
import { Policy, PolicyRegistry } from './policy.types';

/**
 * Re-export PolicyRegistry type for convenience
 */
export type { PolicyRegistry };

/**
 * Default policy registry implementation
 * 
 * Stores policies in memory and provides access via dependency injection.
 */
@Injectable({
  providedIn: 'root',
})
export class DefaultPolicyRegistry implements PolicyRegistry {
  private readonly policies = new Map<string, Policy>();

  /**
   * Registers a policy
   */
  register(policy: Policy): void {
    if (!policy.name || typeof policy.name !== 'string') {
      throw new Error('Policy name must be a non-empty string');
    }
    if (typeof policy.evaluator !== 'function') {
      throw new Error('Policy evaluator must be a function');
    }
    
    this.policies.set(policy.name, policy);
  }

  /**
   * Gets a policy by name
   */
  get(name: string): Policy | undefined {
    return this.policies.get(name);
  }

  /**
   * Checks if a policy exists
   */
  has(name: string): boolean {
    return this.policies.has(name);
  }

  /**
   * Gets all registered policies
   */
  getAll(): Policy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Removes a policy
   */
  remove(name: string): boolean {
    return this.policies.delete(name);
  }

  /**
   * Clears all policies
   */
  clear(): void {
    this.policies.clear();
  }
}

