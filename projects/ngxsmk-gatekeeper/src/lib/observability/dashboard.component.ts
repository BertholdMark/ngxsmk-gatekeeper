/**
 * Dashboard component for real-time observability
 * 
 * This is a basic component structure. In a real implementation,
 * you would create an Angular component with proper UI.
 */

import type { Observable } from 'rxjs';
import type { ObservabilityEventUnion, AggregatedStats } from './observability.types';

/**
 * Dashboard component interface
 * 
 * This is a TypeScript interface representing the dashboard component.
 * In a real implementation, you would create an Angular component class.
 */
export interface DashboardComponent {
  /** Observable of events */
  events$: Observable<ObservabilityEventUnion[]>;
  /** Observable of stats */
  stats$: Observable<AggregatedStats | null>;
  /** Connection status */
  connected$: Observable<boolean>;
  /** Time range for stats */
  timeRange: { start: number; end: number };
}

/**
 * Dashboard component implementation
 * 
 * Example usage:
 * 
 * ```typescript
 * @Component({
 *   selector: 'app-observability-dashboard',
 *   template: `
 *     <div *ngIf="connected$ | async">
 *       <h2>Observability Dashboard</h2>
 *       <div *ngFor="let event of events$ | async">
 *         {{ event.type }} - {{ event.timestamp }}
 *       </div>
 *       <div *ngIf="stats$ | async as stats">
 *         <p>Total Requests: {{ stats.totalRequests }}</p>
 *         <p>Average Response Time: {{ stats.averageResponseTime }}ms</p>
 *       </div>
 *     </div>
 *   `,
 * })
 * export class ObservabilityDashboardComponent implements OnInit, OnDestroy {
 *   events$: Observable<ObservabilityEventUnion[]>;
 *   stats$: Observable<AggregatedStats | null>;
 *   connected$: Observable<boolean>;
 *   private subscriptions = new Subscription();
 * 
 *   constructor(private observability: ObservabilityService) {}
 * 
 *   ngOnInit() {
 *     this.events$ = this.observability.events$;
 *     this.stats$ = this.observability.stats$;
 *     this.connected$ = this.observability.connected$;
 * 
 *     // Request stats every 5 seconds
 *     const statsInterval = setInterval(() => {
 *       this.observability.requestStats();
 *     }, 5000);
 * 
 *     this.subscriptions.add({
 *       unsubscribe: () => clearInterval(statsInterval),
 *     });
 *   }
 * 
 *   ngOnDestroy() {
 *     this.subscriptions.unsubscribe();
 *   }
 * }
 * ```
 */
export const DashboardComponentExample = `
@Component({
  selector: 'app-observability-dashboard',
  template: \`
    <div class="dashboard" *ngIf="connected$ | async">
      <h2>Real-time Observability Dashboard</h2>
      
      <!-- Stats Overview -->
      <div class="stats-overview" *ngIf="stats$ | async as stats">
        <div class="stat-card">
          <h3>Total Requests</h3>
          <p class="stat-value">{{ stats.totalRequests }}</p>
        </div>
        <div class="stat-card">
          <h3>Success Rate</h3>
          <p class="stat-value">
            {{ (stats.successfulRequests / stats.totalRequests * 100).toFixed(1) }}%
          </p>
        </div>
        <div class="stat-card">
          <h3>Avg Response Time</h3>
          <p class="stat-value">{{ stats.averageResponseTime.toFixed(2) }}ms</p>
        </div>
      </div>

      <!-- Middleware Stats -->
      <div class="middleware-stats" *ngIf="stats$ | async as stats">
        <h3>Middleware Performance</h3>
        <table>
          <thead>
            <tr>
              <th>Middleware</th>
              <th>Executions</th>
              <th>Avg Duration</th>
              <th>Errors</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let mw of stats.middlewareStats">
              <td>{{ mw.name }}</td>
              <td>{{ mw.executionCount }}</td>
              <td>{{ mw.averageDuration.toFixed(2) }}ms</td>
              <td>{{ mw.errorCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Recent Events -->
      <div class="recent-events">
        <h3>Recent Events</h3>
        <div *ngFor="let event of events$ | async | slice:0:50" class="event-item">
          <span class="event-type">{{ event.type }}</span>
          <span class="event-time">{{ event.timestamp | date:'HH:mm:ss.SSS' }}</span>
        </div>
      </div>
    </div>
  \`,
  styles: [\`
    .dashboard {
      padding: 20px;
      font-family: monospace;
    }
    .stats-overview {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat-card {
      flex: 1;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .event-item {
      padding: 5px;
      border-bottom: 1px solid #eee;
    }
    .event-type {
      font-weight: bold;
      margin-right: 10px;
    }
  \`],
})
export class ObservabilityDashboardComponent implements OnInit, OnDestroy {
  events$: Observable<ObservabilityEventUnion[]>;
  stats$: Observable<AggregatedStats | null>;
  connected$: Observable<boolean>;
  private subscriptions = new Subscription();

  constructor(private observability: ObservabilityService) {}

  ngOnInit() {
    this.events$ = this.observability.events$.pipe(
      // Buffer events and emit as array
      // In real implementation, use bufferTime or similar
    );
    this.stats$ = this.observability.stats$;
    this.connected$ = this.observability.connected$;

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
}
`;

