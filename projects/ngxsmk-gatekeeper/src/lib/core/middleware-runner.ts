import { Observable, firstValueFrom } from 'rxjs';
import {
  NgxMiddleware,
  MiddlewareContext,
  MiddlewareResult,
  MiddlewareResponse,
} from './middleware.types';
import {
  DebugOptions,
  logChainStart,
  logChainEnd,
  logMiddlewareStart,
  logMiddlewareEnd,
} from './debug';
import {
  attachDebugHook,
  recordMiddlewareExecution,
  recordChainExecution,
} from './debug-hook';
import {
  initializeBenchmarkIfEnabled,
  recordMiddlewareBenchmark,
  recordChainBenchmark,
  BenchmarkConfig,
} from './benchmark';
import { ComplianceConfig } from '../compliance/compliance.types';
import {
  createExecutionTrace,
  createDecisionRationale,
} from '../compliance/compliance.logger';

/**
 * Runs a chain of middleware functions sequentially.
 * Stops execution on the first middleware that returns false.
 *
 * @param middlewares - Array of middleware functions to execute
 * @param context - Context object to pass to each middleware
 * @param debugOptions - Optional debug configuration
 * @param benchmarkConfig - Optional benchmark configuration
 * @returns Promise that resolves to the final result
 */
export interface MiddlewareChainResult extends MiddlewareResult {
  /**
   * Execution trace for compliance logging (if compliance mode is enabled)
   */
  executionTrace?: import('../compliance/compliance.types').ComplianceExecutionTrace;
  /**
   * Decision rationale for compliance logging (if compliance mode is enabled)
   */
  decisionRationale?: import('../compliance/compliance.types').ComplianceDecisionRationale;
}

export async function runMiddlewareChain(
  middlewares: NgxMiddleware[],
  context: MiddlewareContext,
  debugOptions?: DebugOptions,
  benchmarkConfig?: BenchmarkConfig,
  complianceConfig?: ComplianceConfig
): Promise<MiddlewareChainResult> {
  // Initialize benchmark if enabled
  if (benchmarkConfig?.enabled) {
    initializeBenchmarkIfEnabled(benchmarkConfig);
  }

  // Attach debug hook if in development mode
  if (debugOptions?.enabled) {
    attachDebugHook();
  }

  // Use performance.now() if available, fallback to Date.now() for SSR compatibility
  const getTime = typeof performance !== 'undefined' && performance.now
    ? () => performance.now()
    : () => Date.now();
  const chainStartTime = (debugOptions?.enabled || complianceConfig?.enabled) ? getTime() : 0;
  
  // Generate chain ID for compliance tracking
  const chainId = complianceConfig?.enabled
    ? `chain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    : undefined;

  // Track middleware executions for debug hook
  const middlewareExecutions: Array<{
    middleware: NgxMiddleware;
    index: number;
    startTime: number;
    endTime: number;
    result: boolean;
    error?: unknown;
  }> = [];

  if (debugOptions?.enabled) {
    logChainStart(debugOptions);
  }

  if (!middlewares || middlewares.length === 0) {
    const result: MiddlewareChainResult = { result: true, stoppedAt: -1 };
    if (debugOptions?.enabled) {
      const totalTime = getTime() - chainStartTime;
      logChainEnd(debugOptions, result, totalTime);
    }
    if (complianceConfig?.enabled && chainId) {
      const endTime = getTime();
      result.executionTrace = createExecutionTrace(chainId, chainStartTime, endTime, []);
      result.decisionRationale = createDecisionRationale(result, []);
    }
    return result;
  }

  for (let i = 0; i < middlewares.length; i++) {
    const middleware = middlewares[i];
    if (!middleware) {
      continue; // Skip undefined entries
    }
    
    let startTime = 0;
    if (debugOptions?.enabled) {
      startTime = logMiddlewareStart(debugOptions, middleware, i);
    }

    let middlewareResult: boolean | MiddlewareResponse;
    let error: unknown;

    try {
      const result = middleware(context);

      // Handle synchronous boolean or MiddlewareResponse
      if (typeof result === 'boolean' || (typeof result === 'object' && result !== null && 'allow' in result)) {
        middlewareResult = result as boolean | MiddlewareResponse;
      }
      // Handle Promise<boolean | MiddlewareResponse>
      else if (result instanceof Promise) {
        middlewareResult = await result;
      }
      // Handle Observable<boolean | MiddlewareResponse>
      else if (result && typeof result.subscribe === 'function') {
        middlewareResult = await firstValueFrom(
          result as Observable<boolean | MiddlewareResponse>
        );
      }
      // Fallback for unexpected types
      else {
        middlewareResult = Boolean(result);
      }
    } catch (err) {
      error = err;
      middlewareResult = false;
    }

    // Extract allow status and redirect from result
    let allowResult: boolean;
    let redirect: string | undefined;

    if (typeof middlewareResult === 'boolean') {
      allowResult = middlewareResult;
    } else if (
      typeof middlewareResult === 'object' &&
      middlewareResult !== null &&
      'allow' in middlewareResult
    ) {
      allowResult = middlewareResult.allow;
      redirect = middlewareResult.redirect;
    } else {
      allowResult = Boolean(middlewareResult);
    }

    const endTime = getTime();
    const duration = endTime - startTime;
    
    // Record benchmark if enabled
    if (benchmarkConfig?.enabled) {
      recordMiddlewareBenchmark(benchmarkConfig, middleware, i, duration);
    }
    
    if (debugOptions?.enabled) {
      logMiddlewareEnd(debugOptions, middleware, i, startTime, allowResult, error);
      recordMiddlewareExecution(
        debugOptions,
        middleware,
        i,
        startTime,
        endTime,
        allowResult,
        error
      );
    }

    // Track execution for chain record
    middlewareExecutions.push({
      middleware,
      index: i,
      startTime,
      endTime,
      result: allowResult,
      error,
    });

    // Stop execution on first false
    if (!allowResult) {
      const finalResult: MiddlewareChainResult = {
        result: false,
        stoppedAt: i,
        ...(redirect && { redirect }),
      };
      const totalTime = getTime() - chainStartTime;
      
      // Record benchmark if enabled
      if (benchmarkConfig?.enabled && debugOptions) {
        const middlewareTimes = middlewareExecutions.map(me => ({
          middleware: me.middleware,
          index: me.index,
          time: me.endTime - me.startTime,
        }));
        recordChainBenchmark(benchmarkConfig, debugOptions, totalTime, middlewareTimes);
      }
      
      if (debugOptions?.enabled) {
        logChainEnd(debugOptions, finalResult, totalTime);
        
        // Record chain execution - executions are already recorded individually
        recordChainExecution(debugOptions, finalResult, totalTime, []);
      }
      
      // Generate compliance trace and rationale
      if (complianceConfig?.enabled && chainId) {
        const endTime = getTime();
        finalResult.executionTrace = createExecutionTrace(chainId, chainStartTime, endTime, middlewareExecutions);
        finalResult.decisionRationale = createDecisionRationale(finalResult, middlewareExecutions);
      }
      
      return finalResult;
    }
  }

  // All middlewares passed
  const result: MiddlewareChainResult = { result: true, stoppedAt: -1 };
  const totalTime = getTime() - chainStartTime;
  
  // Record benchmark if enabled
  if (benchmarkConfig?.enabled && debugOptions) {
    const middlewareTimes = middlewareExecutions.map(me => ({
      middleware: me.middleware,
      index: me.index,
      time: me.endTime - me.startTime,
    }));
    recordChainBenchmark(benchmarkConfig, debugOptions, totalTime, middlewareTimes);
  }
  
  if (debugOptions?.enabled) {
    logChainEnd(debugOptions, result, totalTime);
    
    // Record chain execution - executions are already recorded individually
    recordChainExecution(debugOptions, result, totalTime, []);
  }
  
  // Generate compliance trace and rationale
  if (complianceConfig?.enabled && chainId) {
    const endTime = getTime();
    result.executionTrace = createExecutionTrace(chainId, chainStartTime, endTime, middlewareExecutions);
    result.decisionRationale = createDecisionRationale(result, middlewareExecutions);
  }
  
  return result;
}

