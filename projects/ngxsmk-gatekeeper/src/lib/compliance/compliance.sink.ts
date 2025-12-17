/**
 * Compliance audit sink for structured logging
 * 
 * Provides structured, parseable logs for compliance audits (SOC2, ISO 27001, etc.)
 */

import { AuditSink, AuditLogEntry } from '../audit/audit.types';
import {
  ComplianceConfig,
  // ComplianceLogEntry type is available but not directly used
} from './compliance.types';
import {
  generateComplianceLog,
  formatComplianceLog,
} from './compliance.logger';

/**
 * Compliance audit sink that generates structured logs
 * 
 * Formats audit logs according to compliance requirements:
 * - Structured JSON/CSV/JSONL format
 * - Complete execution traces
 * - Decision rationale
 * - Compliance metadata
 */
export class ComplianceAuditSink implements AuditSink {
  private readonly config: ComplianceConfig;
  private readonly underlyingSink: AuditSink;

  constructor(
    underlyingSink: AuditSink,
    config: ComplianceConfig
  ) {
    this.underlyingSink = underlyingSink;
    this.config = {
      logFormat: 'json',
      includeExecutionTrace: true,
      includeDecisionRationale: true,
      ...config,
    };
  }

  /**
   * Logs an audit entry in compliance format
   */
  async log(entry: AuditLogEntry): Promise<void> {
    // Convert audit entry to compliance log entry
    const complianceEntry = generateComplianceLog(
      this.config,
      {
        resource: entry.resource,
        ...(entry.method !== undefined && { method: entry.method }),
        ...(entry.userId !== undefined && { userId: entry.userId }),
        decision: entry.decision,
        reason: entry.reason || `Access ${entry.decision === 'allow' ? 'granted' : 'denied'}`,
        ...(entry.metadata !== undefined && { metadata: entry.metadata }),
      }
    );

    // Format according to configured format
    const formatted = formatComplianceLog(
      complianceEntry,
      this.config.logFormat || 'json'
    );

    // Log to underlying sink (which will handle the formatted string)
    // For now, we'll create a wrapper that logs the structured format
    await this.logStructured(formatted);

    // Also log to underlying sink for backward compatibility
    const result = this.underlyingSink.log(entry);
    if (result instanceof Promise) {
      await result;
    }
  }

  /**
   * Logs structured compliance data
   */
  private async logStructured(formatted: string): Promise<void> {
    // In a real implementation, this would write to a compliance log store
    // For now, we'll use console for structured output
    if (this.config.logFormat === 'json' || this.config.logFormat === 'jsonl') {
      // Parse and log as structured object for better parsing
      try {
        const parsed = JSON.parse(formatted);
        console.log('[COMPLIANCE LOG]', JSON.stringify(parsed));
      } catch {
        console.log('[COMPLIANCE LOG]', formatted);
      }
    } else {
      console.log('[COMPLIANCE LOG]', formatted);
    }
  }
}

