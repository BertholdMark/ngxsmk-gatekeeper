import { inject } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { runMiddlewareChain } from '../core';
import { MiddlewareContext } from '../core';
import { DebugOptions } from '../core/debug';
import { resolvePipelines } from '../helpers';
import { GATEKEEPER_CONFIG, GatekeeperConfig } from './gatekeeper.provider';
import {
  extractRouteGatekeeperConfig,
  RouteGatekeeperConfig,
} from './route-gatekeeper.config';
import {
  FeatureFlagProvider,
  FEATURE_FLAG_PROVIDER,
} from '../providers/feature-flag.provider';
import {
  type PolicyRegistry,
  POLICY_REGISTRY,
} from '../policies/policy.provider';
import { logAuditDecision } from '../audit/audit.middleware';
import { detectTampering, logTamperIssues } from '../tamper-detection/tamper-detection.utils';
import { generateComplianceLog, formatComplianceLog } from '../compliance/compliance.logger';
import { extractUserId } from '../audit/audit.sanitize';
// EXTENSION_REGISTRY is available but not used in guards - kept for future use
import { ExtensionRegistry } from '../extensions/extension.registry';

/**
 * Extracts chunk/module name from a lazy-loaded route
 * 
 * Attempts to extract the module name from loadChildren or loadComponent function.
 * Falls back to route path if extraction fails.
 */
function extractChunkName(route: Route, segments: UrlSegment[]): string {
  // Try to extract from loadChildren function string representation
  if (route.loadChildren) {
    try {
      const loadChildrenStr = route.loadChildren.toString();
      // Match patterns like: () => import('./admin/admin.module').then(m => m.AdminModule)
      // or: () => import('./feature/feature.routes')
      const importMatch = loadChildrenStr.match(/import\(['"]([^'"]+)['"]\)/);
      if (importMatch && importMatch[1]) {
        // Extract the module path and convert to a readable name
        const modulePath = importMatch[1];
        const pathParts = modulePath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        // Remove extension if present
        return fileName?.replace(/\.(module|routes?|component)$/, '') || 'unknown';
      }
    } catch {
      // If extraction fails, fall through to fallback
    }
  }

  // Try to extract from loadComponent function string representation
  if (route.loadComponent) {
    try {
      const loadComponentStr = route.loadComponent.toString();
      const importMatch = loadComponentStr.match(/import\(['"]([^'"]+)['"]\)/);
      if (importMatch && importMatch[1]) {
        const modulePath = importMatch[1];
        const pathParts = modulePath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        return fileName?.replace(/\.(component|module)$/, '') || 'unknown';
      }
    } catch {
      // If extraction fails, fall through to fallback
    }
  }

  // Fallback: use route path or segments
  if (route.path) {
    return route.path;
  }
  
  if (segments && segments.length > 0) {
    return segments.map(s => s.path).join('/');
  }

  return 'unknown';
}

/**
 * Builds middleware context from route and router state
 */
function buildContext(
  route: ActivatedRouteSnapshot | Route,
  state?: RouterStateSnapshot,
  featureFlagProvider?: FeatureFlagProvider,
  policyRegistry?: PolicyRegistry
): MiddlewareContext {
  const context: MiddlewareContext = {
    route,
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

  if (state) {
    context['state'] = state;
    context['url'] = state.url;
  }

  if (route instanceof ActivatedRouteSnapshot) {
    context['params'] = route.params;
    context['queryParams'] = route.queryParams;
    context['data'] = route.data;
    context['fragment'] = route.fragment;
  } else {
    // For Route (used in CanLoad)
    context['path'] = route.path;
    context['data'] = route.data;
  }

  return context;
}

/**
 * Executes middleware chain and returns appropriate result
 */
async function executeMiddlewareChain(
  config: GatekeeperConfig,
  router: Router,
  context: MiddlewareContext,
  contextPath: string,
  routeConfig?: RouteGatekeeperConfig | null,
  chunkName?: string
): Promise<boolean | UrlTree> {
  const debugOptions: DebugOptions | undefined = config.debug
    ? {
        enabled: true,
        context,
        contextType: 'route',
        contextPath,
        ...(chunkName && { chunkName }),
      }
    : undefined;

  // Zero Trust Mode: Check if route has explicit middleware configuration
  if (config.zeroTrust) {
    // In zero trust mode, route must have explicit middleware configuration
    // Check if route has route-level middleware, otherwise check global middleware
    const hasRouteMiddleware = routeConfig?.middlewares != null && routeConfig.middlewares.length > 0;
    const hasGlobalMiddleware = config.middlewares != null && config.middlewares.length > 0;
    
    if (!hasRouteMiddleware && !hasGlobalMiddleware) {
      // No middleware configured - deny access in zero trust mode
      const denyReason = 'Zero Trust Mode: Route does not have explicit middleware configuration';
      
      // Log audit decision if audit is configured
      if (config.audit) {
        logAuditDecision(
          config.audit,
          context,
          contextPath,
          undefined,
          'deny',
          denyReason,
          config.onFail
        ).catch((error) => {
          console.error('[Audit] Failed to log audit decision:', error);
        });
      }
      
      if (config.debug) {
        console.warn(`[Gatekeeper] ${denyReason}: ${contextPath}`);
      }
      
      return router.createUrlTree([config.onFail]);
    }
  }

  // Get extension middleware (if any extensions are registered)
  const extensionRegistry = inject(ExtensionRegistry, { optional: true });
  const extensionPreMiddleware = extensionRegistry?.getPreMiddleware() ?? [];
  const extensionPostMiddleware = extensionRegistry?.getPostMiddleware() ?? [];
  const extensionMergedMiddleware = extensionRegistry?.getMergedMiddleware() ?? [];

  // Use route-level middleware if provided, otherwise use global middleware
  const userMiddlewares = routeConfig?.middlewares ?? config.middlewares;
  // onFailPath is available but redirect is handled by router
  void (routeConfig?.onFail ?? config.onFail);

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
    const denyReason = 'Zero Trust Mode: No middleware resolved for route';
    
    // Log audit decision if audit is configured
    if (config.audit) {
      logAuditDecision(
        config.audit,
        context,
        contextPath,
        undefined,
        'deny',
        denyReason,
        config.onFail
      ).catch((error) => {
        console.error('[Audit] Failed to log audit decision:', error);
      });
    }
    
    if (config.debug) {
      console.warn(`[Gatekeeper] ${denyReason}: ${contextPath}`);
    }
    
    return router.createUrlTree([config.onFail]);
  }

  const result = await runMiddlewareChain(
    resolvedMiddlewares,
    context,
    debugOptions,
    config.benchmark,
    config.compliance
  );

  // Log audit decision if audit is configured
  if (config.audit) {
    const resource = contextPath;
    const method = undefined; // Routes don't have HTTP methods
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
        resource: contextPath,
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
    // Priority: middleware redirect > route onFail > global onFail
    const redirectPath = result.redirect ?? routeConfig?.onFail ?? config.onFail;
    
    // Return UrlTree to prevent chunk loading
    // Angular's router will not load the lazy module if CanLoad returns false or UrlTree
    return router.createUrlTree([redirectPath]);
  }

  // Return true to allow chunk loading
  return true;
}

/**
 * Functional route guard that executes middleware chain before allowing route activation
 * 
 * Compatible with Angular 17+ functional guard pattern.
 * 
 * @example
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'dashboard',
 *     loadComponent: () => import('./dashboard.component'),
 *     canActivate: [gatekeeperGuard],
 *   },
 * ];
 * ```
 */
export function gatekeeperGuard(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree | Promise<boolean | UrlTree> {
  let config: GatekeeperConfig;
  
  try {
    config = inject<GatekeeperConfig>(GATEKEEPER_CONFIG);
  } catch (error) {
    throw new Error('Gatekeeper provider (GATEKEEPER_CONFIG) is missing. Make sure to call provideGatekeeper() in your application providers.');
  }
  
  const router = inject(Router);
  const featureFlagProvider = inject<FeatureFlagProvider | null>(FEATURE_FLAG_PROVIDER, { optional: true });
  const policyRegistry = inject<PolicyRegistry | null>(POLICY_REGISTRY, { optional: true });
  const context = buildContext(route, state, featureFlagProvider ?? undefined, policyRegistry ?? undefined);
  const contextPath = state.url || route.routeConfig?.path || 'unknown';
  
  // Tamper detection
  if (config.tamperDetection?.enabled) {
    const tamperResult = detectTampering(config.tamperDetection, {
      type: 'guard',
      path: contextPath,
    });
    
    logTamperIssues(tamperResult, config.tamperDetection.strict ?? false);
    
    if (tamperResult.tampered && config.tamperDetection.strict) {
      // Block execution in strict mode
      return router.createUrlTree([config.onFail]);
    }
  }
  
  // Extract route-level gatekeeper configuration
  const routeConfig = extractRouteGatekeeperConfig(route);
  
  return executeMiddlewareChain(config, router, context, contextPath, routeConfig);
}

/**
 * Functional route guard that executes middleware chain before allowing route loading
 * 
 * **Important:** This guard runs BEFORE the lazy module chunk is downloaded.
 * If middleware fails, the chunk will NOT be loaded, saving bandwidth and preventing
 * unauthorized code execution.
 * 
 * Compatible with Angular 17+ functional guard pattern.
 * 
 * @example
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'admin',
 *     loadChildren: () => import('./admin.routes'),
 *     canLoad: [gatekeeperLoadGuard],
 *   },
 * ];
 * ```
 */
export function gatekeeperLoadGuard(
  route: Route,
  segments: UrlSegment[]
): boolean | UrlTree | Promise<boolean | UrlTree> {
  let config: GatekeeperConfig;
  
  try {
    config = inject<GatekeeperConfig>(GATEKEEPER_CONFIG);
  } catch (error) {
    throw new Error('Gatekeeper provider (GATEKEEPER_CONFIG) is missing. Make sure to call provideGatekeeper() in your application providers.');
  }
  
  const router = inject(Router);
  const featureFlagProvider = inject<FeatureFlagProvider | null>(FEATURE_FLAG_PROVIDER, { optional: true });
  const policyRegistry = inject<PolicyRegistry | null>(POLICY_REGISTRY, { optional: true });
  const context = buildContext(route, undefined, featureFlagProvider ?? undefined, policyRegistry ?? undefined);
  context['segments'] = segments;
  const contextPath = route.path || segments.map((s) => s.path).join('/') || 'unknown';
  
  // Tamper detection
  if (config.tamperDetection?.enabled) {
    const tamperResult = detectTampering(config.tamperDetection, {
      type: 'guard',
      path: contextPath,
    });
    
    logTamperIssues(tamperResult, config.tamperDetection.strict ?? false);
    
    if (tamperResult.tampered && config.tamperDetection.strict) {
      // Block execution in strict mode
      return router.createUrlTree([config.onFail]);
    }
  }
  
  // Extract chunk/module name for debug logging
  const chunkName = extractChunkName(route, segments);
  
  // Extract route-level gatekeeper configuration
  const routeConfig = extractRouteGatekeeperConfig(route);
  
  // Execute middleware chain BEFORE chunk download
  // If middleware fails, returns UrlTree which prevents chunk loading
  return executeMiddlewareChain(config, router, context, contextPath, routeConfig, chunkName);
}

/**
 * @deprecated Use gatekeeperGuard() functional guard instead.
 * This class-based guard is kept for backward compatibility but will be removed in a future version.
 */
export class GatekeeperGuard {
  static canActivate = gatekeeperGuard;
  static canLoad = gatekeeperLoadGuard;
}

