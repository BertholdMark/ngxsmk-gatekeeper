/**
 * Type checking for configuration
 */

import { GatekeeperConfig } from '../angular/gatekeeper.config';
import { MiddlewarePipeline } from '../helpers';
import { ValidationIssue, ValidationSeverity, ValidationCategory } from './validator.types';

/**
 * Type checks the configuration
 *
 * @param config - Configuration to check
 * @returns Array of type validation issues
 */
export function typeCheckConfig(config: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check if config is an object
  if (!config || typeof config !== 'object') {
    issues.push({
      severity: ValidationSeverity.Error,
      category: ValidationCategory.Type,
      code: 'CONFIG_NOT_OBJECT',
      message: 'Configuration must be an object',
      path: '',
    });
    return issues;
  }

  const gatekeeperConfig = config as Partial<GatekeeperConfig>;

  // Check middlewares
  if (!('middlewares' in gatekeeperConfig)) {
    issues.push({
      severity: ValidationSeverity.Error,
      category: ValidationCategory.Type,
      code: 'MISSING_MIDDLEWARES',
      message: 'Configuration must include "middlewares" array',
      path: 'middlewares',
      suggestion: 'Add a middlewares array to your configuration',
    });
  } else if (!Array.isArray(gatekeeperConfig.middlewares)) {
    issues.push({
      severity: ValidationSeverity.Error,
      category: ValidationCategory.Type,
      code: 'MIDDLEWARES_NOT_ARRAY',
      message: '"middlewares" must be an array',
      path: 'middlewares',
      suggestion: 'Change middlewares to an array',
    });
  } else {
    // Validate each middleware
    gatekeeperConfig.middlewares.forEach((middleware, index) => {
      const path = `middlewares[${index}]`;

      if (typeof middleware !== 'function' && typeof middleware !== 'object') {
        issues.push({
          severity: ValidationSeverity.Error,
          category: ValidationCategory.Type,
          code: 'INVALID_MIDDLEWARE',
          message: `Middleware at index ${index} is not a function or pipeline object`,
          path,
          suggestion: 'Ensure middleware is a function or pipeline object',
        });
      } else if (typeof middleware === 'object' && middleware !== null) {
        // Check if it's a valid pipeline
        const pipeline = middleware as Partial<MiddlewarePipeline>;
        if (!('pipelineName' in pipeline) || !('middlewares' in pipeline)) {
          issues.push({
            severity: ValidationSeverity.Error,
            category: ValidationCategory.Type,
            code: 'INVALID_PIPELINE',
            message: `Object at index ${index} is not a valid pipeline`,
            path,
            suggestion: 'Use definePipeline() to create pipelines',
          });
        } else if (!Array.isArray(pipeline.middlewares)) {
          issues.push({
            severity: ValidationSeverity.Error,
            category: ValidationCategory.Type,
            code: 'PIPELINE_MIDDLEWARES_NOT_ARRAY',
            message: `Pipeline at index ${index} has invalid middlewares array`,
            path: `${path}.middlewares`,
            suggestion: 'Pipeline middlewares must be an array',
          });
        }
      }
    });
  }

  // Check onFail
  if (!('onFail' in gatekeeperConfig)) {
    issues.push({
      severity: ValidationSeverity.Error,
      category: ValidationCategory.Type,
      code: 'MISSING_ON_FAIL',
      message: 'Configuration must include "onFail" redirect path',
      path: 'onFail',
      suggestion: 'Add an onFail redirect path (e.g., "/login")',
    });
  } else if (typeof gatekeeperConfig.onFail !== 'string') {
    issues.push({
      severity: ValidationSeverity.Error,
      category: ValidationCategory.Type,
      code: 'ON_FAIL_NOT_STRING',
      message: '"onFail" must be a string',
      path: 'onFail',
      suggestion: 'Change onFail to a string path',
    });
  } else if (!gatekeeperConfig.onFail.startsWith('/') && !gatekeeperConfig.onFail.startsWith('http')) {
    issues.push({
      severity: ValidationSeverity.Warning,
      category: ValidationCategory.Configuration,
      code: 'ON_FAIL_INVALID_FORMAT',
      message: '"onFail" should start with "/" or "http"',
      path: 'onFail',
      suggestion: 'Use an absolute path (e.g., "/login") or full URL',
    });
  }

  // Check debug
  if ('debug' in gatekeeperConfig && typeof gatekeeperConfig.debug !== 'boolean') {
    issues.push({
      severity: ValidationSeverity.Error,
      category: ValidationCategory.Type,
      code: 'DEBUG_NOT_BOOLEAN',
      message: '"debug" must be a boolean',
      path: 'debug',
      suggestion: 'Change debug to true or false',
    });
  }

  // Check benchmark
  if ('benchmark' in gatekeeperConfig && gatekeeperConfig.benchmark !== undefined) {
    if (typeof gatekeeperConfig.benchmark !== 'object' || gatekeeperConfig.benchmark === null) {
      issues.push({
        severity: ValidationSeverity.Error,
        category: ValidationCategory.Type,
        code: 'BENCHMARK_NOT_OBJECT',
        message: '"benchmark" must be an object',
        path: 'benchmark',
        suggestion: 'Provide a benchmark configuration object',
      });
    } else {
      const benchmark = gatekeeperConfig.benchmark as any;
      if ('enabled' in benchmark && typeof benchmark.enabled !== 'boolean') {
        issues.push({
          severity: ValidationSeverity.Error,
          category: ValidationCategory.Type,
          code: 'BENCHMARK_ENABLED_NOT_BOOLEAN',
          message: '"benchmark.enabled" must be a boolean',
          path: 'benchmark.enabled',
          suggestion: 'Change benchmark.enabled to true or false',
        });
      }
    }
  }

  // Check audit
  if ('audit' in gatekeeperConfig && gatekeeperConfig.audit !== undefined) {
    if (typeof gatekeeperConfig.audit !== 'object' || gatekeeperConfig.audit === null) {
      issues.push({
        severity: ValidationSeverity.Error,
        category: ValidationCategory.Type,
        code: 'AUDIT_NOT_OBJECT',
        message: '"audit" must be an object',
        path: 'audit',
        suggestion: 'Provide an audit configuration object',
      });
    }
  }

  // Check zeroTrust
  if ('zeroTrust' in gatekeeperConfig && typeof gatekeeperConfig.zeroTrust !== 'boolean') {
    issues.push({
      severity: ValidationSeverity.Error,
      category: ValidationCategory.Type,
      code: 'ZERO_TRUST_NOT_BOOLEAN',
      message: '"zeroTrust" must be a boolean',
      path: 'zeroTrust',
      suggestion: 'Change zeroTrust to true or false',
    });
  }

  // Check compliance
  if ('compliance' in gatekeeperConfig && gatekeeperConfig.compliance !== undefined) {
    if (typeof gatekeeperConfig.compliance !== 'object' || gatekeeperConfig.compliance === null) {
      issues.push({
        severity: ValidationSeverity.Error,
        category: ValidationCategory.Type,
        code: 'COMPLIANCE_NOT_OBJECT',
        message: '"compliance" must be an object',
        path: 'compliance',
        suggestion: 'Provide a compliance configuration object',
      });
    }
  }

  return issues;
}

