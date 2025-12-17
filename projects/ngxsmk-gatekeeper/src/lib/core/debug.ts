import { MiddlewareContext, MiddlewareResult } from './middleware.types';
import { NgxMiddleware } from './middleware.types';

/**
 * Debug information for middleware execution
 */
export interface MiddlewareDebugInfo {
  name: string;
  index: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  result: boolean;
  error?: unknown;
}

/**
 * Debug options for middleware execution
 */
export interface DebugOptions {
  enabled: boolean;
  context: MiddlewareContext;
  contextType: 'route' | 'http';
  contextPath?: string;
  /**
   * Chunk/module name for lazy-loaded routes (CanLoad)
   * Used for logging when chunk loading is blocked
   */
  chunkName?: string;
}

/**
 * Checks if we're in production mode
 * This can be tree-shaken in production builds
 */
function isProduction(): boolean {
  // Check for common production indicators
  if (typeof process !== 'undefined' && process.env) {
    return process.env['NODE_ENV'] === 'production';
  }
  // In browser, check for minified code indicators
  // This is a best-effort check
  return false;
}

/**
 * Gets middleware name for debugging
 */
export function getMiddlewareName(
  middleware: NgxMiddleware,
  index: number
): string {
  // Check if middleware has name metadata (from createMiddleware helper)
  if (middleware && typeof middleware === 'function') {
    const namedMiddleware = middleware as { middlewareName?: string };
    if (namedMiddleware.middlewareName) {
      return namedMiddleware.middlewareName;
    }
  }
  return `Middleware[${index}]`;
}

/**
 * Gets pipeline name for debugging (if applicable)
 */
export function getPipelineName(
  pipeline: { pipelineName?: string } | null | undefined
): string | undefined {
  return pipeline?.pipelineName;
}

/**
 * Logs middleware execution start
 */
export function logMiddlewareStart(
  options: DebugOptions,
  middleware: NgxMiddleware,
  index: number
): number {
  if (!options.enabled || isProduction()) {
    return 0;
  }

  const name = getMiddlewareName(middleware, index);
  // Use performance.now() if available, fallback to Date.now() for SSR compatibility
  const startTime = typeof performance !== 'undefined' && performance.now
    ? performance.now()
    : Date.now();

  console.groupCollapsed(
    `%c🔒 ${name}`,
    'color: #9c27b0; font-weight: bold;'
  );
  console.log(`Context: ${options.contextType}`);
  if (options.contextPath) {
    console.log(`Path: ${options.contextPath}`);
  }
  console.log(`Index: ${index}`);
  console.log(`Started: ${new Date().toISOString()}`);

  return startTime;
}

/**
 * Logs middleware execution end
 */
export function logMiddlewareEnd(
  options: DebugOptions,
  middleware: NgxMiddleware,
  index: number,
  startTime: number,
  result: boolean,
  error?: unknown
): void {
  if (!options.enabled || isProduction()) {
    return;
  }

  // Name is computed but not stored - this is intentional for logging
  void getMiddlewareName(middleware, index);
  // Use performance.now() if available, fallback to Date.now() for SSR compatibility
  const endTime = typeof performance !== 'undefined' && performance.now
    ? performance.now()
    : Date.now();
  const duration = endTime - startTime;

  if (result) {
    console.log(
      `%c✅ Passed in ${duration.toFixed(2)}ms`,
      'color: #4caf50; font-weight: bold;'
    );
  } else {
    console.log(
      `%c❌ Failed in ${duration.toFixed(2)}ms`,
      'color: #f44336; font-weight: bold;'
    );
    if (error) {
      console.error('Error:', error);
    }
  }
  console.log(`Ended: ${new Date().toISOString()}`);
  console.groupEnd();
}

/**
 * Logs middleware chain start
 */
export function logChainStart(options: DebugOptions): void {
  if (!options.enabled || isProduction()) {
    return;
  }

  const contextType = options.contextType === 'route' ? '🛣️ Route' : '🌐 HTTP';
  const path = options.contextPath || 'unknown';
  const title = options.chunkName 
    ? `${contextType} Guard (CanLoad): ${path}`
    : `${contextType} Guard: ${path}`;

  console.groupCollapsed(
    `%c${title}`,
    'color: #2196f3; font-weight: bold; font-size: 14px;'
  );
  console.log(`Context Type: ${options.contextType}`);
  console.log(`Path: ${path}`);
  if (options.chunkName) {
    console.log(`%c📦 Lazy Module: ${options.chunkName}`, 'color: #ff9800; font-weight: bold;');
  }
  console.log(`Started: ${new Date().toISOString()}`);
}

/**
 * Logs middleware chain end
 */
export function logChainEnd(
  options: DebugOptions,
  result: MiddlewareResult,
  totalTime: number
): void {
  if (!options.enabled || isProduction()) {
    return;
  }

  if (result.result) {
    console.log(
      `%c✅ All middlewares passed in ${totalTime.toFixed(2)}ms`,
      'color: #4caf50; font-weight: bold;'
    );
  } else {
    console.log(
      `%c❌ Middleware chain failed at index ${result.stoppedAt} in ${totalTime.toFixed(2)}ms`,
      'color: #f44336; font-weight: bold;'
    );
    console.log(`Failed middleware: Index ${result.stoppedAt}`);
    
    // Log blocked chunk name for CanLoad guards
    if (options.chunkName) {
      console.log(
        `%c🚫 Blocked chunk loading: ${options.chunkName}`,
        'color: #ff9800; font-weight: bold;'
      );
    }
  }
  console.log(`Ended: ${new Date().toISOString()}`);
  console.groupEnd();
}

