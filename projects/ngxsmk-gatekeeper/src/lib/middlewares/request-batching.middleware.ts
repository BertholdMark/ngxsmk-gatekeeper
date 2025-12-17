import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * Batched request
 */
interface BatchedRequest {
  context: MiddlewareContext;
  resolve: (value: boolean | { allow: boolean; redirect?: string; reason?: string }) => void;
  reject: (error: unknown) => void;
}

/**
 * Configuration options for request batching middleware
 */
export interface RequestBatchingMiddlewareOptions {
  /**
   * Batch window in milliseconds
   * Default: 100
   */
  batchWindow?: number;
  /**
   * Maximum batch size
   * Default: 10
   */
  maxBatchSize?: number;
  /**
   * Function to determine if requests can be combined
   */
  canCombine?: (req1: MiddlewareContext, req2: MiddlewareContext) => boolean;
  /**
   * Function to combine requests
   */
  combineRequests?: (requests: MiddlewareContext[]) => MiddlewareContext;
  /**
   * Function to split combined result back to individual results
   */
  splitResult?: (combinedResult: boolean | { allow: boolean }, requests: MiddlewareContext[]) => Array<boolean | { allow: boolean; redirect?: string; reason?: string }>;
}

/**
 * Creates middleware that batches requests together
 *
 * @param options - Configuration options
 * @returns Middleware function
 */
export function createRequestBatchingMiddleware(
  options: RequestBatchingMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    batchWindow = 100,
    maxBatchSize = 10,
    combineRequests = (requests) => requests[0]!, // Default: use first request
    splitResult = (result, requests) => requests.map(() => result), // Default: apply same result to all
  } = options;

  const batchQueue: BatchedRequest[] = [];
  let batchTimer: ReturnType<typeof setTimeout> | null = null;

  const processBatch = async (): Promise<void> => {
    if (batchQueue.length === 0) {
      return;
    }

    const batch = batchQueue.splice(0, maxBatchSize);
    const contexts = batch.map(b => b.context);

    try {
      combineRequests(contexts);
      const combinedResult = true;
      
      // Split result
      const results = splitResult(combinedResult, contexts);

      // Resolve all promises
      batch.forEach((b, index) => {
        b.resolve(results[index] || true);
      });
    } catch (error) {
      // Reject all promises on error
      batch.forEach(b => b.reject(error));
    }

    // Process next batch if queue not empty
    if (batchQueue.length > 0) {
      batchTimer = setTimeout(processBatch, batchWindow);
    } else {
      batchTimer = null;
    }
  };

  return createMiddleware('request-batching', (context: MiddlewareContext) => {
    return new Promise((resolve, reject) => {
      batchQueue.push({ context, resolve, reject });

      if (!batchTimer) {
        batchTimer = setTimeout(processBatch, batchWindow);
      }

      // Process immediately if batch is full
      if (batchQueue.length >= maxBatchSize) {
        if (batchTimer) {
          clearTimeout(batchTimer);
          batchTimer = null;
        }
        processBatch();
      }
    });
  });
}

