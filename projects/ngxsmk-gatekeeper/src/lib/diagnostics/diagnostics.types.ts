/**
 * Diagnostics types for export feature
 */

/**
 * Diagnostic information about the application
 */
export interface DiagnosticsInfo {
  /**
   * Timestamp when diagnostics were collected
   */
  timestamp: string;
  /**
   * Application information
   */
  application: {
    /**
     * Application name (if available)
     */
    name?: string;
    /**
     * Application version (if available)
     */
    version?: string;
  };
  /**
   * Angular version information
   */
  angular: {
    /**
     * Angular version
     */
    version: string;
    /**
     * Angular major version
     */
    major: number;
    /**
     * Angular minor version
     */
    minor: number;
    /**
     * Angular patch version
     */
    patch: number;
  };
  /**
   * Browser information
   */
  browser: {
    /**
     * Browser name
     */
    name: string;
    /**
     * Browser version
     */
    version: string;
    /**
     * User agent string
     */
    userAgent: string;
    /**
     * Platform information
     */
    platform: string;
    /**
     * Language
     */
    language: string;
    /**
     * Screen resolution
     */
    screen?: {
      width: number;
      height: number;
    };
  };
  /**
   * Gatekeeper configuration
   */
  gatekeeper: {
    /**
     * Middleware configuration
     */
    middleware: MiddlewareDiagnostics;
    /**
     * Execution order information
     */
    executionOrder: ExecutionOrderDiagnostics;
    /**
     * Feature flags enabled
     */
    features: {
      debug?: boolean;
      benchmark?: boolean;
      audit?: boolean;
      compliance?: boolean;
      tamperDetection?: boolean;
      zeroTrust?: boolean;
    };
  };
  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Middleware diagnostics information
 */
export interface MiddlewareDiagnostics {
  /**
   * Total number of middleware
   */
  count: number;
  /**
   * Middleware list with names and types
   */
  list: Array<{
    /**
     * Middleware index
     */
    index: number;
    /**
     * Middleware name (if available)
     */
    name?: string;
    /**
     * Middleware type (function, pipeline, etc.)
     */
    type: string;
    /**
     * Whether it's a pipeline
     */
    isPipeline?: boolean;
    /**
     * Pipeline name (if applicable)
     */
    pipelineName?: string;
  }>;
  /**
   * Pipeline information (if any)
   */
  pipelines?: Array<{
    /**
     * Pipeline name
     */
    name: string;
    /**
     * Number of middleware in pipeline
     */
    middlewareCount: number;
  }>;
}

/**
 * Execution order diagnostics information
 */
export interface ExecutionOrderDiagnostics {
  /**
   * Expected execution order
   */
  expected?: string[];
  /**
   * Actual execution order (if tracked)
   */
  actual?: Array<{
    /**
     * Execution type (guard, interceptor)
     */
    type: string;
    /**
     * Resource path
     */
    resource: string;
    /**
     * Timestamp
     */
    timestamp: string;
  }>;
  /**
   * Execution statistics
   */
  statistics?: {
    /**
     * Total executions tracked
     */
    totalExecutions: number;
    /**
     * Guard executions
     */
    guardExecutions: number;
    /**
     * Interceptor executions
     */
    interceptorExecutions: number;
  };
}

/**
 * Diagnostics export format
 */
export type DiagnosticsExportFormat = 'json' | 'txt' | 'markdown';

/**
 * Diagnostics export options
 */
export interface DiagnosticsExportOptions {
  /**
   * Export format
   * @default 'json'
   */
  format?: DiagnosticsExportFormat;
  /**
   * Include sensitive information (default: false)
   */
  includeSensitive?: boolean;
  /**
   * Custom metadata to include
   */
  customMetadata?: Record<string, unknown>;
}

