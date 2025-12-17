/**
 * WebSocket client for real-time observability
 */

import {
  WebSocketMessage,
  WebSocketMessageType,
  ObservabilityEventUnion,
  SubscribeRequest,
  AggregatedStats,
} from './observability.types';

/**
 * WebSocket client options
 */
export interface WebSocketClientOptions {
  /** WebSocket server URL */
  url: string;
  /** Reconnection interval (ms) */
  reconnectInterval?: number;
  /** Maximum reconnection attempts */
  maxReconnectAttempts?: number;
  /** Connection timeout (ms) */
  connectionTimeout?: number;
}

/**
 * WebSocket client event handlers
 */
export interface WebSocketClientHandlers {
  /** Called when connection is established */
  onOpen?: () => void;
  /** Called when connection is closed */
  onClose?: () => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
  /** Called when an observability event is received */
  onEvent?: (event: ObservabilityEventUnion) => void;
  /** Called when aggregated stats are received */
  onStats?: (stats: AggregatedStats) => void;
}

/**
 * WebSocket client for observability
 */
export class ObservabilityWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private connectionTimeout: number;
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private pingTimer: any = null;
  private handlers: WebSocketClientHandlers;
  private subscribedEventTypes: ObservabilityEventUnion['type'][] = [];
  private isConnected = false;

  constructor(options: WebSocketClientOptions, handlers: WebSocketClientHandlers = {}) {
    this.url = options.url;
    this.reconnectInterval = options.reconnectInterval ?? 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
    this.connectionTimeout = options.connectionTimeout ?? 10000;
    this.handlers = handlers;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      const timeout = setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          this.ws?.close();
          this.handlers.onError?.(new Error('Connection timeout'));
        }
      }, this.connectionTimeout);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.handlers.onOpen?.();

        // Resubscribe to previous subscriptions
        if (this.subscribedEventTypes.length > 0) {
          this.subscribe({ eventTypes: this.subscribedEventTypes });
        }

        // Start ping interval
        this.startPingInterval();
      };

      this.ws.onclose = () => {
        clearTimeout(timeout);
        this.isConnected = false;
        this.stopPingInterval();
        this.handlers.onClose?.();

        // Attempt reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        clearTimeout(timeout);
        this.handlers.onError?.(new Error('WebSocket error'));
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      this.handlers.onError?.(error as Error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopPingInterval();
    this.clearReconnectTimer();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  /**
   * Subscribe to events
   */
  subscribe(request: SubscribeRequest): void {
    if (!this.isConnected || !this.ws) {
      return;
    }

    if (request.eventTypes) {
      this.subscribedEventTypes = request.eventTypes;
    }

    const message: WebSocketMessage = {
      type: WebSocketMessageType.SUBSCRIBE,
      payload: request,
      timestamp: Date.now(),
    };

    this.send(message);
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(): void {
    if (!this.isConnected || !this.ws) {
      return;
    }

    const message: WebSocketMessage = {
      type: WebSocketMessageType.UNSUBSCRIBE,
      timestamp: Date.now(),
    };

    this.send(message);
    this.subscribedEventTypes = [];
  }

  /**
   * Request aggregated statistics
   */
  requestStats(timeRange?: { start: number; end: number }): void {
    if (!this.isConnected || !this.ws) {
      return;
    }

    const message: WebSocketMessage = {
      type: WebSocketMessageType.SUBSCRIBE,
      payload: {
        eventTypes: [],
        requestStats: true,
        timeRange,
      },
      timestamp: Date.now(),
    };

    this.send(message);
  }

  /**
   * Send a message
   */
  private send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case WebSocketMessageType.EVENT:
        if (message.payload) {
          this.handlers.onEvent?.(message.payload as ObservabilityEventUnion);
        }
        break;

      case WebSocketMessageType.AGGREGATE:
        if (message.payload) {
          this.handlers.onStats?.(message.payload as AggregatedStats);
        }
        break;

      case WebSocketMessageType.PING:
        this.send({ type: WebSocketMessageType.PONG, timestamp: Date.now() });
        break;

      case WebSocketMessageType.ERROR:
        this.handlers.onError?.(new Error(String(message.payload)));
        break;

      default:
        break;
    }
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Start ping interval
   */
  private startPingInterval(): void {
    this.stopPingInterval();
    this.pingTimer = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: WebSocketMessageType.PING, timestamp: Date.now() });
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }
}

