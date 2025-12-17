/**
 * Compliance mode types and interfaces
 * 
 * Designed for SOC2, ISO 27001, and similar compliance frameworks.
 */

/**
 * Compliance mode configuration
 */
export interface ComplianceConfig {
  /**
   * Enable compliance mode
   * 
   * When enabled:
   * - Enforces deterministic execution order
   * - Requires explicit allow/deny outcomes
   * - Generates structured, parseable logs
   * - Ensures all decisions are traceable
   * 
   * @default false
   */
  enabled?: boolean;
  /**
   * Structured log format
   * - 'json': JSON format (recommended for compliance)
   * - 'csv': CSV format
   * - 'jsonl': JSON Lines format (one JSON object per line)
   * 
   * @default 'json'
   */
  logFormat?: 'json' | 'csv' | 'jsonl';
  /**
   * Include detailed execution trace in logs
   * Includes middleware execution order, timing, and results
   * 
   * @default true
   */
  includeExecutionTrace?: boolean;
  /**
   * Include decision rationale in logs
   * Documents why a decision was made (which middleware passed/failed)
   * 
   * @default true
   */
  includeDecisionRationale?: boolean;
  /**
   * Require explicit decision documentation
   * If true, middleware must provide clear decision reasons
   * 
   * @default false
   */
  requireExplicitReasons?: boolean;
  /**
   * Log retention policy (for compliance audit requirements)
   * Specifies how long logs should be retained
   */
  logRetention?: {
    /**
     * Retention period in days
     */
    days?: number;
    /**
     * Custom retention policy description
     */
    policy?: string;
  };
}

/**
 * Structured compliance log entry
 * 
 * Designed for SOC2, ISO 27001, and similar compliance frameworks.
 * All fields are required for complete audit trails.
 */
export interface ComplianceLogEntry {
  /**
   * Unique log entry identifier
   */
  id: string;
  /**
   * ISO 8601 timestamp of the decision
   */
  timestamp: string;
  /**
   * Event type: 'access_decision' | 'middleware_execution' | 'chain_execution'
   */
  eventType: 'access_decision' | 'middleware_execution' | 'chain_execution';
  /**
   * Decision outcome: 'allow' | 'deny'
   */
  decision: 'allow' | 'deny';
  /**
   * Explicit reason for the decision
   */
  reason: string;
  /**
   * Resource being accessed (route path or API endpoint)
   */
  resource: string;
  /**
   * HTTP method (for API requests) or 'ROUTE' (for route navigation)
   */
  method?: string;
  /**
   * User identifier (sanitized, no PII)
   */
  userId?: string;
  /**
   * Session identifier (if available)
   */
  sessionId?: string;
  /**
   * Execution trace (if includeExecutionTrace is true)
   */
  executionTrace?: ComplianceExecutionTrace;
  /**
   * Decision rationale (if includeDecisionRationale is true)
   */
  decisionRationale?: ComplianceDecisionRationale;
  /**
   * Compliance metadata
   */
  compliance: {
    /**
     * Framework identifier (e.g., 'SOC2', 'ISO27001')
     */
    framework?: string;
    /**
     * Control identifier (e.g., 'CC6.1', 'A.9.1.2')
     */
    controlId?: string;
    /**
     * Log retention policy identifier
     */
    retentionPolicy?: string;
  };
  /**
   * Additional metadata (sanitized, no PII)
   */
  metadata?: Record<string, unknown>;
}

/**
 * Execution trace for compliance logging
 */
export interface ComplianceExecutionTrace {
  /**
   * Chain execution ID (links all middleware executions in a chain)
   */
  chainId: string;
  /**
   * Start timestamp (ISO 8601)
   */
  startTime: string;
  /**
   * End timestamp (ISO 8601)
   */
  endTime: string;
  /**
   * Total execution duration in milliseconds
   */
  duration: number;
  /**
   * Middleware execution details (in order)
   */
  middlewareExecutions: Array<{
    /**
     * Middleware index in chain
     */
    index: number;
    /**
     * Middleware name/identifier
     */
    name: string;
    /**
     * Start timestamp (ISO 8601)
     */
    startTime: string;
    /**
     * End timestamp (ISO 8601)
     */
    endTime: string;
    /**
     * Execution duration in milliseconds
     */
    duration: number;
    /**
     * Result: 'allow' | 'deny' | 'error'
     */
    result: 'allow' | 'deny' | 'error';
    /**
     * Reason for result
     */
    reason?: string;
    /**
     * Error details (if result is 'error')
     */
    error?: string;
  }>;
}

/**
 * Decision rationale for compliance logging
 */
export interface ComplianceDecisionRationale {
  /**
   * Final decision
   */
  decision: 'allow' | 'deny';
  /**
   * Primary reason for decision
   */
  primaryReason: string;
  /**
   * Contributing factors
   */
  contributingFactors: string[];
  /**
   * Middleware that contributed to the decision
   */
  contributingMiddleware: Array<{
    /**
     * Middleware name
     */
    name: string;
    /**
     * Middleware index
     */
    index: number;
    /**
     * Contribution: 'allowed' | 'denied' | 'neutral'
     */
    contribution: 'allowed' | 'denied' | 'neutral';
    /**
     * Reason for contribution
     */
    reason: string;
  }>;
  /**
   * Policy or rule that was applied (if applicable)
   */
  appliedPolicy?: string;
  /**
   * Permission or role that was checked (if applicable)
   */
  checkedPermission?: string;
}

