import { Policy, PolicyEvaluator } from './policy.types';

/**
 * Creates a policy definition
 * 
 * Policies are reusable business rules that can be referenced by name in middleware.
 * They support synchronous, Promise-based, and Observable-based evaluation.
 * 
 * @param name - Unique name for the policy (e.g., 'canAccessBilling', 'canEditPost')
 * @param evaluator - Function that evaluates the policy given a context
 * @param description - Optional description of what the policy checks
 * @returns Policy definition object
 * 
 * @example
 * ```typescript
 * // Simple boolean policy
 * const billingPolicy = policy('canAccessBilling', (ctx) => {
 *   return ctx.user?.subscription?.tier === 'premium';
 * });
 * 
 * // Async policy
 * const adminPolicy = policy('isAdmin', async (ctx) => {
 *   const user = await userService.getUser(ctx.user?.id);
 *   return user?.roles?.includes('admin') ?? false;
 * });
 * 
 * // Observable-based policy
 * const featurePolicy = policy('hasFeature', (ctx) => {
 *   return featureService.checkFeature(ctx.featureName).pipe(
 *     map(result => result.enabled)
 *   );
 * });
 * ```
 */
export function policy(
  name: string,
  evaluator: PolicyEvaluator,
  description?: string
): Policy {
  if (!name || typeof name !== 'string') {
    throw new Error('Policy name must be a non-empty string');
  }
  if (typeof evaluator !== 'function') {
    throw new Error('Policy evaluator must be a function');
  }

  const policyDef: Policy = {
    name,
    evaluator,
    ...(description && { description }),
  };

  // Freeze the policy to prevent modification
  Object.freeze(policyDef);

  return policyDef;
}

