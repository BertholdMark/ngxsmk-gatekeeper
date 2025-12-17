/**
 * Core hook runner - Framework agnostic
 * No Angular imports allowed in this file
 */

import { 
  HookResult, 
  RouteHookContext, 
  HttpHookContext, 
  RouteLifecycleHooks, 
  HttpLifecycleHooks,
  ScopedRouteHook,
  ScopedHttpHook,
  ScopedRouteLifecycleHooks,
  ScopedHttpLifecycleHooks,
  RetrySignal,
  FallbackSignal
} from './hook.types';
import { matchesRouteScope, matchesHttpScope } from './pattern-matcher';

/**
 * Type guard to check if result is a retry signal
 */
function isRetrySignal(result: unknown): result is RetrySignal {
  return typeof result === 'object' && result !== null && '__retry' in result && (result as RetrySignal).__retry === true;
}

/**
 * Type guard to check if result is a fallback signal
 */
function isFallbackSignal(result: unknown): result is FallbackSignal {
  return typeof result === 'object' && result !== null && '__fallback' in result && (result as FallbackSignal).__fallback === true;
}

/**
 * Runs beforeRoute hook(s) and returns result
 * Supports both scoped and unscoped hooks
 */
export async function runBeforeRouteHook(
  hook: RouteLifecycleHooks['beforeRoute'] | ScopedRouteLifecycleHooks['beforeRoute'] | undefined,
  context: RouteHookContext
): Promise<boolean> {
  if (!hook) {
    return true; // No hook = allow
  }

  // Handle array of scoped hooks
  if (Array.isArray(hook)) {
    for (const scopedHook of hook) {
      // Check if scope matches
      if (!matchesRouteScope(context, scopedHook.scope)) {
        continue; // Skip this hook if scope doesn't match
      }

      try {
        const result = scopedHook.hook(context);
        const allowed = await Promise.resolve(result);
        if (!allowed) {
          return false; // Block if any hook returns false
        }
      } catch (error) {
        console.error('[LifecycleHooks] Error in scoped beforeRoute hook:', error);
        return false; // Block on error
      }
    }
    return true; // All matching hooks allowed
  }

  // Handle single unscoped hook
  try {
    const result = hook(context);
    return await Promise.resolve(result);
  } catch (error) {
    console.error('[LifecycleHooks] Error in beforeRoute hook:', error);
    return false; // Block on error
  }
}

/**
 * Runs afterRoute hook(s)
 * Supports both scoped and unscoped hooks
 */
export async function runAfterRouteHook(
  hook: RouteLifecycleHooks['afterRoute'] | ScopedRouteLifecycleHooks['afterRoute'] | undefined,
  context: RouteHookContext
): Promise<void> {
  if (!hook) {
    return;
  }

  // Handle array of scoped hooks
  if (Array.isArray(hook)) {
    for (const scopedHook of hook) {
      // Check if scope matches
      if (!matchesRouteScope(context, scopedHook.scope)) {
        continue; // Skip this hook if scope doesn't match
      }

      try {
        await Promise.resolve(scopedHook.hook(context));
      } catch (error) {
        console.error('[LifecycleHooks] Error in scoped afterRoute hook:', error);
      }
    }
    return;
  }

  // Handle single unscoped hook
  try {
    await Promise.resolve(hook(context));
  } catch (error) {
    console.error('[LifecycleHooks] Error in afterRoute hook:', error);
  }
}

/**
 * Runs routeBlocked hook(s)
 * Supports both scoped and unscoped hooks
 */
export async function runRouteBlockedHook(
  hook: RouteLifecycleHooks['routeBlocked'] | ScopedRouteLifecycleHooks['routeBlocked'] | undefined,
  context: RouteHookContext
): Promise<void> {
  if (!hook) {
    return;
  }

  // Handle array of scoped hooks
  if (Array.isArray(hook)) {
    for (const scopedHook of hook) {
      // Check if scope matches
      if (!matchesRouteScope(context, scopedHook.scope)) {
        continue; // Skip this hook if scope doesn't match
      }

      try {
        await Promise.resolve(scopedHook.hook(context));
      } catch (error) {
        console.error('[LifecycleHooks] Error in scoped routeBlocked hook:', error);
      }
    }
    return;
  }

  // Handle single unscoped hook
  try {
    await Promise.resolve(hook(context));
  } catch (error) {
    console.error('[LifecycleHooks] Error in routeBlocked hook:', error);
  }
}

/**
 * Result of running beforeRequest hook
 */
export interface BeforeRequestHookResult {
  /**
   * Whether the request should proceed
   */
  allowed: boolean;
  /**
   * Optional retry signal
   */
  retry?: RetrySignal;
}

/**
 * Runs beforeRequest hook(s) and returns result
 * Supports both scoped and unscoped hooks
 * Returns result with retry signal support
 */
export async function runBeforeRequestHook(
  hook: HttpLifecycleHooks['beforeRequest'] | ScopedHttpLifecycleHooks['beforeRequest'] | undefined,
  context: HttpHookContext
): Promise<BeforeRequestHookResult> {
  if (!hook) {
    return { allowed: true }; // No hook = allow
  }

  // Handle array of scoped hooks
  if (Array.isArray(hook)) {
    for (const scopedHook of hook) {
      // Check if scope matches
      if (!matchesHttpScope(context, scopedHook.scope)) {
        continue; // Skip this hook if scope doesn't match
      }

      try {
        const result = scopedHook.hook(context);
        const resolved = await Promise.resolve(result);
        
        // Check for retry signal
        if (isRetrySignal(resolved)) {
          return { allowed: true, retry: resolved };
        }
        
        // Check for boolean result
        if (typeof resolved === 'boolean') {
          if (!resolved) {
            return { allowed: false }; // Block if any hook returns false
          }
        }
      } catch (error) {
        console.error('[LifecycleHooks] Error in scoped beforeRequest hook:', error);
        return { allowed: false }; // Block on error
      }
    }
    return { allowed: true }; // All matching hooks allowed
  }

  // Handle single unscoped hook
  try {
    const result = hook(context);
    const resolved = await Promise.resolve(result);
    
    // Check for retry signal
    if (isRetrySignal(resolved)) {
      return { allowed: true, retry: resolved };
    }
    
    // Check for boolean result
    if (typeof resolved === 'boolean') {
      return { allowed: resolved };
    }
    
    // Default to allow for unknown types
    return { allowed: true };
  } catch (error) {
    console.error('[LifecycleHooks] Error in beforeRequest hook:', error);
    return { allowed: false }; // Block on error
  }
}

/**
 * Result of running afterResponse hook
 */
export interface AfterResponseHookResult {
  /**
   * Optional fallback signal
   */
  fallback?: FallbackSignal;
}

/**
 * Runs afterResponse hook(s)
 * Supports both scoped and unscoped hooks
 * Returns result with fallback signal support
 */
export async function runAfterResponseHook(
  hook: HttpLifecycleHooks['afterResponse'] | ScopedHttpLifecycleHooks['afterResponse'] | undefined,
  context: HttpHookContext
): Promise<AfterResponseHookResult> {
  if (!hook) {
    return {}; // No hook = no fallback
  }

  // Handle array of scoped hooks
  if (Array.isArray(hook)) {
    for (const scopedHook of hook) {
      // Check if scope matches
      if (!matchesHttpScope(context, scopedHook.scope)) {
        continue; // Skip this hook if scope doesn't match
      }

      try {
        const result = scopedHook.hook(context);
        const resolved = await Promise.resolve(result);
        
        // Check for fallback signal
        if (isFallbackSignal(resolved)) {
          return { fallback: resolved };
        }
      } catch (error) {
        console.error('[LifecycleHooks] Error in scoped afterResponse hook:', error);
      }
    }
    return {}; // No fallback
  }

  // Handle single unscoped hook
  try {
    const result = hook(context);
    const resolved = await Promise.resolve(result);
    
    // Check for fallback signal
    if (isFallbackSignal(resolved)) {
      return { fallback: resolved };
    }
    
    return {}; // No fallback
  } catch (error) {
    console.error('[LifecycleHooks] Error in afterResponse hook:', error);
    return {}; // No fallback on error
  }
}

/**
 * Runs requestBlocked hook(s)
 * Supports both scoped and unscoped hooks
 */
export async function runRequestBlockedHook(
  hook: HttpLifecycleHooks['requestBlocked'] | ScopedHttpLifecycleHooks['requestBlocked'] | undefined,
  context: HttpHookContext
): Promise<void> {
  if (!hook) {
    return;
  }

  // Handle array of scoped hooks
  if (Array.isArray(hook)) {
    for (const scopedHook of hook) {
      // Check if scope matches
      if (!matchesHttpScope(context, scopedHook.scope)) {
        continue; // Skip this hook if scope doesn't match
      }

      try {
        await Promise.resolve(scopedHook.hook(context));
      } catch (error) {
        console.error('[LifecycleHooks] Error in scoped requestBlocked hook:', error);
      }
    }
    return;
  }

  // Handle single unscoped hook
  try {
    await Promise.resolve(hook(context));
  } catch (error) {
    console.error('[LifecycleHooks] Error in requestBlocked hook:', error);
  }
}

/**
 * Runs requestFailed hook(s)
 * Supports both scoped and unscoped hooks
 */
export async function runRequestFailedHook(
  hook: HttpLifecycleHooks['requestFailed'] | ScopedHttpLifecycleHooks['requestFailed'] | undefined,
  context: HttpHookContext & { error: unknown }
): Promise<void> {
  if (!hook) {
    return;
  }

  // Handle array of scoped hooks
  if (Array.isArray(hook)) {
    for (const scopedHook of hook) {
      // Check if scope matches
      if (!matchesHttpScope(context, scopedHook.scope)) {
        continue; // Skip this hook if scope doesn't match
      }

      try {
        await Promise.resolve(scopedHook.hook(context));
      } catch (error) {
        console.error('[LifecycleHooks] Error in scoped requestFailed hook:', error);
      }
    }
    return;
  }

  // Handle single unscoped hook
  try {
    await Promise.resolve(hook(context));
  } catch (error) {
    console.error('[LifecycleHooks] Error in requestFailed hook:', error);
  }
}


