/**
 * Compliance logging utilities
 * 
 * Generates structured, parseable logs for compliance audits.
 */

import {
  ComplianceConfig,
  ComplianceLogEntry,
  ComplianceExecutionTrace,
  ComplianceDecisionRationale,
} from './compliance.types';
import { MiddlewareResult } from '../core';
import { NgxMiddleware } from '../core';

/**
 * Generates a structured compliance log entry
 */
export function generateComplianceLog(
  config: ComplianceConfig,
  context: {
    resource: string;
    method?: string;
    userId?: string;
    sessionId?: string;
    decision: 'allow' | 'deny';
    reason: string;
    executionTrace?: ComplianceExecutionTrace;
    decisionRationale?: ComplianceDecisionRationale;
    metadata?: Record<string, unknown>;
  }
): ComplianceLogEntry {
  const entry: ComplianceLogEntry = {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    eventType: 'access_decision',
    decision: context.decision,
    reason: context.reason,
    resource: context.resource,
    ...(context.method && { method: context.method }),
    ...(context.userId && { userId: context.userId }),
    ...(context.sessionId && { sessionId: context.sessionId }),
    ...(config.includeExecutionTrace && context.executionTrace && {
      executionTrace: context.executionTrace,
    }),
    ...(config.includeDecisionRationale && context.decisionRationale && {
      decisionRationale: context.decisionRationale,
    }),
    compliance: {
      framework: 'SOC2', // Default, can be overridden
      ...(config.logRetention?.policy && {
        retentionPolicy: config.logRetention.policy,
      }),
    },
    ...(context.metadata && { metadata: context.metadata }),
  };

  return entry;
}

/**
 * Formats a compliance log entry according to the configured format
 */
export function formatComplianceLog(
  entry: ComplianceLogEntry,
  format: 'json' | 'csv' | 'jsonl' = 'json'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(entry, null, 2);
    
    case 'jsonl':
      return JSON.stringify(entry);
    
    case 'csv':
      return formatAsCsv(entry);
    
    default:
      return JSON.stringify(entry);
  }
}

/**
 * Formats a log entry as CSV
 */
function formatAsCsv(entry: ComplianceLogEntry): string {
  const fields = [
    entry.id,
    entry.timestamp,
    entry.eventType,
    entry.decision,
    entry.reason,
    entry.resource,
    entry.method || '',
    entry.userId || '',
    entry.sessionId || '',
    entry.compliance.framework || '',
    entry.compliance.controlId || '',
    entry.compliance.retentionPolicy || '',
  ];

  // Escape fields that contain commas or quotes
  const escapedFields = fields.map(field => {
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  });

  return escapedFields.join(',');
}

/**
 * Generates a unique log entry ID
 */
function generateLogId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `log-${timestamp}-${random}`;
}

/**
 * Creates an execution trace from middleware execution results
 */
export function createExecutionTrace(
  chainId: string,
  startTime: number,
  endTime: number,
  middlewareExecutions: Array<{
    middleware: NgxMiddleware;
    index: number;
    startTime: number;
    endTime: number;
    result: boolean;
    error?: unknown;
  }>
): ComplianceExecutionTrace {
  const middlewareName = (m: NgxMiddleware): string => {
    if ('middlewareName' in m && typeof (m as { middlewareName?: string }).middlewareName === 'string') {
      return (m as { middlewareName: string }).middlewareName;
    }
    return `middleware-${m.name || 'unknown'}`;
  };

  return {
    chainId,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    duration: endTime - startTime,
    middlewareExecutions: middlewareExecutions.map(exec => ({
      index: exec.index,
      name: middlewareName(exec.middleware),
      startTime: new Date(exec.startTime).toISOString(),
      endTime: new Date(exec.endTime).toISOString(),
      duration: exec.endTime - exec.startTime,
      result: exec.error ? 'error' : (exec.result ? 'allow' : 'deny'),
      ...(exec.error !== undefined && exec.error !== null && { error: String(exec.error) }),
      ...(!exec.result && !exec.error && {
        reason: 'Middleware returned false',
      }),
    })),
  };
}

/**
 * Creates a decision rationale from middleware execution results
 */
export function createDecisionRationale(
  result: MiddlewareResult,
  middlewareExecutions: Array<{
    middleware: NgxMiddleware;
    index: number;
    result: boolean;
    error?: unknown;
  }>
): ComplianceDecisionRationale {
  const middlewareName = (m: NgxMiddleware): string => {
    if ('middlewareName' in m && typeof (m as { middlewareName?: string }).middlewareName === 'string') {
      return (m as { middlewareName: string }).middlewareName;
    }
    return `middleware-${m.name || 'unknown'}`;
  };

  const decision = result.result ? 'allow' : 'deny';
  const stoppedAt = result.stoppedAt;

  // Determine primary reason
  let primaryReason: string;
  if (result.result) {
    primaryReason = 'All middleware checks passed';
  } else if (stoppedAt >= 0 && stoppedAt < middlewareExecutions.length) {
    const failedMiddleware = middlewareExecutions[stoppedAt];
    if (failedMiddleware) {
      primaryReason = `Middleware "${middlewareName(failedMiddleware.middleware)}" denied access`;
      if (failedMiddleware.error) {
        primaryReason += ` (error: ${String(failedMiddleware.error)})`;
      }
    } else {
      primaryReason = 'Middleware chain denied access';
    }
  } else {
    primaryReason = 'Access denied by middleware chain';
  }

  // Build contributing factors
  const contributingFactors: string[] = [];
  if (stoppedAt >= 0) {
    contributingFactors.push(`Middleware at index ${stoppedAt} denied access`);
  }
  if (result.redirect) {
    contributingFactors.push(`Redirect to: ${result.redirect}`);
  }

  // Build contributing middleware
  const contributingMiddleware = middlewareExecutions.map((exec, index) => {
    let contribution: 'allowed' | 'denied' | 'neutral';
    let reason: string;

    if (exec.error) {
      contribution = 'denied';
      reason = `Error during execution: ${String(exec.error)}`;
    } else if (index === stoppedAt && !result.result) {
      contribution = 'denied';
      reason = 'This middleware denied access';
    } else if (index < stoppedAt || result.result) {
      contribution = 'allowed';
      reason = 'This middleware allowed access';
    } else {
      contribution = 'neutral';
      reason = 'This middleware was not executed (chain stopped earlier)';
    }

    return {
      name: middlewareName(exec.middleware),
      index,
      contribution,
      reason,
    };
  });

  return {
    decision,
    primaryReason,
    contributingFactors,
    contributingMiddleware,
  };
}

