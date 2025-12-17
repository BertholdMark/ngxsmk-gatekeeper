import { createMiddleware } from '../helpers';
import { MiddlewareContext, NgxMiddleware } from '../core';

/**
 * Circuit breaker state
 */
enum CircuitState {
  Closed = 'closed',
  Open = 'open',
  HalfOpen = 'half-open',
}

/**
 * Circuit breaker record
 */
interface CircuitRecord {
  state: CircuitState;
  failures: number;
  lastFailure: number;
  successes: number;
}

/**
 * In-memory circuit breaker store (in production, use Redis)
 */
const circuitStore = new Map<string, CircuitRecord>();

/**
 * Configuration options for circuit breaker middleware
 */
export interface CircuitBreakerMiddlewareOptions {
  /**
   * Name/identifier for the circuit breaker
   */
  name: string;
  /**
   * Middleware to protect with circuit breaker
   */
  middleware: NgxMiddleware;
  /**
   * Failure threshold before opening circuit
   * Default: 5
   */
  failureThreshold?: number;
  /**
   * Timeout in milliseconds before attempting to close circuit
   * Default: 60000 (1 minute)
   */
  timeout?: number;
  /**
   * Success threshold in half-open state before closing
   * Default: 2
   */
  successThreshold?: number;
  /**
   * Fallback function when circuit is open
   */
  fallback?: (context: MiddlewareContext) => boolean | Promise<boolean>;
  /**
   * Custom storage for circuit records (optional)
   */
  storage?: {
    get: (key: string) => CircuitRecord | undefined | Promise<CircuitRecord | undefined>;
    set: (key: string, value: CircuitRecord) => void | Promise<void>;
  };
}

/**
 * Creates middleware that implements circuit breaker pattern
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const circuitBreakerMiddleware = createCircuitBreakerMiddleware({
 *   name: 'external-api',
 *   middleware: externalAPIMiddleware,
 *   failureThreshold: 5,
 *   timeout: 60000,
 *   fallback: () => false
 * });
 * ```
 */
export function createCircuitBreakerMiddleware(
  options: CircuitBreakerMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    name,
    middleware,
    failureThreshold = 5,
    timeout = 60000,
    successThreshold = 2,
    fallback,
    storage,
  } = options;

  const getRecord = async (key: string): Promise<CircuitRecord | undefined> => {
    if (storage) {
      return await storage.get(key);
    }
    return circuitStore.get(key);
  };

  const setRecord = async (key: string, record: CircuitRecord): Promise<void> => {
    if (storage) {
      await storage.set(key, record);
    } else {
      circuitStore.set(key, record);
    }
  };

  return createMiddleware(`circuit-breaker:${name}`, (async (context: MiddlewareContext) => {
    const key = `circuit:${name}`;
    const now = Date.now();
    let record = await getRecord(key);

    if (!record) {
      record = {
        state: CircuitState.Closed,
        failures: 0,
        lastFailure: 0,
        successes: 0,
      };
    }

    // Check if circuit should transition from open to half-open
    if (record.state === CircuitState.Open) {
      if (now - record.lastFailure > timeout) {
        record.state = CircuitState.HalfOpen;
        record.successes = 0;
        await setRecord(key, record);
      } else {
        // Circuit is open, use fallback
        if (fallback) {
          return await Promise.resolve(fallback(context));
        }
        return false;
      }
    }

    // Execute middleware
    try {
      const result = await Promise.resolve(middleware(context));
      const resultValue = typeof result === 'object' && 'allow' in result ? result.allow : result;
      const success = resultValue === true;

      if (success) {
        // Reset failures on success
        if (record.state === CircuitState.HalfOpen) {
          record.successes++;
          if (record.successes >= successThreshold) {
            record.state = CircuitState.Closed;
            record.failures = 0;
          }
        } else {
          record.failures = 0;
        }
        await setRecord(key, record);
        return result;
      } else {
        // Middleware failed
        record.failures++;
        record.lastFailure = now;

        if (record.failures >= failureThreshold) {
          record.state = CircuitState.Open;
        }

        await setRecord(key, record);
        return result;
      }
    } catch (error) {
      // Exception occurred
      record.failures++;
      record.lastFailure = now;

      if (record.failures >= failureThreshold) {
        record.state = CircuitState.Open;
      }

      await setRecord(key, record);

      // Use fallback on error
      if (fallback) {
        return await Promise.resolve(fallback(context));
      }
      throw error;
    }
  }) as any);
}

