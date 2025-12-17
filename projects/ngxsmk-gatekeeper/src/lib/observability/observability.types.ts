/**
 * Observability types for real-time monitoring and analytics
 */

/**
 * Event types emitted by the observability system
 */
export enum ObservabilityEventType {
  /** Middleware execution started */
  MIDDLEWARE_START = 'middleware:start',
  /** Middleware execution completed */
  MIDDLEWARE_END = 'middleware:end',
  /** Chain execution started */
  CHAIN_START = 'chain:start',
  /** Chain execution completed */
  CHAIN_END = 'chain:end',
  /** Error occurred */
  ERROR = 'error',
  /** Performance metric */
  METRIC = 'metric',
  /** Analytics event */
  ANALYTICS = 'analytics',
  /** Health check */
  HEALTH = 'health',
}

/**
 * Base observability event
 */
export interface ObservabilityEvent {
  /** Event type */
  type: ObservabilityEventType;
  /** Timestamp */
  timestamp: number;
  /** Event ID */
  id: string;
  /** Session ID */
  sessionId: string;
}

/**
 * Middleware execution event
 */
export interface MiddlewareExecutionEvent extends ObservabilityEvent {
  type: ObservabilityEventType.MIDDLEWARE_START | ObservabilityEventType.MIDDLEWARE_END;
  /** Middleware name */
  middlewareName: string;
  /** Middleware index in chain */
  middlewareIndex: number;
  /** Context type */
  contextType: 'route' | 'http';
  /** Context path */
  contextPath?: string;
  /** Duration (for END events) */
  duration?: number;
  /** Result (for END events) */
  result?: boolean;
  /** Error message (if any) */
  error?: string;
  /** Sanitized context data */
  context?: Record<string, unknown>;
}

/**
 * Chain execution event
 */
export interface ChainExecutionEvent extends ObservabilityEvent {
  type: ObservabilityEventType.CHAIN_START | ObservabilityEventType.CHAIN_END;
  /** Context type */
  contextType: 'route' | 'http';
  /** Context path */
  contextPath?: string;
  /** Number of middlewares in chain */
  middlewareCount?: number;
  /** Result (for END events) */
  result?: boolean;
  /** Stopped at middleware index (for END events) */
  stoppedAt?: number;
  /** Total duration (for END events) */
  totalDuration?: number;
  /** Redirect path (if any) */
  redirect?: string;
  /** Middleware executions (for END events) */
  middlewareExecutions?: Array<{
    name: string;
    index: number;
    duration: number;
    result: boolean;
    error?: string;
  }>;
}

/**
 * Error event
 */
export interface ErrorEvent extends ObservabilityEvent {
  type: ObservabilityEventType.ERROR;
  /** Error message */
  message: string;
  /** Error stack */
  stack?: string;
  /** Error source */
  source: 'middleware' | 'chain' | 'system';
  /** Context */
  context?: Record<string, unknown>;
}

/**
 * Performance metric event
 */
export interface MetricEvent extends ObservabilityEvent {
  type: ObservabilityEventType.METRIC;
  /** Metric name */
  metricName: string;
  /** Metric value */
  value: number;
  /** Metric unit */
  unit?: string;
  /** Metric tags */
  tags?: Record<string, string>;
}

/**
 * Analytics event
 */
export interface AnalyticsObservabilityEvent extends ObservabilityEvent {
  type: ObservabilityEventType.ANALYTICS;
  /** Event name */
  eventName: string;
  /** Event properties */
  properties?: Record<string, unknown>;
  /** User ID */
  userId?: string;
  /** Session ID */
  sessionId: string;
}

/**
 * Health check event
 */
export interface HealthEvent extends ObservabilityEvent {
  type: ObservabilityEventType.HEALTH;
  /** Health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Health checks */
  checks?: Record<string, {
    status: 'pass' | 'fail' | 'warn';
    message?: string;
  }>;
}

/**
 * Union type for all observability events
 */
export type ObservabilityEventUnion =
  | MiddlewareExecutionEvent
  | ChainExecutionEvent
  | ErrorEvent
  | MetricEvent
  | AnalyticsObservabilityEvent
  | HealthEvent;

/**
 * WebSocket message types
 */
export enum WebSocketMessageType {
  /** Client subscribes to events */
  SUBSCRIBE = 'subscribe',
  /** Client unsubscribes from events */
  UNSUBSCRIBE = 'unsubscribe',
  /** Server sends event */
  EVENT = 'event',
  /** Server sends aggregated data */
  AGGREGATE = 'aggregate',
  /** Ping/pong for connection keepalive */
  PING = 'ping',
  PONG = 'pong',
  /** Error message */
  ERROR = 'error',
}

/**
 * WebSocket message
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload?: unknown;
  timestamp?: number;
}

/**
 * Subscription request
 */
export interface SubscribeRequest {
  /** Event types to subscribe to */
  eventTypes?: ObservabilityEventType[];
  /** Filters */
  filters?: {
    contextType?: 'route' | 'http';
    middlewareName?: string;
    contextPath?: string;
  };
}

/**
 * Aggregated statistics
 */
export interface AggregatedStats {
  /** Time range */
  timeRange: {
    start: number;
    end: number;
  };
  /** Total requests */
  totalRequests: number;
  /** Successful requests */
  successfulRequests: number;
  /** Failed requests */
  failedRequests: number;
  /** Average response time */
  averageResponseTime: number;
  /** Middleware statistics */
  middlewareStats: Array<{
    name: string;
    executionCount: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    errorCount: number;
  }>;
  /** Error breakdown */
  errorBreakdown: Array<{
    type: string;
    count: number;
  }>;
  /** Performance metrics */
  performanceMetrics: Array<{
    name: string;
    value: number;
    unit: string;
  }>;
}

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  /** WebSocket server URL */
  websocketUrl?: string;
  /** Enable real-time updates */
  enableRealtime?: boolean;
  /** Update interval (ms) */
  updateInterval?: number;
  /** Maximum events to keep in memory */
  maxEvents?: number;
  /** Enable performance metrics */
  enableMetrics?: boolean;
  /** Enable analytics */
  enableAnalytics?: boolean;
  /** Auto-connect on init */
  autoConnect?: boolean;
}

