import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Log level
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log format
 */
export type LogFormat = 'json' | 'text' | 'pretty';

/**
 * Configuration options for request logging middleware
 */
export interface RequestLoggingMiddlewareOptions {
  /**
   * Log level
   * Default: 'info'
   */
  logLevel?: LogLevel;
  /**
   * Whether to include request body
   * Default: false (privacy/security)
   */
  includeBody?: boolean;
  /**
   * Whether to include headers
   * Default: true
   */
  includeHeaders?: boolean;
  /**
   * Whether to include query parameters
   * Default: true
   */
  includeQuery?: boolean;
  /**
   * Log format
   * Default: 'json'
   */
  format?: LogFormat;
  /**
   * Custom logger function
   */
  logger?: (level: LogLevel, message: string, data?: unknown) => void;
  /**
   * Sensitive headers to redact
   * Default: ['authorization', 'cookie', 'x-api-key']
   */
  sensitiveHeaders?: string[];
  /**
   * Whether to log only failures
   * Default: false
   */
  logOnlyFailures?: boolean;
}

/**
 * Redacts sensitive information from headers
 */
function redactHeaders(
  headers: Headers | Record<string, string>,
  sensitiveHeaders: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  const sensitive = sensitiveHeaders.map(h => h.toLowerCase());

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      if (sensitive.includes(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = value;
      }
    });
  } else {
    for (const [key, value] of Object.entries(headers)) {
      if (sensitive.includes(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Formats log message
 */
function formatLog(
  level: LogLevel,
  message: string,
  data: unknown,
  format: LogFormat
): string {
  switch (format) {
    case 'json':
      return JSON.stringify({ level, message, ...(data as Record<string, unknown>) });
    case 'pretty':
      return `${level.toUpperCase()}: ${message}\n${JSON.stringify(data, null, 2)}`;
    case 'text':
    default:
      return `[${level.toUpperCase()}] ${message} ${JSON.stringify(data)}`;
  }
}

/**
 * Creates middleware that logs request information
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const loggingMiddleware = createRequestLoggingMiddleware({
 *   logLevel: 'info',
 *   includeBody: false,
 *   includeHeaders: true,
 *   format: 'json'
 * });
 * ```
 */
export function createRequestLoggingMiddleware(
  options: RequestLoggingMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    logLevel = 'info',
    includeBody = false,
    includeHeaders = true,
    includeQuery = true,
    format = 'json',
    logger = (level, message, data) => {
      const formatted = formatLog(level, message, data, format);
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](formatted);
    },
    sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-csrf-token'],
    logOnlyFailures = false,
  } = options;

  return createMiddleware('request-logging', (context: MiddlewareContext) => {
    const request = context['request'] as HttpRequest<unknown> | undefined;
    const logData: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      path: context['path'] || request?.url,
      method: request?.method,
    };

    if (includeQuery && context['queryParams']) {
      logData['queryParams'] = context['queryParams'];
    }

    if (includeHeaders && request) {
      const headers: Record<string, string> = {};
      request.headers.keys().forEach(key => {
        const value = request.headers.get(key);
        if (value) {
          headers[key] = value;
        }
      });
      const redacted = redactHeaders(headers, sensitiveHeaders);
      logData['headers'] = redacted;
    }

    if (includeBody && request?.body) {
      logData['body'] = request.body;
    }

    if (context['user']) {
      const userId = (context['user'] as { id?: string }).id;
      if (userId) {
        logData['userId'] = userId;
      }
    }

    // This is a pass-through middleware
    // In real implementation, you'd log after middleware execution
    const success = true; // This would be the actual result

    if (logOnlyFailures && success) {
      return success;
    }

    logger(logLevel, 'Request processed', logData);

    return success;
  });
}

