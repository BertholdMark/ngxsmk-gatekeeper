/**
 * Router hooks integration
 */

import { inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouteLifecycleHooks, ScopedRouteLifecycleHooks } from '../core';
import { buildRouteContext } from './hook-context';
import { runBeforeRouteHook, runAfterRouteHook, runRouteBlockedHook } from '../core/hook-runner';

/**
 * Sets up router lifecycle hooks
 * This should be called during application bootstrap via APP_INITIALIZER
 * 
 * @param hooks - Route lifecycle hooks configuration (supports both unscoped and scoped hooks)
 * @returns Factory function for APP_INITIALIZER
 */
export function setupRouterHooks(hooks: RouteLifecycleHooks | ScopedRouteLifecycleHooks | undefined) {
  if (!hooks) {
    return () => {}; // No hooks = disabled
  }

  return () => {
    const router = inject(Router);
    
    // Track navigation state
    let previousUrl: string | undefined = router.url;
    
    // Handle navigation start (beforeRoute)
    const navigationStartSub = router.events
      .pipe(
        filter((event: Event): event is NavigationStart => event instanceof NavigationStart)
      )
      .subscribe(async (event) => {
        // Build context for beforeRoute
        const context = buildRouteContext(
          router.routerState.snapshot.root,
          router.routerState.snapshot,
          previousUrl,
          event.navigationTrigger || 'imperative'
        );

        // Run beforeRoute hook
        const allowed = await runBeforeRouteHook(hooks.beforeRoute, context);
        
        if (!allowed) {
          // Block navigation
          const currentNav = router.getCurrentNavigation();
          if (currentNav) {
            currentNav.cancel();
          }
          await runRouteBlockedHook(hooks.routeBlocked, context);
          return;
        }

        // Update previous URL for next navigation
        previousUrl = router.url;
      });

    // Handle successful navigation (afterRoute)
    const navigationEndSub = router.events
      .pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(async (event) => {
        const context = buildRouteContext(
          router.routerState.snapshot.root,
          router.routerState.snapshot,
          previousUrl,
          'imperative'
        );

        await runAfterRouteHook(hooks.afterRoute, context);
        previousUrl = event.urlAfterRedirects;
      });

    // Handle blocked/cancelled navigation (routeBlocked)
    const navigationCancelSub = router.events
      .pipe(
        filter((event: Event): event is NavigationCancel => event instanceof NavigationCancel)
      )
      .subscribe(async (event) => {
        const context = buildRouteContext(
          router.routerState.snapshot.root,
          router.routerState.snapshot,
          previousUrl,
          'imperative'
        );

        await runRouteBlockedHook(hooks.routeBlocked, context);
      });

    // Note: Subscriptions will be cleaned up when the application is destroyed
    // In a production app, you might want to store these and unsubscribe in ngOnDestroy
  };
}
