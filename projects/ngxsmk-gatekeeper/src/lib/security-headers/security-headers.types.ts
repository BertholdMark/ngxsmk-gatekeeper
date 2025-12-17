/**
 * Security headers types and utilities
 */

/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  /**
   * Headers to inject into HTTP requests
   * Key-value pairs where key is the header name and value is the header value
   */
  headers: Record<string, string | (() => string)>;
  /**
   * Whether to overwrite existing headers with the same name
   * Default: false (existing headers take precedence)
   */
  overwrite?: boolean;
}

/**
 * Internal key used to store headers in middleware context
 */
export const SECURITY_HEADERS_KEY = '_securityHeaders';

/**
 * Headers entry in context
 */
export interface SecurityHeadersEntry {
  headers: Record<string, string>;
  overwrite: boolean;
}

