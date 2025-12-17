/**
 * Observability provider for Angular
 */

import { Provider } from '@angular/core';
import { DashboardConfig } from './observability.types';
import { ObservabilityService } from './observability.service';

/**
 * Provide observability service with configuration
 */
export function provideObservability(config?: DashboardConfig): Provider[] {
  return [
    {
      provide: ObservabilityService,
      useFactory: () => {
        return new ObservabilityService(config);
      },
    },
  ];
}

