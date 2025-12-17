/**
 * Audit logging types and interfaces
 */

/**
 * Audit log entry containing information about an access decision
 */
export interface AuditLogEntry {
  /**
   * Unique identifier for the audit log entry
   */
  id: string;
  /**
   * Timestamp when the decision was made (ISO 8601 format)
   */
  timestamp: string;
  /**
   * User identifier (sanitized, no PII by default)
   * Can be user ID, session ID, or anonymous identifier
   */
  userId?: string;
  /**
   * Route path or API endpoint that was accessed
   */
  resource: string;
  /**
   * HTTP method (for API requests) or 'ROUTE' (for route navigation)
   */
  method?: string;
  /**
   * Decision made: 'allow' or 'deny'
   */
  decision: 'allow' | 'deny';
  /**
   * Optional reason for denial
   */
  reason?: string;
  /**
   * Optional redirect path if access was denied
   */
  redirect?: string;
  /**
   * Context type: 'route' or 'http'
   */
  contextType: 'route' | 'http';
  /**
   * Additional metadata (sanitized, no PII by default)
   */
  metadata?: Record<string, unknown>;
}

/**
 * Audit sink interface for custom audit log destinations
 */
export interface AuditSink {
  /**
   * Logs an audit entry
   * 
   * @param entry - Audit log entry to record
   * @returns Promise that resolves when logging is complete
   */
  log(entry: AuditLogEntry): Promise<void> | void;
}

/**
 * Configuration for audit middleware
 */
export interface AuditMiddlewareConfig {
  /**
   * Audit sink(s) to use for logging
   * Can be a single sink or array of sinks
   */
  sinks: AuditSink | AuditSink[];
  /**
   * Path to user identifier in context
   * Default: 'user.id' or 'user.sessionId'
   */
  userIdPath?: string | string[];
  /**
   * Whether to include additional metadata in audit logs
   * Default: false (only essential fields)
   */
  includeMetadata?: boolean;
  /**
   * Custom fields to include in metadata (if includeMetadata is true)
   * These will be sanitized before inclusion
   */
  metadataFields?: string[];
  /**
   * Custom PII fields to exclude from logs
   * These are in addition to the default PII fields
   */
  excludeFields?: string[];
}

