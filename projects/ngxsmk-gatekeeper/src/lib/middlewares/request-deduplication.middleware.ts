import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Deduplication record
 */
interface DedupRecord {
  timestamp: number;
  count: number;
}

/**
 * In-memory deduplication store (in production, use Redis)
 */
const dedupStore = new Map<string, DedupRecord>();

/**
 * Configuration options for request deduplication middleware
 */
export interface RequestDeduplicationMiddlewareOptions {
  /**
   * Time window in milliseconds
   * Default: 1000 (1 second)
   */
  window?: number;
  /**
   * Function to generate deduplication key from request
   * Default: uses method + URL
   */
  keyGenerator?: (context: MiddlewareContext) => string;
  /**
   * Maximum number of duplicate requests allowed in window
   * Default: 1
   */
  maxDuplicates?: number;
  /**
   * Custom storage for deduplication records (optional)
   */
  storage?: {
    get: (key: string) => DedupRecord | undefined | Promise<DedupRecord | undefined>;
    set: (key: string, value: DedupRecord) => void | Promise<void>;
    delete: (key: string) => void | Promise<void>;
  };
  /**
   * Redirect URL when duplicate detected
   */
  redirect?: string;
  /**
   * Custom message when duplicate detected
   */
  message?: string;
}

/**
 * Creates middleware that prevents duplicate requests within a time window
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const dedupMiddleware = createRequestDeduplicationMiddleware({
 *   window: 1000, // 1 second
 *   maxDuplicates: 1,
 *   keyGenerator: (ctx) => `${ctx.request?.method}:${ctx.request?.url}`
 * });
 * ```
 */
export function createRequestDeduplicationMiddleware(
  options: RequestDeduplicationMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    window = 1000,
    keyGenerator = (context) => {
      const request = context['request'] as HttpRequest<unknown> | undefined;
      if (request) {
        return `${request.method}:${request.url}`;
      }
      return `${context['path'] || context['url'] || 'unknown'}`;
    },
    maxDuplicates = 1,
    storage,
    redirect,
    message = 'Duplicate request detected',
  } = options;

  const getRecord = async (key: string): Promise<DedupRecord | undefined> => {
    if (storage) {
      return await storage.get(key);
    }
    return dedupStore.get(key);
  };

  const setRecord = async (key: string, record: DedupRecord): Promise<void> => {
    if (storage) {
      await storage.set(key, record);
    } else {
      dedupStore.set(key, record);
    }
  };

  const deleteRecord = async (key: string): Promise<void> => {
    if (storage) {
      await storage.delete(key);
    } else {
      dedupStore.delete(key);
    }
  };

  return createMiddleware('request-deduplication', async (context: MiddlewareContext) => {
    const key = keyGenerator(context);
    const now = Date.now();
    let record = await getRecord(key);

    // Clean up old records
    if (record && now - record.timestamp > window) {
      await deleteRecord(key);
      record = undefined;
    }

    if (!record) {
      // First request, create record
      await setRecord(key, {
        timestamp: now,
        count: 1,
      });
      return true;
    }

    // Increment count
    record.count++;

    // Check if exceeds max duplicates
    if (record.count > maxDuplicates) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: message,
        };
      }
      return false;
    }

    // Update record
    await setRecord(key, record);
    return true;
  });
}

