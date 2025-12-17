/**
 * Security analysis for configuration
 */

import { GatekeeperConfig } from '../angular/gatekeeper.config';
import { NgxMiddleware } from '../core';
import { MiddlewarePipeline, isPipeline } from '../helpers';
import { ValidationIssue, ValidationSeverity, ValidationCategory, SecurityAnalysis } from './validator.types';

/**
 * Analyzes configuration for security issues
 *
 * @param config - Configuration to analyze
 * @param options - Validator options
 * @returns Security analysis
 */
export function analyzeSecurity(
  config: GatekeeperConfig,
  options: { requireAuth?: boolean; requireAuditInProduction?: boolean } = {}
): SecurityAnalysis {
  const issues: ValidationIssue[] = [];
  const missingFeatures: string[] = [];
  const risks: Array<{ risk: string; severity: ValidationSeverity; description: string }> = [];
  
  const isProduction = typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production';

  // Check for authentication middleware
  const hasAuth = hasMiddlewareType(config.middlewares, ['auth', 'authentication', 'login']);
  if (!hasAuth && options.requireAuth !== false) {
    missingFeatures.push('Authentication middleware');
    issues.push({
      severity: ValidationSeverity.Warning,
      category: ValidationCategory.Security,
      code: 'MISSING_AUTH',
      message: 'No authentication middleware found',
      path: 'middlewares',
      suggestion: 'Add authentication middleware to protect routes',
      documentationUrl: '/guide/security',
    });
  }

  // Check for CSRF protection
  const hasCSRF = hasMiddlewareType(config.middlewares, ['csrf']);
  if (!hasCSRF) {
    missingFeatures.push('CSRF protection');
    issues.push({
      severity: ValidationSeverity.Info,
      category: ValidationCategory.Security,
      code: 'MISSING_CSRF',
      message: 'Consider adding CSRF protection for POST/PUT/DELETE requests',
      path: 'middlewares',
      suggestion: 'Add createCSRFMiddleware() for form submissions',
    });
  }

  // Check for rate limiting
  const hasRateLimit = hasMiddlewareType(config.middlewares, ['rate', 'limit', 'throttle']);
  if (!hasRateLimit) {
    missingFeatures.push('Rate limiting');
    issues.push({
      severity: ValidationSeverity.Info,
      category: ValidationCategory.Security,
      code: 'MISSING_RATE_LIMIT',
      message: 'Consider adding rate limiting to prevent abuse',
      path: 'middlewares',
      suggestion: 'Add createRateLimitMiddleware() to limit request frequency',
    });
  }

  // Check for session management
  const hasSession = hasMiddlewareType(config.middlewares, ['session']);
  if (!hasSession && hasAuth) {
    issues.push({
      severity: ValidationSeverity.Info,
      category: ValidationCategory.Security,
      code: 'MISSING_SESSION',
      message: 'Consider adding session management for authenticated users',
      path: 'middlewares',
      suggestion: 'Add createSessionMiddleware() to manage user sessions',
    });
  }

  // Check for audit logging in production
  if (isProduction && !config.audit && options.requireAuditInProduction) {
    risks.push({
      risk: 'No audit logging in production',
      severity: ValidationSeverity.Warning,
      description: 'Audit logging is recommended for production environments',
    });
    issues.push({
      severity: ValidationSeverity.Warning,
      category: ValidationCategory.Security,
      code: 'MISSING_AUDIT_PRODUCTION',
      message: 'Audit logging is not configured for production',
      path: 'audit',
      suggestion: 'Enable audit logging for compliance and security monitoring',
    });
  }

  // Check for debug mode in production
  if (isProduction && config.debug) {
    risks.push({
      risk: 'Debug mode enabled in production',
      severity: ValidationSeverity.Warning,
      description: 'Debug mode may expose sensitive information',
    });
    issues.push({
      severity: ValidationSeverity.Warning,
      category: ValidationCategory.Security,
      code: 'DEBUG_IN_PRODUCTION',
      message: 'Debug mode is enabled in production',
      path: 'debug',
      suggestion: 'Disable debug mode in production builds',
    });
  }

  // Check for insecure onFail redirect
  if (config.onFail && !config.onFail.startsWith('/') && !config.onFail.startsWith('http')) {
    risks.push({
      risk: 'Insecure redirect path',
      severity: ValidationSeverity.Error,
      description: 'Redirect path may be vulnerable to open redirect attacks',
    });
    issues.push({
      severity: ValidationSeverity.Error,
      category: ValidationCategory.Security,
      code: 'INSECURE_REDIRECT',
      message: 'onFail redirect path should be an absolute path or full URL',
      path: 'onFail',
      suggestion: 'Use an absolute path (e.g., "/login") or validate external URLs',
    });
  }

  // Check for zero trust mode
  if (!config.zeroTrust && hasAuth) {
    issues.push({
      severity: ValidationSeverity.Info,
      category: ValidationCategory.Security,
      code: 'ZERO_TRUST_RECOMMENDED',
      message: 'Consider enabling zero trust mode for enhanced security',
      path: 'zeroTrust',
      suggestion: 'Set zeroTrust: true to enforce explicit route protection',
    });
  }

  // Check for IP filtering
  const hasIPFilter = hasMiddlewareType(config.middlewares, ['ip', 'whitelist', 'blacklist']);
  if (!hasIPFilter) {
    issues.push({
      severity: ValidationSeverity.Info,
      category: ValidationCategory.Security,
      code: 'IP_FILTER_RECOMMENDED',
      message: 'Consider adding IP filtering for sensitive routes',
      path: 'middlewares',
      suggestion: 'Add IP whitelist/blacklist middleware for admin routes',
    });
  }

  // Calculate security score (0-100)
  let score = 100;
  if (!hasAuth) score -= 30;
  if (!hasCSRF) score -= 10;
  if (!hasRateLimit) score -= 10;
  if (!hasSession && hasAuth) score -= 5;
  if (isProduction && !config.audit) score -= 15;
  if (isProduction && config.debug) score -= 20;
  if (config.onFail && !config.onFail.startsWith('/') && !config.onFail.startsWith('http')) {
    score -= 25;
  }
  score = Math.max(0, score);

  return {
    score,
    recommendations: issues,
    missingFeatures,
    risks,
  };
}

/**
 * Checks if middleware chain contains a specific type of middleware
 */
function hasMiddlewareType(
  middlewares: (NgxMiddleware | MiddlewarePipeline)[],
  keywords: string[]
): boolean {
  for (const item of middlewares) {
    let items: NgxMiddleware[] = [];
    
    if (isPipeline(item)) {
      items = item.middlewares;
    } else {
      items = [item];
    }

    for (const mw of items) {
      const mwName = (mw as any).middlewareName || '';
      const lowerName = mwName.toLowerCase();
      
      if (keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
        return true;
      }
    }
  }
  return false;
}

