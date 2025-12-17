import { createMiddleware } from '../helpers';
import { MiddlewareContext, MiddlewarePriority } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  timestamp: number;
  method?: string;
  url?: string;
  path?: string;
  userId?: string;
  userAgent?: string;
  ip?: string;
  duration?: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Analytics sink interface
 */
export interface AnalyticsSink {
  track(event: AnalyticsEvent): void | Promise<void>;
}

/**
 * Configuration options for analytics middleware
 */
export interface AnalyticsMiddlewareOptions {
  /**
   * Analytics sink to send events to
   */
  sink?: AnalyticsSink;
  /**
   * Whether to track metrics
   * Default: true
   */
  trackMetrics?: boolean;
  /**
   * Whether to include user information
   * Default: false (privacy)
   */
  includeUserInfo?: boolean;
  /**
   * Custom event transformer
   */
  transformEvent?: (context: MiddlewareContext, success: boolean, duration?: number) => AnalyticsEvent;
  /**
   * Whether to track only failures
   * Default: false
   */
  trackOnlyFailures?: boolean;
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
 * Gets user agent from context
 */
function getUserAgent(context: MiddlewareContext): string | null {
  const request = context['request'] as HttpRequest<unknown> | undefined;
  if (request) {
    return request.headers.get('user-agent') || null;
  }
  return null;
}

/**
 * Creates middleware that tracks request analytics
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const analyticsMiddleware = createAnalyticsMiddleware({
 *   sink: {
 *     track: async (event) => {
 *       await sendToAnalyticsService(event);
 *     }
 *   },
 *   trackMetrics: true
 * });
 * ```
 */
export function createAnalyticsMiddleware(
  options: AnalyticsMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    sink,
    trackMetrics = true,
    includeUserInfo = false,
    transformEvent,
    trackOnlyFailures = false,
  } = options;

  return createMiddleware('analytics', async (context: MiddlewareContext) => {
    // Analytics should run last (low priority) to not block requests
    const startTime = Date.now();

    // Execute next middleware (this is a pass-through)
    // In a real implementation, you'd wrap the actual middleware execution
    const result = true; // This would be the result of the middleware chain

    if (!trackMetrics || !sink) {
      return result;
    }

    const duration = Date.now() - startTime;
    const success = result === true;

    // Skip tracking if only failures and this is a success
    if (trackOnlyFailures && success) {
      return result;
    }

    // Create event
    let event: AnalyticsEvent;

    if (transformEvent) {
      event = transformEvent(context, success, duration);
    } else {
      const request = context['request'] as HttpRequest<unknown> | undefined;
      const method = request?.method;
      const url = request?.url;
      const path = context['path'] as string | undefined;
      const userAgent = getUserAgent(context);
      const ip = getClientIP(context);
      
      event = {
        timestamp: Date.now(),
        ...(method !== undefined && { method }),
        ...(url !== undefined && { url }),
        ...(path !== undefined && { path }),
        ...(userAgent !== null && userAgent !== undefined && { userAgent }),
        ...(ip !== null && ip !== undefined && { ip }),
        duration,
        success,
        metadata: {},
      };

      if (includeUserInfo) {
        const userId = (context['user'] as { id?: string } | undefined)?.id;
        if (userId !== undefined) {
          event.userId = userId;
        }
      }
    }

    // Send to sink
    if (sink) {
      try {
        await Promise.resolve(sink.track(event));
      } catch (error) {
        // Don't fail the request if analytics fails
        console.error('Analytics tracking failed:', error);
      }
    }

    return result;
  }, { priority: MiddlewarePriority.Low });
}

