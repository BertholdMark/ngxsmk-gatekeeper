# Real-time Observability Dashboard

Real-time monitoring and analytics for ngxsmk-gatekeeper middleware execution.

## Overview

The observability system provides:

- **Real-time event streaming** via WebSocket
- **Performance metrics** and analytics
- **Middleware execution tracking**
- **Error monitoring**
- **Aggregated statistics**

## Quick Start

### 1. Install Dependencies

```bash
npm install ngxsmk-gatekeeper
```

### 2. Configure Observability

```typescript
import { provideObservability } from 'ngxsmk-gatekeeper/lib/observability';

bootstrapApplication(AppComponent, {
  providers: [
    provideObservability({
      websocketUrl: 'ws://localhost:8080',
      enableRealtime: true,
      enableMetrics: true,
      enableAnalytics: true,
      autoConnect: true,
    }),
  ],
});
```

### 3. Use in Your Application

```typescript
import { ObservabilityService } from 'ngxsmk-gatekeeper/lib/observability';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div *ngIf="connected$ | async">
      <h2>Observability Dashboard</h2>
      <div *ngIf="stats$ | async as stats">
        <p>Total Requests: {{ stats.totalRequests }}</p>
        <p>Success Rate: {{ (stats.successfulRequests / stats.totalRequests * 100).toFixed(1) }}%</p>
        <p>Avg Response Time: {{ stats.averageResponseTime.toFixed(2) }}ms</p>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  stats$ = this.observability.stats$;
  connected$ = this.observability.connected$;

  constructor(private observability: ObservabilityService) {}

  ngOnInit() {
    // Request stats every 5 seconds
    setInterval(() => {
      this.observability.requestStats();
    }, 5000);
  }
}
```

## WebSocket Server

You'll need a WebSocket server to receive and broadcast events. See the [WebSocket Server Example](#websocket-server-example) section.

### Example Server Setup

```typescript
// server.ts
import WebSocket from 'ws';
import { WebSocketMessage, WebSocketMessageType, ObservabilityEventUnion } from 'ngxsmk-gatekeeper/lib/observability';

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (data: string) => {
    const message: WebSocketMessage = JSON.parse(data);
    // Handle subscription, etc.
  });
});

// Broadcast events to all connected clients
export function broadcastEvent(event: ObservabilityEventUnion) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: WebSocketMessageType.EVENT,
        payload: event,
        timestamp: Date.now(),
      }));
    }
  });
}
```

## Integration with Middleware

The observability system automatically tracks middleware execution when integrated. You can manually integrate using the integration hooks:

```typescript
import { createObservabilityHooks } from 'ngxsmk-gatekeeper/lib/observability';
import { ObservabilityService } from 'ngxsmk-gatekeeper/lib/observability';

const observability = inject(ObservabilityService);
const hooks = createObservabilityHooks({
  service: observability,
  contextType: 'route',
  contextPath: '/admin',
});

// Use hooks in your middleware execution
hooks.onChainStart(context, middlewares.length);
// ... execute middlewares ...
hooks.onChainEnd(context, result, stoppedAt, duration);
```

## Event Types

The observability system emits the following event types:

- `MIDDLEWARE_START` - Middleware execution started
- `MIDDLEWARE_END` - Middleware execution completed
- `CHAIN_START` - Chain execution started
- `CHAIN_END` - Chain execution completed
- `ERROR` - Error occurred
- `METRIC` - Performance metric
- `ANALYTICS` - Analytics event
- `HEALTH` - Health check

## Aggregated Statistics

The service provides aggregated statistics including:

- Total requests
- Success/failure rates
- Average response times
- Middleware performance metrics
- Error breakdown
- Performance metrics

```typescript
const stats = observability.getStats({
  start: Date.now() - 60000, // Last minute
  end: Date.now(),
});

console.log('Total Requests:', stats.totalRequests);
console.log('Success Rate:', stats.successfulRequests / stats.totalRequests);
console.log('Avg Response Time:', stats.averageResponseTime);
```

## WebSocket Client API

### Connection

```typescript
const client = new ObservabilityWebSocketClient(
  { url: 'ws://localhost:8080' },
  {
    onOpen: () => console.log('Connected'),
    onClose: () => console.log('Disconnected'),
    onError: (error) => console.error('Error:', error),
    onEvent: (event) => console.log('Event:', event),
    onStats: (stats) => console.log('Stats:', stats),
  }
);

client.connect();
```

### Subscription

```typescript
// Subscribe to specific event types
client.subscribe({
  eventTypes: [
    ObservabilityEventType.CHAIN_END,
    ObservabilityEventType.MIDDLEWARE_END,
  ],
  filters: {
    contextType: 'route',
    middlewareName: 'auth',
  },
});
```

### Request Statistics

```typescript
// Request aggregated statistics
client.requestStats({
  start: Date.now() - 3600000, // Last hour
  end: Date.now(),
});
```

## Configuration Options

```typescript
interface DashboardConfig {
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
```

## Best Practices

1. **Use in Development**: Enable observability in development mode for debugging
2. **Filter Events**: Subscribe only to relevant event types to reduce bandwidth
3. **Aggregate Locally**: Use the local event collector for client-side analytics
4. **Secure WebSocket**: Use WSS (WebSocket Secure) in production
5. **Rate Limiting**: Implement rate limiting on the WebSocket server

## Examples

See the [examples directory](../../projects/ngxsmk-gatekeeper/examples/) for complete examples:

- Basic observability setup
- Custom dashboard component
- WebSocket server implementation
- Integration with middleware execution

## See Also

- [Debug Mode](./debug-mode.md) - Built-in debugging
- [Performance Monitoring](./performance.md) - Performance analysis
- [Middleware Pattern](./middleware-pattern.md) - Understanding middleware

