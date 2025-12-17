import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { EMPTY, from, switchMap } from 'rxjs';
import { runMiddlewareChain } from '../core';
import { MiddlewareContext } from '../core';
import { DebugOptions } from '../core/debug';
import { resolvePipelines } from '../helpers';
import { GATEKEEPER_CONFIG, GatekeeperConfig } from './gatekeeper.provider';
import {
  getRequestGatekeeperMiddleware,
  getRequestGatekeeperOnFail,
} from './http-gatekeeper.context';
import {
  FeatureFlagProvider,
  FEATURE_FLAG_PROVIDER,
} from '../providers/feature-flag.provider';
import {
  type PolicyRegistry,
  POLICY_REGISTRY,
} from '../policies/policy.provider';
import { logAuditDecision } from '../audit/audit.middleware';
import {
  SECURITY_HEADERS_KEY,
  SecurityHeadersEntry,
} from '../security-headers/security-headers.types';
import { detectTampering, logTamperIssues } from '../tamper-detection/tamper-detection.utils';
import { generateComplianceLog, formatComplianceLog } from '../compliance/compliance.logger';
import { extractUserId } from '../audit/audit.sanitize';
// EXTENSION_REGISTRY is available but not used in interceptors - kept for future use
import { ExtensionRegistry } from '../extensions/extension.registry';

/**
 * Builds middleware context from HTTP request
 */
function buildContext(
  request: HttpRequest<unknown>,
  featureFlagProvider?: FeatureFlagProvider,
  policyRegistry?: PolicyRegistry
): MiddlewareContext {
  const context: MiddlewareContext = {
    request,
    url: request.url,
    method: request.method,
    headers: request.headers,
    body: request.body,
    params: request.params,
    shared: {}, // Initialize shared execution state for middleware chain
  };

  // Add feature flag provider to context if available
  if (featureFlagProvider) {
    context['featureFlagProvider'] = featureFlagProvider;
  }

  // Add policy registry to context if available
  if (policyRegistry) {
    context['policyRegistry'] = policyRegistry;
  }

  return context;
}

/**
 * Functional HTTP interceptor that executes middleware chain before allowing HTTP requests
 * 
 * Compatible with Angular 17+ functional interceptor pattern.
 * 
 * @example
 * ```typescript
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideHttpClient({
 *       withInterceptors: [gatekeeperInterceptor],
 *     }),
 *   ],
 * });
 * ```
 */
export const gatekeeperInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next
) => {
  let config: GatekeeperConfig;
  
  try {
    config = inject<GatekeeperConfig>(GATEKEEPER_CONFIG);
  } catch (error) {
    console.error('[Gatekeeper] Provider missing - interceptor cannot function properly');
    return next(request);
  }
  
  const router = inject(Router, { optional: true });
  const featureFlagProvider = inject<FeatureFlagProvider | null>(FEATURE_FLAG_PROVIDER, { optional: true });
  const policyRegistry = inject<PolicyRegistry | null>(POLICY_REGISTRY, { optional: true });
  const context = buildContext(request, featureFlagProvider ?? undefined, policyRegistry ?? undefined);
  
  // Tamper detection
  if (config.tamperDetection?.enabled) {
    const tamperResult = detectTampering(config.tamperDetection, {
      type: 'interceptor',
      path: request.url,
    });
    
    logTamperIssues(tamperResult, config.tamperDetection.strict ?? false);
    
    if (tamperResult.tampered && config.tamperDetection.strict) {
      // Block execution in strict mode
      return EMPTY;
    }
  }

  const debugOptions: DebugOptions | undefined = config.debug
    ? {
        enabled: true,
        context,
        contextType: 'http',
        contextPath: `${request.method} ${request.url}`,
      }
    : undefined;

  // Check for request-specific middleware (overrides global)
  const requestMiddlewares = getRequestGatekeeperMiddleware(request);
  const requestOnFail = getRequestGatekeeperOnFail(request);

  // Zero Trust Mode: Check if request has explicit middleware configuration
  if (config.zeroTrust) {
    // In zero trust mode, request must have explicit middleware configuration
    const hasRequestMiddleware = requestMiddlewares != null && requestMiddlewares.length > 0;
    const hasGlobalMiddleware = config.middlewares != null && config.middlewares.length > 0;
    
    if (!hasRequestMiddleware && !hasGlobalMiddleware) {
      // No middleware configured - deny access in zero trust mode
      const denyReason = 'Zero Trust Mode: Request does not have explicit middleware configuration';
      
      // Log audit decision if audit is configured
      if (config.audit) {
        logAuditDecision(
          config.audit,
          context,
          request.url,
          request.method,
          'deny',
          denyReason,
          config.onFail
        ).catch((error) => {
          console.error('[Audit] Failed to log audit decision:', error);
        });
      }
      
      if (config.debug) {
        console.warn(`[Gatekeeper] ${denyReason}: ${request.method} ${request.url}`);
      }
      
      // Cancel request by returning EMPTY
      return EMPTY;
    }
  }

  // Get extension middleware (if any extensions are registered)
  const extensionRegistry = inject(ExtensionRegistry, { optional: true });
  const extensionPreMiddleware = extensionRegistry?.getPreMiddleware() ?? [];
  const extensionPostMiddleware = extensionRegistry?.getPostMiddleware() ?? [];
  const extensionMergedMiddleware = extensionRegistry?.getMergedMiddleware() ?? [];

  // Use request-specific middleware if provided, otherwise use global middleware
  const userMiddlewares = requestMiddlewares ?? config.middlewares;
  // onFailPath is available but redirect is handled by router
  void (requestOnFail ?? config.onFail);

  // Merge middleware: extension pre → user → extension merged → extension post
  const allMiddlewares = [
    ...extensionPreMiddleware,
    ...userMiddlewares,
    ...extensionMergedMiddleware,
    ...extensionPostMiddleware,
  ];

  // Resolve pipelines to flat middleware array
  const resolvedMiddlewares = resolvePipelines(allMiddlewares);
  
  // Zero Trust Mode: Ensure middleware array is not empty after resolution
  if (config.zeroTrust && resolvedMiddlewares.length === 0) {
    const denyReason = 'Zero Trust Mode: No middleware resolved for request';
    
    // Log audit decision if audit is configured
    if (config.audit) {
      logAuditDecision(
        config.audit,
        context,
        request.url,
        request.method,
        'deny',
        denyReason,
        config.onFail
      ).catch((error) => {
        console.error('[Audit] Failed to log audit decision:', error);
      });
    }
    
    if (config.debug) {
      console.warn(`[Gatekeeper] ${denyReason}: ${request.method} ${request.url}`);
    }
    
    // Cancel request by returning EMPTY
    return EMPTY;
  }

  // Convert Promise to Observable and handle the result
  return from(
    runMiddlewareChain(resolvedMiddlewares, context, debugOptions, config.benchmark, config.compliance)
  ).pipe(
    switchMap((result) => {
      // Log audit decision if audit is configured (fire and forget)
      if (config.audit) {
        const resource = request.url;
        const method = request.method;
        const decision: 'allow' | 'deny' = result.result ? 'allow' : 'deny';
        
        // Enhanced reason for compliance mode
        let reason: string | undefined;
        if (!result.result) {
          reason = 'Middleware chain denied access';
          if (config.compliance?.enabled && result.decisionRationale) {
            reason = result.decisionRationale.primaryReason;
          }
        } else if (config.compliance?.enabled && result.decisionRationale) {
          reason = result.decisionRationale.primaryReason;
        }
        
        const redirect = result.redirect;

        // Log asynchronously (don't block execution)
        logAuditDecision(
          config.audit,
          context,
          resource,
          method,
          decision,
          reason,
          redirect
        ).catch((error) => {
          console.error('[Audit] Failed to log audit decision:', error);
        });
      }
      
      // Generate compliance log if compliance mode is enabled
      if (config.compliance?.enabled) {
        const userIdPaths = ['user.id', 'user.sessionId', 'user.userId', 'session.id'];
        const userId = extractUserId(context as Record<string, unknown>, userIdPaths);
        
        const complianceEntry = generateComplianceLog(
          config.compliance,
          {
            resource: request.url,
            method: request.method,
            decision: result.result ? 'allow' : 'deny',
            reason: result.decisionRationale?.primaryReason || (result.result ? 'All middleware checks passed' : 'Middleware chain denied access'),
            ...(result.executionTrace !== undefined && { executionTrace: result.executionTrace }),
            ...(result.decisionRationale !== undefined && { decisionRationale: result.decisionRationale }),
            ...(userId !== undefined && { userId }),
          }
        );
        
        const formatted = formatComplianceLog(complianceEntry, config.compliance.logFormat || 'json');
        
        // Log to compliance sink if configured, otherwise log to console
        console.log('[COMPLIANCE]', formatted);
      }

      if (!result.result) {
        // Priority: middleware redirect > request onFail > global onFail
        const redirectPath = result.redirect ?? requestOnFail ?? config.onFail;
        
        // Middleware failed - optionally redirect
        if (router && redirectPath) {
          router.navigateByUrl(redirectPath);
        }
        // Cancel request by returning EMPTY
        return EMPTY;
      }

      // Middleware passed - apply security headers if any
      const headersEntry = context[SECURITY_HEADERS_KEY] as SecurityHeadersEntry | undefined;
      
      if (headersEntry && headersEntry.headers) {
        // Clone request with new headers
        let modifiedHeaders = request.headers;
        
        for (const [key, value] of Object.entries(headersEntry.headers)) {
          if (headersEntry.overwrite || !modifiedHeaders.has(key)) {
            modifiedHeaders = modifiedHeaders.set(key, value);
          }
        }
        
        // Create new request with modified headers
        const modifiedRequest = request.clone({
          headers: modifiedHeaders,
        });
        
        return next(modifiedRequest);
      }

      // No headers to add - proceed with original request
      return next(request);
    })
  );
};

/**
 * @deprecated Use gatekeeperInterceptor functional interceptor instead.
 * This class-based interceptor is kept for backward compatibility but will be removed in a future version.
 * 
 * For class-based usage with HTTP_INTERCEPTORS, use:
 * ```typescript
 * { provide: HTTP_INTERCEPTORS, useValue: gatekeeperInterceptor, multi: true }
 * ```
 */
export class GatekeeperInterceptor {
  static intercept = gatekeeperInterceptor;
}

