import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * IP address matching utilities
 */
function isIPInRange(ip: string, range: string): boolean {
  if (range.includes('/')) {
    // CIDR notation (e.g., 192.168.1.0/24)
    return isIPInCIDR(ip, range);
  }
  // Exact match
  return ip === range;
}

function isIPInCIDR(ip: string, cidr: string): boolean {
  const parts = cidr.split('/');
  if (parts.length !== 2) {
    return false;
  }
  const [network, prefixLengthStr] = parts;
  if (!network || !prefixLengthStr) {
    return false;
  }
  const prefix = parseInt(prefixLengthStr, 10);
  
  const ipParts = ip.split('.').map(Number);
  const networkParts = network.split('.').map(Number);
  
  if (ipParts.length !== 4 || networkParts.length !== 4) {
    return false;
  }
  
  const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
  const ipNum = (ipParts[0]! << 24) + (ipParts[1]! << 16) + (ipParts[2]! << 8) + ipParts[3]!;
  const networkNum = (networkParts[0]! << 24) + (networkParts[1]! << 16) + (networkParts[2]! << 8) + networkParts[3]!;
  
  return (ipNum & mask) === (networkNum & mask);
}

function getClientIP(context: MiddlewareContext): string | null {
  // Try to get IP from various sources
  const request = context['request'] as HttpRequest<unknown> | undefined;
  if (request) {
    // Check headers (common in reverse proxy setups)
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0]?.trim() || null;
    }
    
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }
    
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
      return cfConnectingIP;
    }
  }
  
  // Check context for IP
  const contextIP = context['ip'] as string | undefined;
  if (contextIP) {
    return contextIP;
  }
  
  if (typeof window !== 'undefined') {
    return null;
  }
  
  return null;
}

/**
 * Configuration options for IP whitelist middleware
 */
export interface IPWhitelistMiddlewareOptions {
  /**
   * List of allowed IP addresses or CIDR ranges
   * Examples: ['192.168.1.1', '10.0.0.0/8', '172.16.0.0/12']
   */
  allowedIPs: string[];
  /**
   * Action to take when IP is not whitelisted
   * 'block' - Deny access (default)
   * 'redirect' - Redirect to specified URL
   */
  blockMode?: 'block' | 'redirect';
  /**
   * Redirect URL when blockMode is 'redirect'
   */
  redirect?: string;
  /**
   * Custom message when access is denied
   */
  message?: string;
}

/**
 * Configuration options for IP blacklist middleware
 */
export interface IPBlacklistMiddlewareOptions {
  /**
   * List of blocked IP addresses or CIDR ranges
   */
  blockedIPs: string[];
  /**
   * Reason for blocking (for logging)
   */
  reason?: string;
  /**
   * Redirect URL when IP is blocked
   */
  redirect?: string;
  /**
   * Custom message when access is denied
   */
  message?: string;
}

/**
 * Creates middleware that only allows requests from whitelisted IP addresses
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const whitelistMiddleware = createIPWhitelistMiddleware({
 *   allowedIPs: ['192.168.1.1', '10.0.0.0/8'],
 *   blockMode: 'redirect',
 *   redirect: '/access-denied'
 * });
 * ```
 */
export function createIPWhitelistMiddleware(
  options: IPWhitelistMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    allowedIPs,
    blockMode = 'block',
    redirect,
    message = 'Access denied: IP address not whitelisted',
  } = options;

  return createMiddleware('ip-whitelist', (context: MiddlewareContext) => {
    const clientIP = getClientIP(context);
    
    if (!clientIP) {
      // If IP cannot be determined, deny access for security
      if (blockMode === 'redirect' && redirect) {
        return {
          allow: false,
          redirect,
          reason: 'IP address could not be determined',
        };
      }
      return false;
    }

    // Check if IP is in whitelist
    const isAllowed = allowedIPs.some(range => isIPInRange(clientIP, range));

    if (!isAllowed) {
      if (blockMode === 'redirect' && redirect) {
        return {
          allow: false,
          redirect,
          reason: message,
        };
      }
      return false;
    }

    return true;
  });
}

/**
 * Creates middleware that blocks requests from blacklisted IP addresses
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const blacklistMiddleware = createIPBlacklistMiddleware({
 *   blockedIPs: ['1.2.3.4', '5.6.7.8'],
 *   reason: 'Suspicious activity',
 *   redirect: '/blocked'
 * });
 * ```
 */
export function createIPBlacklistMiddleware(
  options: IPBlacklistMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    blockedIPs,
    reason = 'Access denied',
    redirect,
    message = 'Access denied: IP address is blocked',
  } = options;

  return createMiddleware('ip-blacklist', (context: MiddlewareContext) => {
    const clientIP = getClientIP(context);
    
    if (!clientIP) {
      return true;
    }

    // Check if IP is in blacklist
    const isBlocked = blockedIPs.some(range => isIPInRange(clientIP, range));

    if (isBlocked) {
      // Log the block reason
      if (reason) {
        console.warn(`IP ${clientIP} blocked: ${reason}`);
      }
      
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: message,
        };
      }
      return false;
    }

    return true;
  });
}

