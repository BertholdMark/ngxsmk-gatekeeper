import { firstValueFrom } from 'rxjs';
import { createMiddleware } from '../helpers';
import { MiddlewareContext, MiddlewareResponse } from '../core';
import { PolicyRegistry } from './policy.types';

/**
 * Configuration options for policy middleware
 */
export interface PolicyMiddlewareOptions {
  /**
   * Name of the policy to evaluate
   */
  policyName: string;
  /**
   * Optional policy registry (if not provided, will be retrieved from context)
   */
  registry?: PolicyRegistry;
  /**
   * Optional redirect path when policy evaluation fails
   */
  redirect?: string;
  /**
   * Optional custom error message when policy fails
   */
  errorMessage?: string;
}

/**
 * Creates a middleware that evaluates a policy by name
 * 
 * The policy is resolved from the PolicyRegistry. The registry can be:
 * 1. Passed directly in options
 * 2. Retrieved from context.policyRegistry (injected by guards/interceptors)
 * 
 * If the policy is not found, the middleware will fail (return false).
 * 
 * @param options - Configuration options for the policy middleware
 * @returns A middleware function that evaluates the policy
 * 
 * @example
 * ```typescript
 * // Register a policy first
 * const billingPolicy = policy('canAccessBilling', (ctx) => {
 *   return ctx.user?.subscription?.tier === 'premium';
 * });
 * 
 * // Provide the policy registry
 * const registry = inject(POLICY_REGISTRY);
 * registry.register(billingPolicy);
 * 
 * // Use in middleware (registry will be injected via context)
 * const billingMiddleware = createPolicyMiddleware({
 *   policyName: 'canAccessBilling',
 *   redirect: '/upgrade'
 * });
 * 
 * // Or pass registry directly
 * const billingMiddleware = createPolicyMiddleware({
 *   policyName: 'canAccessBilling',
 *   registry: inject(POLICY_REGISTRY),
 *   redirect: '/upgrade'
 * });
 * 
 * // Use in GatekeeperConfig
 * provideGatekeeper({
 *   middlewares: [billingMiddleware],
 *   onFail: '/login'
 * });
 * ```
 */
export function createPolicyMiddleware(
  options: PolicyMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const { policyName, registry: providedRegistry, redirect, errorMessage } = options;

  return createMiddleware(`policy:${policyName}`, async (context: MiddlewareContext) => {
    // Get policy registry from options or context
    const registry = providedRegistry || (context['policyRegistry'] as PolicyRegistry | undefined);
    
    if (!registry) {
      console.error(
        `Policy middleware "${policyName}": PolicyRegistry not found. ` +
        `Make sure to provide a PolicyRegistry using providePolicyRegistry() ` +
        `and that guards/interceptors inject it into context.`
      );
      if (redirect) {
        return { allow: false, redirect } as MiddlewareResponse;
      }
      return false;
    }

    // Get policy from registry
    const policy = registry.get(policyName);
    
    if (!policy) {
      console.error(
        `Policy middleware "${policyName}": Policy not found in registry. ` +
        `Make sure to register the policy using registry.register(policy).`
      );
      if (redirect) {
        return { allow: false, redirect } as MiddlewareResponse;
      }
      return false;
    }

    // Evaluate the policy
    try {
      let result: boolean;
      const evaluationResult = policy.evaluator(context);

      // Handle synchronous boolean
      if (typeof evaluationResult === 'boolean') {
        result = evaluationResult;
      }
      // Handle Promise<boolean>
      else if (evaluationResult instanceof Promise) {
        result = await evaluationResult;
      }
      // Handle Observable<boolean>
      else if (evaluationResult && typeof evaluationResult.subscribe === 'function') {
        result = await firstValueFrom(evaluationResult);
      }
      // Fallback
      else {
        result = Boolean(evaluationResult);
      }

      if (!result) {
        if (errorMessage) {
          console.warn(`Policy "${policyName}" failed: ${errorMessage}`);
        }
        if (redirect) {
          return { allow: false, redirect } as MiddlewareResponse;
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error evaluating policy "${policyName}":`, error);
      if (redirect) {
        return { allow: false, redirect } as MiddlewareResponse;
      }
      return false;
    }
  });
}

