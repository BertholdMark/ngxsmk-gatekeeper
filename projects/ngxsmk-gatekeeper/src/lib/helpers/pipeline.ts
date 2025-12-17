import { NgxMiddleware } from '../core';

/**
 * A named pipeline of middleware functions
 */
export interface MiddlewarePipeline {
  /**
   * Name of the pipeline for identification and debugging
   */
  readonly pipelineName: string;
  /**
   * Array of middleware functions in this pipeline
   */
  readonly middlewares: NgxMiddleware[];
}

/**
 * Creates a reusable middleware pipeline with a name
 * 
 * Pipelines allow you to group and reuse middleware combinations.
 * They are tree-shakeable and can be used in routes and HTTP interception.
 * 
 * @param name - Name of the pipeline for identification and debugging
 * @param middlewares - Array of middleware functions to execute in order
 * @returns A pipeline object that can be used in GatekeeperConfig
 * 
 * @example
 * ```typescript
 * const adminPipeline = definePipeline('adminOnly', [
 *   authMiddleware,
 *   roleMiddleware({ roles: ['admin'] })
 * ]);
 * 
 * // Use in config
 * provideGatekeeper({
 *   middlewares: [adminPipeline],
 *   onFail: '/login'
 * });
 * ```
 */
export function definePipeline(
  name: string,
  middlewares: NgxMiddleware[]
): MiddlewarePipeline {
  if (!name || typeof name !== 'string') {
    throw new Error('Pipeline name must be a non-empty string');
  }
  if (!Array.isArray(middlewares)) {
    throw new Error('Pipeline middlewares must be an array');
  }

  const pipeline: MiddlewarePipeline = {
    pipelineName: name,
    middlewares: [...middlewares], // Create a copy to prevent mutation
  };

  // Freeze the pipeline to prevent modification
  Object.freeze(pipeline);
  Object.freeze(pipeline.middlewares);

  return pipeline;
}

/**
 * Checks if a value is a middleware pipeline
 */
export function isPipeline(
  value: NgxMiddleware | MiddlewarePipeline
): value is MiddlewarePipeline {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pipelineName' in value &&
    'middlewares' in value &&
    typeof (value as MiddlewarePipeline).pipelineName === 'string' &&
    Array.isArray((value as MiddlewarePipeline).middlewares)
  );
}

/**
 * Resolves middleware pipelines to flat array of middlewares
 * 
 * @param items - Array of middlewares and/or pipelines
 * @returns Flat array of middleware functions
 */
export function resolvePipelines(
  items: (NgxMiddleware | MiddlewarePipeline)[]
): NgxMiddleware[] {
  const resolved: NgxMiddleware[] = [];

  for (const item of items) {
    if (isPipeline(item)) {
      // Expand pipeline into its middlewares
      resolved.push(...item.middlewares);
    } else {
      // Add middleware directly
      resolved.push(item);
    }
  }

  return resolved;
}

