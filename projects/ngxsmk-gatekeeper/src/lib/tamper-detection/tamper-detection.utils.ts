/**
 * Tamper detection utilities
 */

import {
  TamperDetectionConfig,
  TamperDetectionResult,
  TamperIssue,
} from './tamper-detection.types';

/**
 * Execution order tracker
 */
class ExecutionOrderTracker {
  private static instance: ExecutionOrderTracker | null = null;
  private executionHistory: Array<{ type: 'guard' | 'interceptor'; timestamp: number; path: string }> = [];
  private readonly maxHistorySize = 100;

  static getInstance(): ExecutionOrderTracker {
    if (!ExecutionOrderTracker.instance) {
      ExecutionOrderTracker.instance = new ExecutionOrderTracker();
    }
    return ExecutionOrderTracker.instance;
  }

  record(type: 'guard' | 'interceptor', path: string): void {
    this.executionHistory.push({
      type,
      timestamp: Date.now(),
      path,
    });

    // Keep only recent history
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }
  }

  getRecentExecutions(count: number = 10): Array<{ type: 'guard' | 'interceptor'; timestamp: number; path: string }> {
    return this.executionHistory.slice(-count);
  }

  clear(): void {
    this.executionHistory = [];
  }
}

/**
 * Checks if gatekeeper provider is missing
 * 
 * Note: This check is performed by the guard/interceptor before calling detectTampering.
 * If the provider is missing, an error is thrown. This function is a placeholder
 * for future checks that might be needed.
 */
function checkMissingProvider(config: TamperDetectionConfig, hasProvider: boolean): TamperIssue | null {
  if (!config.checkMissingProvider) {
    return null;
  }

  if (!hasProvider) {
    return {
      type: 'missing-provider',
      message: 'Gatekeeper provider (GATEKEEPER_CONFIG) is missing. This may indicate tampering or misconfiguration.',
      severity: 'error',
    };
  }

  return null;
}

/**
 * Checks for disabled interceptors
 * 
 * Note: This is a best-effort check. In a real application, interceptors can be
 * disabled in various ways that are difficult to detect from within the interceptor itself.
 */
function checkDisabledInterceptors(config: TamperDetectionConfig): TamperIssue | null {
  if (!config.checkDisabledInterceptors) {
    return null;
  }

  // This is a placeholder check - in practice, detecting disabled interceptors
  // from within the interceptor is difficult. We can check if the interceptor
  // is being called, but if it's not called, we won't be able to detect it.
  
  // A more sophisticated approach would involve:
  // 1. Setting a flag when the interceptor is registered
  // 2. Checking that flag periodically
  // 3. Monitoring HTTP requests that bypass the interceptor
  
  // For now, we'll rely on the fact that if the interceptor is called,
  // it means it's at least partially working. If it's not called, we can't detect it.
  
  return null;
}

/**
 * Checks for unexpected execution order
 */
function checkExecutionOrder(
  config: TamperDetectionConfig,
  currentType: 'guard' | 'interceptor',
  currentPath: string,
  expectedOrder?: string[]
): TamperIssue | null {
  if (!config.checkExecutionOrder) {
    return null;
  }

  const tracker = ExecutionOrderTracker.getInstance();
  tracker.record(currentType, currentPath);

  // Check expected order if provided
  if (expectedOrder && expectedOrder.length > 0) {
    const recent = tracker.getRecentExecutions(expectedOrder.length);
    const recentTypes = recent.map(e => e.type);
    
    // Simple check: ensure guards execute before interceptors for the same path
    // This is a basic heuristic - more sophisticated checks can be added
    const hasGuard = recentTypes.includes('guard');
    const hasInterceptor = recentTypes.includes('interceptor');
    
    if (hasGuard && hasInterceptor && currentType === 'interceptor') {
      // Check if guard executed before interceptor for similar paths
      const guardExecution = recent.find(e => e.type === 'guard');
      const interceptorExecution = recent.find(e => e.type === 'interceptor');
      
      if (guardExecution && interceptorExecution) {
        // If interceptor executed before guard, that's unexpected
        if (interceptorExecution.timestamp < guardExecution.timestamp) {
          return {
            type: 'execution-order',
            message: `Unexpected execution order detected: interceptor executed before guard for path "${currentPath}". This may indicate tampering.`,
            severity: 'warning',
          };
        }
      }
    }
  }

  return null;
}

/**
 * Performs tamper detection checks
 * 
 * @param config - Tamper detection configuration
 * @param context - Execution context (guard or interceptor)
 * @param hasProvider - Whether the gatekeeper provider is available (checked by caller)
 */
export function detectTampering(
  config: TamperDetectionConfig,
  context: { type: 'guard' | 'interceptor'; path: string },
  hasProvider: boolean = true
): TamperDetectionResult {
  if (!config.enabled) {
    return { tampered: false, issues: [] };
  }

  const issues: TamperIssue[] = [];

  // Check for missing provider
  const providerIssue = checkMissingProvider(config, hasProvider);
  if (providerIssue) {
    issues.push(providerIssue);
  }

  // Check for disabled interceptors
  const interceptorIssue = checkDisabledInterceptors(config);
  if (interceptorIssue) {
    issues.push(interceptorIssue);
  }

  // Check execution order
  const orderIssue = checkExecutionOrder(
    config,
    context.type,
    context.path,
    config.expectedOrder
  );
  if (orderIssue) {
    issues.push(orderIssue);
  }

  return {
    tampered: issues.length > 0,
    issues,
  };
}

/**
 * Logs tamper detection issues
 */
export function logTamperIssues(
  result: TamperDetectionResult,
  strict: boolean
): void {
  if (!result.tampered || result.issues.length === 0) {
    return;
  }

  const isDevelopment = typeof process !== 'undefined' && process.env?.['NODE_ENV'] !== 'production';

  for (const issue of result.issues) {
    const logMethod = issue.severity === 'error' ? console.error : console.warn;
    const prefix = strict ? '[TAMPER DETECTED - BLOCKED]' : '[TAMPER DETECTED - WARNING]';
    
    if (isDevelopment || issue.severity === 'error') {
      logMethod(`${prefix} ${issue.type}: ${issue.message}`);
    }
  }
}

/**
 * Gets execution order tracker instance
 */
export function getExecutionOrderTracker(): ExecutionOrderTracker {
  return ExecutionOrderTracker.getInstance();
}

