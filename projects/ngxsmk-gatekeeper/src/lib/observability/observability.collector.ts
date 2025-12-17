/**
 * Observability event collector
 * 
 * Collects events from middleware execution and aggregates them
 */

import {
  ObservabilityEventType,
  ObservabilityEventUnion,
  MiddlewareExecutionEvent,
  ChainExecutionEvent,
  ErrorEvent,
  MetricEvent,
  AggregatedStats,
} from './observability.types';
import { MiddlewareContext } from '../core';

/**
 * Event collector interface
 */
export interface EventCollector {
  /**
   * Collect an event
   */
  collect(event: ObservabilityEventUnion): void;

  /**
   * Get aggregated statistics
   */
  getStats(timeRange?: { start: number; end: number }): AggregatedStats;

  /**
   * Get recent events
   */
  getRecentEvents(limit?: number): ObservabilityEventUnion[];

  /**
   * Clear collected events
   */
  clear(): void;
}

/**
 * In-memory event collector implementation
 */
export class InMemoryEventCollector implements EventCollector {
  private events: ObservabilityEventUnion[] = [];
  private maxEvents: number;

  constructor(maxEvents: number = 1000) {
    this.maxEvents = maxEvents;
  }

  collect(event: ObservabilityEventUnion): void {
    this.events.push(event);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  getStats(timeRange?: { start: number; end: number }): AggregatedStats {
    const now = Date.now();
    const start = timeRange?.start ?? now - 60000; // Default: last minute
    const end = timeRange?.end ?? now;

    const filteredEvents = this.events.filter(
      (e) => e.timestamp >= start && e.timestamp <= end
    );

    const chainEndEvents = filteredEvents.filter(
      (e): e is ChainExecutionEvent =>
        e.type === ObservabilityEventType.CHAIN_END
    );

    const totalRequests = chainEndEvents.length;
    const successfulRequests = chainEndEvents.filter((e) => e.result === true).length;
    const failedRequests = totalRequests - successfulRequests;

    const totalDuration = chainEndEvents.reduce(
      (sum, e) => sum + (e.totalDuration ?? 0),
      0
    );
    const averageResponseTime = totalRequests > 0 ? totalDuration / totalRequests : 0;

    // Middleware statistics
    const middlewareMap = new Map<string, {
      executionCount: number;
      totalDuration: number;
      minDuration: number;
      maxDuration: number;
      errorCount: number;
    }>();

    filteredEvents.forEach((event) => {
      if (event.type === ObservabilityEventType.MIDDLEWARE_END) {
        const mwEvent = event as MiddlewareExecutionEvent;
        const name = mwEvent.middlewareName;
        const duration = mwEvent.duration ?? 0;

        if (!middlewareMap.has(name)) {
          middlewareMap.set(name, {
            executionCount: 0,
            totalDuration: 0,
            minDuration: Infinity,
            maxDuration: 0,
            errorCount: 0,
          });
        }

        const stats = middlewareMap.get(name)!;
        stats.executionCount++;
        stats.totalDuration += duration;
        stats.minDuration = Math.min(stats.minDuration, duration);
        stats.maxDuration = Math.max(stats.maxDuration, duration);
        if (mwEvent.error) {
          stats.errorCount++;
        }
      }
    });

    const middlewareStats = Array.from(middlewareMap.entries()).map(([name, stats]) => ({
      name,
      executionCount: stats.executionCount,
      averageDuration: stats.executionCount > 0 ? stats.totalDuration / stats.executionCount : 0,
      minDuration: stats.minDuration === Infinity ? 0 : stats.minDuration,
      maxDuration: stats.maxDuration,
      errorCount: stats.errorCount,
    }));

    // Error breakdown
    const errorMap = new Map<string, number>();
    filteredEvents.forEach((event) => {
      if (event.type === ObservabilityEventType.ERROR) {
        const errorEvent = event as ErrorEvent;
        const type = errorEvent.source;
        errorMap.set(type, (errorMap.get(type) ?? 0) + 1);
      } else if (
        event.type === ObservabilityEventType.MIDDLEWARE_END ||
        event.type === ObservabilityEventType.CHAIN_END
      ) {
        const execEvent = event as MiddlewareExecutionEvent | ChainExecutionEvent;
        if ('error' in execEvent && execEvent.error) {
          const type = execEvent.error;
          errorMap.set(type, (errorMap.get(type) ?? 0) + 1);
        }
      }
    });

    const errorBreakdown = Array.from(errorMap.entries()).map(([type, count]) => ({
      type,
      count,
    }));

    // Performance metrics
    const metrics: Array<{ name: string; value: number; unit: string }> = [];
    filteredEvents.forEach((event) => {
      if (event.type === ObservabilityEventType.METRIC) {
        const metricEvent = event as MetricEvent;
        metrics.push({
          name: metricEvent.metricName,
          value: metricEvent.value,
          unit: metricEvent.unit ?? 'ms',
        });
      }
    });

    return {
      timeRange: { start, end },
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      middlewareStats,
      errorBreakdown,
      performanceMetrics: metrics,
    };
  }

  getRecentEvents(limit: number = 100): ObservabilityEventUnion[] {
    return this.events.slice(-limit);
  }

  clear(): void {
    this.events = [];
  }
}

/**
 * Create a sanitized context for observability
 */
export function sanitizeContext(context: MiddlewareContext): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  // Extract safe properties
  if ('route' in context && context['route']) {
    const route = context['route'] as any;
    sanitized['route'] = {
      path: route.path,
      data: route.data,
    };
  }

  if ('request' in context && context['request']) {
    const req = context['request'] as any;
    sanitized['request'] = {
      method: req.method,
      url: req.url,
      headers: req.headers ? Object.keys(req.headers) : [],
    };
  }

  // Extract user info (sanitized)
  if ('user' in context && context['user']) {
    const user = context['user'] as any;
    sanitized['user'] = {
      id: user.id,
      roles: user.roles,
      // Don't include sensitive data
    };
  }

  return sanitized;
}

