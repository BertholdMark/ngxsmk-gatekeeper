import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Configuration options for maintenance mode middleware
 */
export interface MaintenanceModeMiddlewareOptions {
  /**
   * Whether maintenance mode is enabled
   */
  enabled: boolean;
  /**
   * Maintenance message to display
   */
  message?: string;
  /**
   * IP addresses that are allowed during maintenance
   */
  allowedIPs?: string[];
  /**
   * Paths that are exempt from maintenance mode
   * Default: ['/maintenance', '/health']
   */
  exemptPaths?: string[];
  /**
   * Redirect URL when maintenance mode is active
   * Default: '/maintenance'
   */
  redirect?: string;
  /**
   * Custom check function to determine if user should have access
   */
  shouldAllowAccess?: (context: MiddlewareContext) => boolean;
}

/**
 * Gets client IP from context
 */
function getClientIP(context: MiddlewareContext): string | null {
  const request = context['request'] as HttpRequest<unknown> | undefined;
  if (request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0]?.trim() || null;
    }
    return request.headers.get('x-real-ip') || null;
  }
  return (context['ip'] as string | undefined) || null;
}

/**
 * Checks if IP is in allowed list
 */
function isIPAllowed(ip: string | null, allowedIPs: string[]): boolean {
  if (!ip) return false;
  return allowedIPs.some(allowed => {
    if (allowed.includes('/')) {
      // CIDR notation
      return isIPInCIDR(ip, allowed);
    }
    return ip === allowed;
  });
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

/**
 * Creates middleware that enables maintenance mode
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const maintenanceMiddleware = createMaintenanceModeMiddleware({
 *   enabled: process.env.MAINTENANCE_MODE === 'true',
 *   allowedIPs: ['10.0.0.1'], // Admin IPs
 *   message: 'Scheduled maintenance',
 *   redirect: '/maintenance'
 * });
 * ```
 */
export function createMaintenanceModeMiddleware(
  options: MaintenanceModeMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    enabled,
    message = 'Scheduled maintenance in progress',
    allowedIPs = [],
    exemptPaths = ['/maintenance', '/health'],
    redirect = '/maintenance',
    shouldAllowAccess,
  } = options;

  return createMiddleware('maintenance-mode', (context: MiddlewareContext) => {
    if (!enabled) {
      return true;
    }

    // Check if path is exempt
    const request = context['request'] as HttpRequest<unknown> | undefined;
    const url = (context['url'] || request?.url || '') as string;
    if (exemptPaths.some(path => url.includes(path))) {
      return true;
    }

    // Check custom access function
    if (shouldAllowAccess && shouldAllowAccess(context)) {
      return true;
    }

    // Check if IP is allowed
    if (allowedIPs.length > 0) {
      const clientIP = getClientIP(context);
      if (clientIP && isIPAllowed(clientIP, allowedIPs)) {
        return true;
      }
    }

    // Maintenance mode is active, redirect
    return {
      allow: false,
      redirect,
      reason: message,
    };
  });
}

