import { InjectionToken, Provider } from '@angular/core';
import { DefaultPolicyRegistry } from './policy.registry';
import { Policy, PolicyRegistry } from './policy.types';

/**
 * Re-export PolicyRegistry type for convenience
 */
export type { PolicyRegistry };

/**
 * Injection token for Policy Registry
 * 
 * Provides access to the policy registry via dependency injection.
 * Defaults to DefaultPolicyRegistry if not explicitly provided.
 */
export const POLICY_REGISTRY = new InjectionToken<PolicyRegistry>(
  'POLICY_REGISTRY',
  {
    providedIn: 'root',
    factory: () => new DefaultPolicyRegistry(),
  }
);

/**
 * Provides a policy registry with optional initial policies
 * 
 * @param policies - Optional array of policies to register initially
 * @param customRegistry - Optional custom policy registry implementation
 * @returns Provider configuration
 * 
 * @example
 * ```typescript
 * // Use default registry with initial policies
 * providePolicyRegistry([
 *   policy('canAccessBilling', (ctx) => ctx.user?.subscription?.tier === 'premium'),
 *   policy('isAdmin', (ctx) => ctx.user?.roles?.includes('admin')),
 * ])
 * 
 * // Use custom registry
 * providePolicyRegistry([], MyCustomPolicyRegistry)
 * 
 * // Register policies later
 * const registry = inject(POLICY_REGISTRY);
 * registry.register(policy('canEdit', (ctx) => ...));
 * ```
 */
export function providePolicyRegistry(
  policies?: Policy[],
  customRegistry?: new () => PolicyRegistry
): Provider {
  return {
    provide: POLICY_REGISTRY,
    useFactory: () => {
      const registry = customRegistry ? new customRegistry() : new DefaultPolicyRegistry();
      
      // Register initial policies if provided
      if (policies && policies.length > 0) {
        for (const policy of policies) {
          registry.register(policy);
        }
      }
      
      return registry;
    },
  };
}

