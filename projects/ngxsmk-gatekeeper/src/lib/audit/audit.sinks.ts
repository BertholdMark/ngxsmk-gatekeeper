/**
 * Built-in audit sinks for audit logging
 */

import { AuditSink, AuditLogEntry } from './audit.types';

/**
 * Console audit sink - logs to browser console
 * 
 * Useful for development and debugging.
 * In production, consider using a remote API sink instead.
 */
export class ConsoleAuditSink implements AuditSink {
  /**
   * Logs audit entry to console
   */
  log(entry: AuditLogEntry): void {
    const logLevel = entry.decision === 'deny' ? 'warn' : 'info';
    const message = `[AUDIT] ${entry.decision.toUpperCase()}: ${entry.resource} - ${entry.contextType}`;
    
    const logData = {
      id: entry.id,
      timestamp: entry.timestamp,
      userId: entry.userId,
      resource: entry.resource,
      method: entry.method,
      decision: entry.decision,
      reason: entry.reason,
      redirect: entry.redirect,
      contextType: entry.contextType,
      ...(entry.metadata && { metadata: entry.metadata }),
    };

    // Use console.warn for denied access, console.info for allowed
    if (logLevel === 'warn') {
      console.warn(message, logData);
    } else {
      console.info(message, logData);
    }
  }
}

/**
 * Local storage audit sink - stores audit logs in browser localStorage
 * 
 * Useful for client-side audit log collection.
 * Note: localStorage has size limits (typically 5-10MB).
 * 
 * @param key - localStorage key to store logs under
 * @param maxEntries - Maximum number of entries to keep (default: 1000)
 */
export class LocalStorageAuditSink implements AuditSink {
  private readonly key: string;
  private readonly maxEntries: number;

  constructor(key: string = 'ngxsmk_audit_logs', maxEntries: number = 1000) {
    this.key = key;
    this.maxEntries = maxEntries;
  }

  /**
   * Logs audit entry to localStorage
   */
  log(entry: AuditLogEntry): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('[Audit] localStorage not available, skipping log');
        return;
      }

      const existing = window.localStorage.getItem(this.key);
      const logs: AuditLogEntry[] = existing ? JSON.parse(existing) : [];

      // Add new entry
      logs.push(entry);

      // Keep only the most recent entries
      if (logs.length > this.maxEntries) {
        logs.splice(0, logs.length - this.maxEntries);
      }

      // Store back to localStorage
      window.localStorage.setItem(this.key, JSON.stringify(logs));
    } catch (error) {
      console.error('[Audit] Failed to write to localStorage:', error);
    }
  }

  /**
   * Retrieves all audit logs from localStorage
   */
  getLogs(): AuditLogEntry[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return [];
      }

      const existing = window.localStorage.getItem(this.key);
      return existing ? JSON.parse(existing) : [];
    } catch (error) {
      console.error('[Audit] Failed to read from localStorage:', error);
      return [];
    }
  }

  /**
   * Clears all audit logs from localStorage
   */
  clearLogs(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      window.localStorage.removeItem(this.key);
    } catch (error) {
      console.error('[Audit] Failed to clear localStorage:', error);
    }
  }
}

/**
 * Remote API audit sink - sends audit logs to a remote API endpoint
 * 
 * @param endpoint - API endpoint URL to send logs to
 * @param options - Optional configuration
 */
export interface RemoteApiAuditSinkOptions {
  /**
   * API endpoint URL
   */
  endpoint: string;
  /**
   * HTTP method to use (default: 'POST')
   */
  method?: 'POST' | 'PUT' | 'PATCH';
  /**
   * Custom headers to include in the request
   */
  headers?: Record<string, string>;
  /**
   * Timeout in milliseconds (default: 5000)
   */
  timeout?: number;
  /**
   * Whether to batch multiple logs (default: false)
   */
  batch?: boolean;
  /**
   * Batch size if batching is enabled (default: 10)
   */
  batchSize?: number;
  /**
   * Batch flush interval in milliseconds (default: 5000)
   */
  batchInterval?: number;
}

export class RemoteApiAuditSink implements AuditSink {
  private readonly endpoint: string;
  private readonly method: string;
  private readonly headers: Record<string, string>;
  private readonly timeout: number;
  private readonly batch: boolean;
  private readonly batchSize: number;
  private readonly batchInterval: number;
  private batchQueue: AuditLogEntry[] = [];
  private batchTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: RemoteApiAuditSinkOptions) {
    this.endpoint = options.endpoint;
    this.method = options.method || 'POST';
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    this.timeout = options.timeout || 5000;
    this.batch = options.batch || false;
    this.batchSize = options.batchSize || 10;
    this.batchInterval = options.batchInterval || 5000;

    if (this.batch) {
      this.startBatchTimer();
    }
  }

  /**
   * Logs audit entry to remote API
   */
  async log(entry: AuditLogEntry): Promise<void> {
    if (this.batch) {
      this.batchQueue.push(entry);
      if (this.batchQueue.length >= this.batchSize) {
        await this.flushBatch();
      }
    } else {
      await this.sendLog(entry);
    }
  }

  /**
   * Sends a single log entry to the API
   */
  private async sendLog(entry: AuditLogEntry): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.endpoint, {
        method: this.method,
        headers: this.headers,
        body: JSON.stringify(entry),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[Audit] API request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[Audit] API request timeout');
      } else {
        console.error('[Audit] Failed to send log to API:', error);
      }
    }
  }

  /**
   * Starts the batch timer
   */
  private startBatchTimer(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.batchTimer = setInterval(() => {
      if (this.batchQueue.length > 0) {
        this.flushBatch();
      }
    }, this.batchInterval);
  }

  /**
   * Flushes the batch queue
   */
  private async flushBatch(): Promise<void> {
    if (this.batchQueue.length === 0) {
      return;
    }

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.endpoint, {
        method: this.method,
        headers: this.headers,
        body: JSON.stringify(batch),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[Audit] Batch API request failed: ${response.status} ${response.statusText}`);
        // Re-queue failed entries (optional - could cause duplicates)
        // this.batchQueue.unshift(...batch);
      }
    } catch (error) {
      console.error('[Audit] Failed to send batch to API:', error);
      // Re-queue failed entries (optional - could cause duplicates)
      // this.batchQueue.unshift(...batch);
    }
  }

  /**
   * Flushes any pending batch logs
   * Call this before destroying the sink
   */
  async flush(): Promise<void> {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    await this.flushBatch();
  }
}

