/**
 * Configuration validator
 */

import { Injectable } from '@angular/core';
import { GatekeeperConfig } from '../angular/gatekeeper.config';
import {
  ValidationResult,
  ValidationIssue,
  ValidationSeverity,
  ValidationCategory,
  ValidatorOptions,
} from './validator.types';
import { typeCheckConfig } from './type-checker';
import { analyzePerformance } from './performance-analyzer';
import { analyzeSecurity } from './security-analyzer';
import { checkBestPractices } from './best-practices';

/**
 * Configuration validator service
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigValidator {

  /**
   * Validates configuration
   *
   * @param config - Configuration to validate
   * @param options - Validation options
   * @returns Validation result
   */
  validate(
    config: unknown,
    options: ValidatorOptions = {}
  ): ValidationResult {
    const defaultOptions: Required<ValidatorOptions> = {
      checkTypes: true,
      checkPerformance: true,
      checkSecurity: true,
      checkBestPractices: true,
      maxMiddlewareCount: 10,
      maxExecutionTime: 100,
      requireAuth: true,
      requireAuditInProduction: false,
    };

    const opts = { ...defaultOptions, ...options };
    const allIssues: ValidationIssue[] = [];

    // Type checking
    if (opts.checkTypes) {
      const typeIssues = typeCheckConfig(config);
      allIssues.push(...typeIssues);
    }

    // If type checking failed, don't continue with other checks
    const typeErrors = allIssues.filter(i => i.severity === ValidationSeverity.Error);
    if (typeErrors.length > 0) {
      return this.createResult(allIssues);
    }

    // Cast to GatekeeperConfig (we know it's valid now)
    const gatekeeperConfig = config as GatekeeperConfig;

    // Performance analysis
    let performance;
    if (opts.checkPerformance) {
      performance = analyzePerformance(gatekeeperConfig, {
        maxMiddlewareCount: opts.maxMiddlewareCount,
        maxExecutionTime: opts.maxExecutionTime,
      });
      allIssues.push(...performance.recommendations);
    }

    // Security analysis
    let security;
    if (opts.checkSecurity) {
      security = analyzeSecurity(gatekeeperConfig, {
        requireAuth: opts.requireAuth,
        requireAuditInProduction: opts.requireAuditInProduction,
      });
      allIssues.push(...security.recommendations);
    }

    // Best practices
    if (opts.checkBestPractices) {
      const bestPracticeIssues = checkBestPractices(gatekeeperConfig);
      allIssues.push(...bestPracticeIssues);
    }

    return this.createResult(allIssues, performance, security);
  }

  /**
   * Creates validation result from issues
   */
  private createResult(
    issues: ValidationIssue[],
    performance?: ReturnType<typeof analyzePerformance>,
    security?: ReturnType<typeof analyzeSecurity>
  ): ValidationResult {
    const errors = issues.filter(i => i.severity === ValidationSeverity.Error);
    const warnings = issues.filter(i => i.severity === ValidationSeverity.Warning);
    const info = issues.filter(i => i.severity === ValidationSeverity.Info);

    // Group by category
    const issuesByCategory: Record<ValidationCategory, ValidationIssue[]> = {
      [ValidationCategory.Type]: issues.filter(i => i.category === ValidationCategory.Type),
      [ValidationCategory.Performance]: issues.filter(i => i.category === ValidationCategory.Performance),
      [ValidationCategory.Security]: issues.filter(i => i.category === ValidationCategory.Security),
      [ValidationCategory.BestPractice]: issues.filter(i => i.category === ValidationCategory.BestPractice),
      [ValidationCategory.Configuration]: issues.filter(i => i.category === ValidationCategory.Configuration),
    };

    return {
      valid: errors.length === 0,
      totalIssues: issues.length,
      errors: errors.length,
      warnings: warnings.length,
      info: info.length,
      issues,
      errorIssues: errors,
      warningIssues: warnings,
      infoIssues: info,
      issuesByCategory,
      ...(performance !== undefined && { performance }),
      ...(security !== undefined && { security }),
    };
  }

  /**
   * Validates configuration and throws if invalid
   *
   * @param config - Configuration to validate
   * @param options - Validation options
   * @throws Error if validation fails
   */
  validateOrThrow(
    config: unknown,
    options?: ValidatorOptions
  ): void {
    const result = this.validate(config, options);
    
    if (!result.valid) {
      const errorMessages = result.errorIssues.map(i => `  - ${i.message} (${i.path || 'root'})`).join('\n');
      throw new Error(`Configuration validation failed:\n${errorMessages}`);
    }
  }

  /**
   * Gets validation summary as string
   *
   * @param result - Validation result
   * @returns Formatted summary string
   */
  getSummary(result: ValidationResult): string {
    const lines: string[] = [];

    lines.push('Configuration Validation Summary');
    lines.push('='.repeat(40));
    lines.push(`Status: ${result.valid ? '✓ Valid' : '✗ Invalid'}`);
    lines.push(`Total Issues: ${result.totalIssues}`);
    lines.push(`  Errors: ${result.errors}`);
    lines.push(`  Warnings: ${result.warnings}`);
    lines.push(`  Info: ${result.info}`);

    if (result.performance) {
      lines.push('');
      lines.push('Performance Analysis:');
      lines.push(`  Middleware Count: ${result.performance.middlewareCount}`);
      lines.push(`  Estimated Time: ${result.performance.estimatedExecutionTime}ms`);
      lines.push(`  Performance Score: ${result.performance.score}/100`);
      if (result.performance.bottlenecks.length > 0) {
        lines.push(`  Bottlenecks: ${result.performance.bottlenecks.length}`);
      }
    }

    if (result.security) {
      lines.push('');
      lines.push('Security Analysis:');
      lines.push(`  Security Score: ${result.security.score}/100`);
      if (result.security.missingFeatures.length > 0) {
        lines.push(`  Missing Features: ${result.security.missingFeatures.join(', ')}`);
      }
      if (result.security.risks.length > 0) {
        lines.push(`  Risks Identified: ${result.security.risks.length}`);
      }
    }

    if (result.errorIssues.length > 0) {
      lines.push('');
      lines.push('Errors:');
      result.errorIssues.forEach(issue => {
        lines.push(`  ✗ ${issue.message}${issue.path ? ` (${issue.path})` : ''}`);
      });
    }

    if (result.warningIssues.length > 0) {
      lines.push('');
      lines.push('Warnings:');
      result.warningIssues.forEach(issue => {
        lines.push(`  ⚠ ${issue.message}${issue.path ? ` (${issue.path})` : ''}`);
      });
    }

    return lines.join('\n');
  }
}

/**
 * Validates configuration (standalone function)
 *
 * @param config - Configuration to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateConfig(
  config: unknown,
  options?: ValidatorOptions
): ValidationResult {
  const validator = new ConfigValidator();
  return validator.validate(config, options);
}

