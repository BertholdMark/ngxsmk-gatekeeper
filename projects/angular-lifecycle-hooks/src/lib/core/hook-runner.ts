/**
 * Core hook runner - Framework agnostic
 * No Angular imports allowed in this file
 */

import { HookResult, RouteHookContext, HttpHookContext, RouteLifecycleHooks, HttpLifecycleHooks } from './hook.types';

/**
 * Runs beforeRoute hook and returns result
 */
export async function runBeforeRouteHook(
  hook: RouteLifecycleHooks['beforeRoute'] | undefined,
  context: RouteHookContext
): Promise<boolean> {
  if (!hook) {
    return true; // No hook = allow
  }

  try {
    const result = hook(context);
    return await Promise.resolve(result);
  } catch (error) {
    console.error('[LifecycleHooks] Error in beforeRoute hook:', error);
    return false; // Block on error
  }
}

/**
 * Runs afterRoute hook
 */
export async function runAfterRouteHook(
  hook: RouteLifecycleHooks['afterRoute'] | undefined,
  context: RouteHookContext
): Promise<void> {
  if (!hook) {
    return;
  }

  try {
    await Promise.resolve(hook(context));
  } catch (error) {
    console.error('[LifecycleHooks] Error in afterRoute hook:', error);
  }
}

/**
 * Runs routeBlocked hook
 */
export async function runRouteBlockedHook(
  hook: RouteLifecycleHooks['routeBlocked'] | undefined,
  context: RouteHookContext
): Promise<void> {
  if (!hook) {
    return;
  }

  try {
    await Promise.resolve(hook(context));
  } catch (error) {
    console.error('[LifecycleHooks] Error in routeBlocked hook:', error);
  }
}

/**
 * Runs beforeRequest hook and returns result
 */
export async function runBeforeRequestHook(
  hook: HttpLifecycleHooks['beforeRequest'] | undefined,
  context: HttpHookContext
): Promise<boolean> {
  if (!hook) {
    return true; // No hook = allow
  }

  try {
    const result = hook(context);
    return await Promise.resolve(result);
  } catch (error) {
    console.error('[LifecycleHooks] Error in beforeRequest hook:', error);
    return false; // Block on error
  }
}

/**
 * Runs afterResponse hook
 */
export async function runAfterResponseHook(
  hook: HttpLifecycleHooks['afterResponse'] | undefined,
  context: HttpHookContext
): Promise<void> {
  if (!hook) {
    return;
  }

  try {
    await Promise.resolve(hook(context));
  } catch (error) {
    console.error('[LifecycleHooks] Error in afterResponse hook:', error);
  }
}

/**
 * Runs requestBlocked hook
 */
export async function runRequestBlockedHook(
  hook: HttpLifecycleHooks['requestBlocked'] | undefined,
  context: HttpHookContext
): Promise<void> {
  if (!hook) {
    return;
  }

  try {
    await Promise.resolve(hook(context));
  } catch (error) {
    console.error('[LifecycleHooks] Error in requestBlocked hook:', error);
  }
}

/**
 * Runs requestFailed hook
 */
export async function runRequestFailedHook(
  hook: HttpLifecycleHooks['requestFailed'] | undefined,
  context: HttpHookContext & { error: unknown }
): Promise<void> {
  if (!hook) {
    return;
  }

  try {
    await Promise.resolve(hook(context));
  } catch (error) {
    console.error('[LifecycleHooks] Error in requestFailed hook:', error);
  }
}

