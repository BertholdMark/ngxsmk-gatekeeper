/**
 * WebSocket server example for observability
 * 
 * This is a reference implementation showing how to create a WebSocket server
 * for the observability dashboard. You can use this as a starting point
 * for your own server implementation.
 * 
 * Example using Node.js with 'ws' package:
 * 
 * ```bash
 * npm install ws @types/ws
 * ```
 */

/**
 * Example WebSocket server implementation
 * 
 * This is a TypeScript example. In a real implementation, you would:
 * 1. Set up a Node.js server with WebSocket support
 * 2. Handle client connections and subscriptions
 * 3. Broadcast events to connected clients
 * 4. Aggregate statistics and send to clients
 * 
 * Example using 'ws' package:
 * 
 * ```typescript
 * import WebSocket from 'ws';
 * import { WebSocketMessage, WebSocketMessageType, ObservabilityEventUnion } from 'ngxsmk-gatekeeper/lib/observability';
 * 
 * const wss = new WebSocket.Server({ port: 8080 });
 * 
 * interface Client {
 *   ws: WebSocket;
 *   subscriptions: Set<ObservabilityEventUnion['type']>;
 *   filters?: {
 *     contextType?: 'route' | 'http';
 *     middlewareName?: string;
 *     contextPath?: string;
 *   };
 * }
 * 
 * const clients = new Set<Client>();
 * 
 * wss.on('connection', (ws: WebSocket) => {
 *   const client: Client = { ws, subscriptions: new Set() };
 *   clients.add(client);
 * 
 *   ws.on('message', (data: string) => {
 *     try {
 *       const message: WebSocketMessage = JSON.parse(data);
 *       handleMessage(client, message);
 *     } catch (error) {
 *       console.error('Failed to parse message:', error);
 *     }
 *   });
 * 
 *   ws.on('close', () => {
 *     clients.delete(client);
 *   });
 * 
 *   // Send ping every 30 seconds
 *   const pingInterval = setInterval(() => {
 *     if (ws.readyState === WebSocket.OPEN) {
 *       ws.send(JSON.stringify({
 *         type: WebSocketMessageType.PING,
 *         timestamp: Date.now(),
 *       }));
 *     }
 *   }, 30000);
 * 
 *   ws.on('close', () => {
 *     clearInterval(pingInterval);
 *   });
 * });
 * 
 * function handleMessage(client: Client, message: WebSocketMessage) {
 *   switch (message.type) {
 *     case WebSocketMessageType.SUBSCRIBE:
 *       const subscribe = message.payload as any;
 *       if (subscribe.eventTypes) {
 *         client.subscriptions = new Set(subscribe.eventTypes);
 *       }
 *       if (subscribe.filters) {
 *         client.filters = subscribe.filters;
 *       }
 *       break;
 * 
 *     case WebSocketMessageType.UNSUBSCRIBE:
 *       client.subscriptions.clear();
 *       client.filters = undefined;
 *       break;
 * 
 *     case WebSocketMessageType.PONG:
 *       // Client responded to ping
 *       break;
 *   }
 * }
 * 
 * // Function to broadcast event to all subscribed clients
 * export function broadcastEvent(event: ObservabilityEventUnion) {
 *   const message: WebSocketMessage = {
 *     type: WebSocketMessageType.EVENT,
 *     payload: event,
 *     timestamp: Date.now(),
 *   };
 * 
 *   clients.forEach((client) => {
 *     if (
 *       client.ws.readyState === WebSocket.OPEN &&
 *       (client.subscriptions.size === 0 || client.subscriptions.has(event.type))
 *     ) {
 *       // Apply filters
 *       if (client.filters) {
 *         if (client.filters.contextType && 'contextType' in event) {
 *           if (event.contextType !== client.filters.contextType) {
 *             return;
 *           }
 *         }
 *         if (client.filters.middlewareName && 'middlewareName' in event) {
 *           if (event.middlewareName !== client.filters.middlewareName) {
 *             return;
 *           }
 *         }
 *         if (client.filters.contextPath && 'contextPath' in event) {
 *           if (event.contextPath !== client.filters.contextPath) {
 *             return;
 *           }
 *         }
 *       }
 * 
 *       client.ws.send(JSON.stringify(message));
 *     }
 *   });
 * }
 * 
 * // Function to send aggregated stats to a client
 * export function sendStats(client: Client, stats: any) {
 *   const message: WebSocketMessage = {
 *     type: WebSocketMessageType.AGGREGATE,
 *     payload: stats,
 *     timestamp: Date.now(),
 *   };
 * 
 *   if (client.ws.readyState === WebSocket.OPEN) {
 *     client.ws.send(JSON.stringify(message));
 *   }
 * }
 * ```
 */

export const WebSocketServerExample = `
// Example WebSocket server using Node.js and 'ws' package

import WebSocket from 'ws';
import { WebSocketMessage, WebSocketMessageType, ObservabilityEventUnion } from 'ngxsmk-gatekeeper/lib/observability';

const wss = new WebSocket.Server({ port: 8080 });

interface Client {
  ws: WebSocket;
  subscriptions: Set<ObservabilityEventUnion['type']>;
  filters?: {
    contextType?: 'route' | 'http';
    middlewareName?: string;
    contextPath?: string;
  };
}

const clients = new Set<Client>();

wss.on('connection', (ws: WebSocket) => {
  const client: Client = { ws, subscriptions: new Set() };
  clients.add(client);

  ws.on('message', (data: string) => {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      handleMessage(client, message);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(client);
  });
});

function handleMessage(client: Client, message: WebSocketMessage) {
  switch (message.type) {
    case WebSocketMessageType.SUBSCRIBE:
      const subscribe = message.payload as any;
      if (subscribe.eventTypes) {
        client.subscriptions = new Set(subscribe.eventTypes);
      }
      if (subscribe.filters) {
        client.filters = subscribe.filters;
      }
      break;

    case WebSocketMessageType.UNSUBSCRIBE:
      client.subscriptions.clear();
      client.filters = undefined;
      break;

    case WebSocketMessageType.PONG:
      break;
  }
}

export function broadcastEvent(event: ObservabilityEventUnion) {
  const message: WebSocketMessage = {
    type: WebSocketMessageType.EVENT,
    payload: event,
    timestamp: Date.now(),
  };

  clients.forEach((client) => {
    if (
      client.ws.readyState === WebSocket.OPEN &&
      (client.subscriptions.size === 0 || client.subscriptions.has(event.type))
    ) {
      if (client.filters) {
        // Apply filters
        if (client.filters.contextType && 'contextType' in event) {
          if (event.contextType !== client.filters.contextType) return;
        }
        if (client.filters.middlewareName && 'middlewareName' in event) {
          if (event.middlewareName !== client.filters.middlewareName) return;
        }
        if (client.filters.contextPath && 'contextPath' in event) {
          if (event.contextPath !== client.filters.contextPath) return;
        }
      }

      client.ws.send(JSON.stringify(message));
    }
  });
}
`;

