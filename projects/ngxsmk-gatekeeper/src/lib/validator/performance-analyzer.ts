/**
 * Performance analysis for configuration
 */

import { GatekeeperConfig } from '../angular/gatekeeper.config';
import { NgxMiddleware, PrioritizedMiddleware } from '../core';
import { MiddlewarePipeline, isPipeline } from '../helpers';
import { ValidationIssue, ValidationSeverity, ValidationCategory, PerformanceAnalysis } from './validator.types';

/**
 * Analyzes configuration for performance issues
 *
 * @param config - Configuration to analyze
 * @param options - Validator options
 * @returns Performance analysis
 */
export function analyzePerformance(
  config: GatekeeperConfig,
  options: { maxMiddlewareCount?: number; maxExecutionTime?: number } = {}
): PerformanceAnalysis {
  const issues: ValidationIssue[] = [];
  const bottlenecks: Array<{ middleware: string; estimatedTime: number; reason: string }> = [];
  
  const maxMiddlewareCount = options.maxMiddlewareCount ?? 10;
  const maxExecutionTime = options.maxExecutionTime ?? 100; // ms

  // Count middlewares
  const middlewareCount = countMiddlewares(config.middlewares);
  let estimatedExecutionTime = 0;

  // Analyze middleware chain
  config.middlewares.forEach((item, index) => {
    const path = `middlewares[${index}]`;
    let middlewareName = `Middleware[${index}]`;
    let middlewares: NgxMiddleware[] = [];

    if (isPipeline(item)) {
      middlewareName = item.pipelineName;
      middlewares = item.middlewares;
    } else {
      middlewares = [item];
      const named = item as PrioritizedMiddleware;
      if ('middlewareName' in named && typeof (named as any).middlewareName === 'string') {
        middlewareName = (named as any).middlewareName;
      }
    }

    // Estimate execution time based on middleware type
    middlewares.forEach((mw, mwIndex) => {
      const mwName = (mw as any).middlewareName || `${middlewareName}[${mwIndex}]`;
      const estimatedTime = estimateMiddlewareTime(mw, mwName);
      estimatedExecutionTime += estimatedTime;

      // Check for potential bottlenecks
      if (estimatedTime > 50) {
        bottlenecks.push({
          middleware: mwName,
          estimatedTime,
          reason: 'Potentially slow middleware (estimated > 50ms)',
        });

        issues.push({
          severity: ValidationSeverity.Warning,
          category: ValidationCategory.Performance,
          code: 'SLOW_MIDDLEWARE',
          message: `Middleware "${mwName}" may be slow (estimated ${estimatedTime}ms)`,
          path: `${path}${isPipeline(item) ? `.middlewares[${mwIndex}]` : ''}`,
          suggestion: 'Consider optimizing this middleware or using caching',
        });
      }
    });
  });

  // Check middleware count
  if (middlewareCount > maxMiddlewareCount) {
    issues.push({
      severity: ValidationSeverity.Warning,
      category: ValidationCategory.Performance,
      code: 'TOO_MANY_MIDDLEWARES',
      message: `Configuration has ${middlewareCount} middlewares, which may impact performance`,
      path: 'middlewares',
      suggestion: `Consider reducing to ${maxMiddlewareCount} or fewer middlewares, or use pipelines to group related middleware`,
    });
  }

  // Check estimated execution time
  if (estimatedExecutionTime > maxExecutionTime) {
    issues.push({
      severity: ValidationSeverity.Warning,
      category: ValidationCategory.Performance,
      code: 'SLOW_CHAIN',
      message: `Estimated execution time (${estimatedExecutionTime}ms) exceeds recommended maximum (${maxExecutionTime}ms)`,
      path: 'middlewares',
      suggestion: 'Consider optimizing middleware chain or enabling caching',
    });
  }

  // Check for missing benchmark configuration
  if (!config.benchmark?.enabled && middlewareCount > 5) {
    issues.push({
      severity: ValidationSeverity.Info,
      category: ValidationCategory.Performance,
      code: 'BENCHMARK_RECOMMENDED',
      message: 'Consider enabling benchmark mode to monitor middleware performance',
      path: 'benchmark',
      suggestion: 'Add benchmark: { enabled: true } to your configuration',
    });
  }

  // Calculate performance score (0-100)
  let score = 100;
  if (middlewareCount > maxMiddlewareCount) {
    score -= 20;
  }
  if (estimatedExecutionTime > maxExecutionTime) {
    score -= 30;
  }
  if (bottlenecks.length > 0) {
    score -= bottlenecks.length * 10;
  }
  score = Math.max(0, score);

  return {
    middlewareCount,
    estimatedExecutionTime: Math.round(estimatedExecutionTime),
    score,
    recommendations: issues,
    bottlenecks,
  };
}

/**
 * Counts total number of middlewares (including pipelines)
 */
function countMiddlewares(
  items: (NgxMiddleware | MiddlewarePipeline)[]
): number {
  let count = 0;
  for (const item of items) {
    if (isPipeline(item)) {
      count += item.middlewares.length;
    } else {
      count += 1;
    }
  }
  return count;
}

/**
 * Estimates execution time for a middleware
 */
function estimateMiddlewareTime(_middleware: NgxMiddleware, name: string): number {
  // Base time estimate
  let estimated = 5; // Default 5ms

  // Adjust based on middleware name patterns
  const lowerName = name.toLowerCase();

  // Auth-related middleware (usually fast)
  if (lowerName.includes('auth')) {
    estimated = 2;
  }
  // Role/permission checks (usually fast)
  else if (lowerName.includes('role') || lowerName.includes('permission')) {
    estimated = 3;
  }
  // Network calls (usually slow)
  else if (lowerName.includes('api') || lowerName.includes('http') || lowerName.includes('remote')) {
    estimated = 50;
  }
  // Database operations (usually slow)
  else if (lowerName.includes('db') || lowerName.includes('database') || lowerName.includes('query')) {
    estimated = 30;
  }
  // Cache operations (usually fast)
  else if (lowerName.includes('cache')) {
    estimated = 1;
  }
  // Analytics/logging (usually fast)
  else if (lowerName.includes('analytics') || lowerName.includes('log')) {
    estimated = 2;
  }
  // Validation (usually fast)
  else if (lowerName.includes('valid') || lowerName.includes('check')) {
    estimated = 3;
  }
  // Encryption/decryption (moderate)
  else if (lowerName.includes('encrypt') || lowerName.includes('decrypt') || lowerName.includes('crypto')) {
    estimated = 10;
  }
  // Complex operations (slow)
  else if (lowerName.includes('complex') || lowerName.includes('heavy') || lowerName.includes('process')) {
    estimated = 40;
  }

  return estimated;
}

