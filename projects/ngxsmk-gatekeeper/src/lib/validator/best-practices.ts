/**
 * Best practices validation
 */

import { GatekeeperConfig } from '../angular/gatekeeper.config';
import { ValidationIssue, ValidationSeverity, ValidationCategory } from './validator.types';

/**
 * Checks configuration against best practices
 *
 * @param config - Configuration to check
 * @returns Array of best practice issues
 */
export function checkBestPractices(config: GatekeeperConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for empty middlewares array
  if (config.middlewares.length === 0 && !config.zeroTrust) {
    issues.push({
      severity: ValidationSeverity.Warning,
      category: ValidationCategory.BestPractice,
      code: 'EMPTY_MIDDLEWARES',
      message: 'No middlewares configured. Consider adding at least authentication middleware',
      path: 'middlewares',
      suggestion: 'Add authentication middleware or enable zero trust mode',
    });
  }

  // Check for debug mode in development
  const isDevelopment = typeof process !== 'undefined' && process.env?.['NODE_ENV'] !== 'production';
  if (isDevelopment && !config.debug) {
    issues.push({
      severity: ValidationSeverity.Info,
      category: ValidationCategory.BestPractice,
      code: 'DEBUG_RECOMMENDED_DEV',
      message: 'Consider enabling debug mode in development for better visibility',
      path: 'debug',
      suggestion: 'Set debug: true in development',
    });
  }

  // Check for benchmark in production
  const isProduction = typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production';
  if (isProduction && !config.benchmark?.enabled) {
    issues.push({
      severity: ValidationSeverity.Info,
      category: ValidationCategory.BestPractice,
      code: 'BENCHMARK_RECOMMENDED_PROD',
      message: 'Consider enabling benchmark mode in production to monitor performance',
      path: 'benchmark',
      suggestion: 'Add benchmark: { enabled: true } to monitor middleware performance',
    });
  }

  // Check for compliance mode in enterprise
  if (config.middlewares.length > 5 && !config.compliance?.enabled) {
    issues.push({
      severity: ValidationSeverity.Info,
      category: ValidationCategory.BestPractice,
      code: 'COMPLIANCE_RECOMMENDED',
      message: 'Consider enabling compliance mode for complex middleware chains',
      path: 'compliance',
      suggestion: 'Enable compliance mode for audit trails and compliance reporting',
    });
  }

  // Check for onFail path
  if (config.onFail === '/login' && config.middlewares.length === 0) {
    issues.push({
      severity: ValidationSeverity.Warning,
      category: ValidationCategory.BestPractice,
      code: 'DEFAULT_ON_FAIL',
      message: 'Using default onFail path without authentication middleware',
      path: 'onFail',
      suggestion: 'Ensure /login route exists or configure appropriate redirect',
    });
  }

  return issues;
}

