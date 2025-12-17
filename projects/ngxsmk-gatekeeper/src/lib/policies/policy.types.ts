import { MiddlewareContext } from '../core';

/**
 * Policy evaluator function that determines if a policy allows access
 * 
 * @param context - Middleware context containing route/request information
 * @returns boolean, Promise<boolean>, or Observable<boolean>
 */
export type PolicyEvaluator = (
  context: MiddlewareContext
) => boolean | Promise<boolean> | import('rxjs').Observable<boolean>;

/**
 * Policy definition
 */
export interface Policy {
  /**
   * Unique name of the policy
   */
  readonly name: string;
  /**
   * Evaluator function that determines if the policy allows access
   */
  readonly evaluator: PolicyEvaluator;
  /**
   * Optional description of what the policy checks
   */
  readonly description?: string;
}

/**
 * Policy registry interface for managing policies
 */
export interface PolicyRegistry {
  /**
   * Registers a policy
   */
  register(policy: Policy): void;
  /**
   * Gets a policy by name
   */
  get(name: string): Policy | undefined;
  /**
   * Checks if a policy exists
   */
  has(name: string): boolean;
  /**
   * Gets all registered policies
   */
  getAll(): Policy[];
  /**
   * Removes a policy
   */
  remove(name: string): boolean;
  /**
   * Clears all policies
   */
  clear(): void;
}

