import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Configuration options for user agent middleware
 */
export interface UserAgentMiddlewareOptions {
  /**
   * Allowed user agent patterns (regex)
   * Example: [/Chrome/, /Firefox/]
   */
  allowedAgents?: RegExp[];
  /**
   * Blocked user agent patterns (regex)
   */
  blockedAgents?: RegExp[];
  /**
   * Whether to block bots
   * Default: false
   */
  blockBots?: boolean;
  /**
   * Bot user agent patterns
   */
  botPatterns?: RegExp[];
  /**
   * Redirect URL when user agent is blocked
   */
  redirect?: string;
  /**
   * Custom message when user agent is blocked
   */
  message?: string;
}

/**
 * Default bot patterns
 */
const DEFAULT_BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
];

/**
 * Creates middleware that validates user agents
 *
 * @param options - Configuration options
 * @returns Middleware function
 */
export function createUserAgentMiddleware(
  options: UserAgentMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    allowedAgents,
    blockedAgents,
    blockBots = false,
    botPatterns = DEFAULT_BOT_PATTERNS,
    redirect,
    message = 'Access denied: Unsupported user agent',
  } = options;

  return createMiddleware('user-agent', (context: MiddlewareContext) => {
    const request = context['request'] as HttpRequest<unknown> | undefined;
    if (!request) {
      // Not an HTTP request, skip user agent check
      return true;
    }

    const userAgent = request.headers.get('user-agent') || '';

    // Check blocked agents
    if (blockedAgents && blockedAgents.length > 0) {
      if (blockedAgents.some(pattern => pattern.test(userAgent))) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: message,
          };
        }
        return false;
      }
    }

    // Check bot patterns
    if (blockBots) {
      if (botPatterns.some(pattern => pattern.test(userAgent))) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: 'Bots are not allowed',
          };
        }
        return false;
      }
    }

    // Check allowed agents
    if (allowedAgents && allowedAgents.length > 0) {
      if (!allowedAgents.some(pattern => pattern.test(userAgent))) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: message,
          };
        }
        return false;
      }
    }

    return true;
  });
}

