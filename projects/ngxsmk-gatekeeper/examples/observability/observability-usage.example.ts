/**
 * Observability usage example
 * 
 * This example shows how to set up and use the observability system
 * for real-time monitoring of middleware execution.
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  ObservabilityService,
  ObservabilityEventUnion,
  AggregatedStats,
  provideObservability,
} from 'ngxsmk-gatekeeper/lib/observability';

/**
 * Example: Basic observability setup in app.config.ts
 */
export const ObservabilitySetupExample = `
import { ApplicationConfig } from '@angular/core';
import { provideObservability } from 'ngxsmk-gatekeeper/lib/observability';

export const appConfig: ApplicationConfig = {
  providers: [
    provideObservability({
      websocketUrl: 'ws://localhost:8080',
      enableRealtime: true,
      enableMetrics: true,
      enableAnalytics: true,
      autoConnect: true,
      maxEvents: 1000,
    }),
  ],
};
`;

/**
 * Example: Dashboard component
 */
@Component({
  selector: 'app-observability-dashboard',
  template: `
    <div class="dashboard">
      <h2>Real-time Observability Dashboard</h2>
      
      <!-- Connection Status -->
      <div class="status" [class.connected]="connected$ | async">
        <span *ngIf="connected$ | async">🟢 Connected</span>
        <span *ngIf="!(connected$ | async)">🔴 Disconnected</span>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview" *ngIf="stats$ | async as stats">
        <div class="stat-card">
          <h3>Total Requests</h3>
          <p class="stat-value">{{ stats.totalRequests }}</p>
        </div>
        <div class="stat-card">
          <h3>Success Rate</h3>
          <p class="stat-value">
            {{ stats.totalRequests > 0 ? (stats.successfulRequests / stats.totalRequests * 100).toFixed(1) : 0 }}%
          </p>
        </div>
        <div class="stat-card">
          <h3>Avg Response Time</h3>
          <p class="stat-value">{{ stats.averageResponseTime.toFixed(2) }}ms</p>
        </div>
        <div class="stat-card">
          <h3>Failed Requests</h3>
          <p class="stat-value error">{{ stats.failedRequests }}</p>
        </div>
      </div>

      <!-- Middleware Performance Table -->
      <div class="middleware-stats" *ngIf="stats$ | async as stats">
        <h3>Middleware Performance</h3>
        <table>
          <thead>
            <tr>
              <th>Middleware</th>
              <th>Executions</th>
              <th>Avg Duration</th>
              <th>Min Duration</th>
              <th>Max Duration</th>
              <th>Errors</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let mw of stats.middlewareStats">
              <td>{{ mw.name }}</td>
              <td>{{ mw.executionCount }}</td>
              <td>{{ mw.averageDuration.toFixed(2) }}ms</td>
              <td>{{ mw.minDuration.toFixed(2) }}ms</td>
              <td>{{ mw.maxDuration.toFixed(2) }}ms</td>
              <td [class.error]="mw.errorCount > 0">{{ mw.errorCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Recent Events -->
      <div class="recent-events">
        <h3>Recent Events (Last 50)</h3>
        <div class="events-list">
          <div *ngFor="let event of recentEvents" class="event-item" [class.error]="event.type === 'error'">
            <span class="event-type">{{ event.type }}</span>
            <span class="event-time">{{ formatTime(event.timestamp) }}</span>
            <span class="event-details" *ngIf="'middlewareName' in event">
              {{ event.middlewareName }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .status {
      padding: 10px;
      margin-bottom: 20px;
      border-radius: 4px;
      background: #f5f5f5;
    }
    .status.connected {
      background: #e8f5e9;
    }
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin: 0;
      color: #333;
    }
    .stat-value.error {
      color: #d32f2f;
    }
    .middleware-stats {
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
    }
    .error {
      color: #d32f2f;
    }
    .recent-events {
      margin-top: 30px;
    }
    .events-list {
      max-height: 400px;
      overflow-y: auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .event-item {
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      gap: 15px;
      align-items: center;
    }
    .event-item.error {
      background: #ffebee;
    }
    .event-type {
      font-weight: 600;
      color: #1976d2;
      min-width: 150px;
    }
    .event-time {
      color: #666;
      font-family: monospace;
      min-width: 100px;
    }
    .event-details {
      color: #333;
    }
  `],
})
export class ObservabilityDashboardComponent implements OnInit, OnDestroy {
  private observability = inject(ObservabilityService);
  stats$: Observable<AggregatedStats | null>;
  connected$: Observable<boolean>;
  recentEvents: ObservabilityEventUnion[] = [];
  private subscriptions = new Subscription();

  ngOnInit() {
    this.stats$ = this.observability.stats$;
    this.connected$ = this.observability.connected$;

    // Subscribe to events
    this.subscriptions.add(
      this.observability.events$.subscribe((event) => {
        this.recentEvents.push(event);
        // Keep only last 50 events
        if (this.recentEvents.length > 50) {
          this.recentEvents = this.recentEvents.slice(-50);
        }
      })
    );

    // Request stats every 5 seconds
    const statsInterval = setInterval(() => {
      this.observability.requestStats();
    }, 5000);

    this.subscriptions.add({
      unsubscribe: () => clearInterval(statsInterval),
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  }
}

/**
 * Example: Manual event recording
 */
export function manualEventRecordingExample(observability: ObservabilityService) {
  // Record middleware execution
  const context = { route: {} } as any;
  observability.recordMiddlewareStart('auth', 0, context, 'route', '/admin');
  
  // ... execute middleware ...
  
  observability.recordMiddlewareEnd('auth', 0, context, 'route', '/admin', true, 15);

  // Record chain execution
  observability.recordChainStart(context, 'route', '/admin', 3);
  // ... execute chain ...
  observability.recordChainEnd(context, 'route', '/admin', true, 2, 45);

  // Record error
  observability.recordError('Authentication failed', undefined, 'middleware', {
    middlewareName: 'auth',
    contextPath: '/admin',
  });

  // Record metric
  observability.recordMetric('response_time', 150, 'ms', {
    endpoint: '/api/users',
    method: 'GET',
  });
}

/**
 * Example: Get local statistics
 */
export function getLocalStatsExample(observability: ObservabilityService) {
  // Get stats for last minute
  const stats = observability.getStats({
    start: Date.now() - 60000,
    end: Date.now(),
  });

  console.log('Total Requests:', stats.totalRequests);
  console.log('Success Rate:', (stats.successfulRequests / stats.totalRequests * 100).toFixed(1) + '%');
  console.log('Average Response Time:', stats.averageResponseTime.toFixed(2) + 'ms');

  // Get recent events
  const events = observability.getRecentEvents(100);
  console.log('Recent Events:', events);
}

