/**
 * Diagnostics collector utilities
 * 
 * Collects diagnostic information about the application, Angular, browser, and gatekeeper.
 */

import { DiagnosticsInfo, MiddlewareDiagnostics, ExecutionOrderDiagnostics } from './diagnostics.types';
import { NgxMiddleware } from '../core';
import { MiddlewarePipeline } from '../helpers';
import { GatekeeperConfig } from '../angular/gatekeeper.config';
import { getExecutionOrderTracker } from '../tamper-detection/tamper-detection.utils';

/**
 * Collects diagnostic information
 * 
 * @param config - Gatekeeper configuration
 * @param customMetadata - Optional custom metadata to include
 * @returns Diagnostic information
 */
export function collectDiagnostics(
  config: GatekeeperConfig,
  customMetadata?: Record<string, unknown>
): DiagnosticsInfo {
  return {
    timestamp: new Date().toISOString(),
    application: collectApplicationInfo(),
    angular: collectAngularInfo(),
    browser: collectBrowserInfo(),
    gatekeeper: collectGatekeeperInfo(config),
    ...(customMetadata && { metadata: customMetadata }),
  };
}

/**
 * Collects application information
 */
function collectApplicationInfo(): DiagnosticsInfo['application'] {
  // Try to get application info from window or document
  const appName = typeof window !== 'undefined' 
    ? (window as { appName?: string }).appName 
    : undefined;
  
  const appVersion = typeof window !== 'undefined'
    ? (window as { appVersion?: string }).appVersion
    : undefined;

  return {
    ...(appName && { name: appName }),
    ...(appVersion && { version: appVersion }),
  };
}

/**
 * Collects Angular version information
 */
function collectAngularInfo(): DiagnosticsInfo['angular'] {
  try {
    const angularVersion = getAngularVersion();
    
    if (angularVersion) {
      const [major, minor, patch] = angularVersion.split('.').map(Number);
      return {
        version: angularVersion,
        major: major || 0,
        minor: minor || 0,
        patch: patch || 0,
      };
    }
  } catch (error) {
    console.warn('[Diagnostics] Failed to collect Angular version:', error);
  }

  // Fallback
  return {
    version: 'unknown',
    major: 0,
    minor: 0,
    patch: 0,
  };
}

/**
 * Gets Angular version (best-effort)
 */
function getAngularVersion(): string | null {
  try {
    // Try to get from window.ng (Angular DevTools)
    if (typeof window !== 'undefined' && (window as { ng?: { version?: string } }).ng?.version) {
      return ((window as unknown as { ng: { version: string } }).ng).version;
    }

    // Try to get from document (Angular SSR)
    if (typeof document !== 'undefined') {
      const ngVersionMeta = document.querySelector('meta[name="ng-version"]');
      if (ngVersionMeta) {
        return ngVersionMeta.getAttribute('content') || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Collects browser information
 */
function collectBrowserInfo(): DiagnosticsInfo['browser'] {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    // SSR environment
    return {
      name: 'server',
      version: 'unknown',
      userAgent: 'server-side-rendering',
      platform: 'server',
      language: 'unknown',
    };
  }

  const userAgent = navigator.userAgent;
  const browserInfo = parseUserAgent(userAgent);

  return {
    name: browserInfo.name,
    version: browserInfo.version,
    userAgent,
    platform: navigator.platform || 'unknown',
    language: navigator.language || 'unknown',
    ...(typeof screen !== 'undefined' && {
      screen: {
        width: screen.width,
        height: screen.height,
      },
    }),
  };
}

/**
 * Parses user agent string to extract browser name and version
 */
function parseUserAgent(userAgent: string): { name: string; version: string } {
  // Chrome
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    return {
      name: 'Chrome',
      version: match?.[1] ?? 'unknown',
    };
  }

  // Edge
  if (userAgent.includes('Edg')) {
    const match = userAgent.match(/Edg\/(\d+)/);
    return {
      name: 'Edge',
      version: match?.[1] ?? 'unknown',
    };
  }

  // Firefox
  if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    return {
      name: 'Firefox',
      version: match?.[1] ?? 'unknown',
    };
  }

  // Safari
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/);
    return {
      name: 'Safari',
      version: match?.[1] ?? 'unknown',
    };
  }

  // Fallback
  return {
    name: 'unknown',
    version: 'unknown',
  };
}

/**
 * Collects gatekeeper information
 */
function collectGatekeeperInfo(config: GatekeeperConfig): DiagnosticsInfo['gatekeeper'] {
  return {
    middleware: collectMiddlewareInfo(config.middlewares),
    executionOrder: collectExecutionOrderInfo(),
    features: {
      debug: config.debug || false,
      benchmark: config.benchmark?.enabled || false,
      audit: !!config.audit,
      compliance: config.compliance?.enabled || false,
      tamperDetection: config.tamperDetection?.enabled || false,
      zeroTrust: config.zeroTrust || false,
    },
  };
}

/**
 * Collects middleware information
 */
function collectMiddlewareInfo(
  middlewares: (NgxMiddleware | MiddlewarePipeline)[]
): MiddlewareDiagnostics {
  const list: MiddlewareDiagnostics['list'] = [];
  const pipelines: MiddlewareDiagnostics['pipelines'] = [];

  middlewares.forEach((middleware, index) => {
    // Check if it's a pipeline
    if (isPipeline(middleware)) {
      const pipeline = middleware as MiddlewarePipeline;
      const pipelineName = pipeline.pipelineName || `pipeline-${index}`;
      
      list.push({
        index,
        name: pipelineName,
        type: 'pipeline',
        isPipeline: true,
        pipelineName,
      });

      pipelines.push({
        name: pipelineName,
        middlewareCount: pipeline.middlewares?.length || 0,
      });
    } else {
      // Regular middleware
      const middlewareName = getMiddlewareName(middleware as NgxMiddleware);
      
      list.push({
        index,
        ...(middlewareName !== undefined && { name: middlewareName }),
        type: 'middleware',
        isPipeline: false,
      });
    }
  });

  return {
    count: middlewares.length,
    list,
    ...(pipelines.length > 0 && { pipelines }),
  };
}

/**
 * Checks if middleware is a pipeline
 */
function isPipeline(middleware: NgxMiddleware | MiddlewarePipeline): boolean {
  return (
    typeof middleware === 'object' &&
    middleware !== null &&
    'pipelineName' in middleware &&
    'middlewares' in middleware
  );
}

/**
 * Gets middleware name (best-effort)
 */
function getMiddlewareName(middleware: NgxMiddleware): string | undefined {
  try {
    // Try to get name from middleware function
    if (typeof middleware === 'function') {
      // Check if it has a name property
      if (middleware.name && middleware.name !== 'anonymous') {
        return middleware.name;
      }

      // Check if it has middlewareName property (from createMiddleware)
      if ('middlewareName' in middleware && typeof (middleware as { middlewareName?: string }).middlewareName === 'string') {
        return (middleware as { middlewareName: string }).middlewareName;
      }
    }
  } catch {
    // Ignore errors
  }

  return undefined;
}

/**
 * Collects execution order information
 */
function collectExecutionOrderInfo(): ExecutionOrderDiagnostics {
  try {
    const tracker = getExecutionOrderTracker();
    // Get recent executions (up to 100)
    const history = tracker.getRecentExecutions(100);

    const actual = history.map(execution => ({
      type: execution.type,
      resource: execution.path,
      timestamp: new Date(execution.timestamp).toISOString(),
    }));

    return {
      actual,
      statistics: {
        totalExecutions: history.length,
        guardExecutions: history.filter(e => e.type === 'guard').length,
        interceptorExecutions: history.filter(e => e.type === 'interceptor').length,
      },
    };
  } catch {
    // Execution order tracking not available
    return {};
  }
}

