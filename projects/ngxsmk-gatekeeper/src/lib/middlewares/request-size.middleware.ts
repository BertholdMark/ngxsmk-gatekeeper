import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Parses size string to bytes
 * Examples: '10mb', '1kb', '500b'
 */
function parseSize(size: string): number {
  const match = size.match(/^(\d+)([kmg]?b)$/i);
  if (!match || !match[1] || !match[2]) {
    return 0;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'kb':
      return value * 1024;
    case 'mb':
      return value * 1024 * 1024;
    case 'gb':
      return value * 1024 * 1024 * 1024;
    case 'b':
    default:
      return value;
  }
}

/**
 * Gets size of data in bytes
 */
function getDataSize(data: unknown): number {
  if (data === null || data === undefined) {
    return 0;
  }

  if (typeof data === 'string') {
    return new Blob([data]).size;
  }

  if (data instanceof Blob) {
    return data.size;
  }
  if (data instanceof ArrayBuffer) {
    return data.byteLength;
  }

  if (typeof data === 'object') {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }

  return String(data).length;
}

/**
 * Configuration options for request size limit middleware
 */
export interface RequestSizeMiddlewareOptions {
  /**
   * Maximum body size
   * Examples: '10mb', '1kb', '500b'
   */
  maxBodySize?: string;
  /**
   * Maximum query string size
   */
  maxQuerySize?: string;
  /**
   * Maximum header size
   */
  maxHeaderSize?: string;
  /**
   * Maximum URL size
   */
  maxUrlSize?: string;
  /**
   * Redirect URL when size limit exceeded
   */
  redirect?: string;
  /**
   * Custom error message
   */
  message?: string;
}

/**
 * Creates middleware that enforces request size limits
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const sizeLimitMiddleware = createRequestSizeMiddleware({
 *   maxBodySize: '10mb',
 *   maxQuerySize: '1kb',
 *   maxHeaderSize: '8kb'
 * });
 * ```
 */
export function createRequestSizeMiddleware(
  options: RequestSizeMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    maxBodySize,
    maxQuerySize,
    maxHeaderSize,
    maxUrlSize,
    redirect,
    message = 'Request size limit exceeded',
  } = options;

  return createMiddleware('request-size', (context: MiddlewareContext) => {
    const request = context['request'] as HttpRequest<unknown> | undefined;
    if (!request) {
      // Not an HTTP request, skip size check
      return true;
    }

    // Check body size
    if (maxBodySize) {
      const body = request.body;
      const bodySize = getDataSize(body);
      const maxSize = parseSize(maxBodySize);
      if (bodySize > maxSize) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: `${message}: Body size ${bodySize} exceeds limit ${maxBodySize}`,
          };
        }
        return false;
      }
    }

    // Check query string size
    if (maxQuerySize) {
      const url = new URL(request.url, 'http://localhost');
      const queryString = url.search;
      const querySize = queryString.length;
      const maxSize = parseSize(maxQuerySize);
      if (querySize > maxSize) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: `${message}: Query string size ${querySize} exceeds limit ${maxQuerySize}`,
          };
        }
        return false;
      }
    }

    // Check header size
    if (maxHeaderSize) {
      const headerEntries: Array<[string, string]> = [];
      request.headers.keys().forEach(key => {
        const value = request.headers.get(key);
        if (value) {
          headerEntries.push([key, value]);
        }
      });
      const headers = headerEntries
        .map(([key, value]) => `${key}: ${value}`)
        .join('\r\n');
      const headerSize = headers.length;
      const maxSize = parseSize(maxHeaderSize);
      if (headerSize > maxSize) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: `${message}: Header size ${headerSize} exceeds limit ${maxHeaderSize}`,
          };
        }
        return false;
      }
    }

    // Check URL size
    if (maxUrlSize) {
      const urlSize = request.url?.length || 0;
      const maxSize = parseSize(maxUrlSize);
      if (urlSize > maxSize) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: `${message}: URL size ${urlSize} exceeds limit ${maxUrlSize}`,
          };
        }
        return false;
      }
    }

    return true;
  });
}

