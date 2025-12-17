/**
 * Angular-specific context builders
 */

import { ActivatedRouteSnapshot, NavigationExtras, RouterStateSnapshot } from '@angular/router';
import { HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { RouteHookContext, HttpHookContext } from '../core';

/**
 * Builds route context from Angular route snapshot
 */
export function buildRouteContext(
  route: ActivatedRouteSnapshot | null,
  state: RouterStateSnapshot | null,
  fromUrl?: string,
  trigger: 'imperative' | 'popstate' | 'hashchange' = 'imperative'
): RouteHookContext {
  const toUrl = state?.url || route?.url.map(seg => seg.path).join('/') || '';
  
  const context: RouteHookContext = {
    navigation: {
      from: fromUrl,
      to: toUrl,
      trigger,
    },
    timestamp: Date.now(),
  };

  if (route) {
    // Collect route params
    const params: Record<string, string> = {};
    let currentRoute: ActivatedRouteSnapshot | null = route;
    while (currentRoute) {
      Object.assign(params, currentRoute.params);
      currentRoute = currentRoute.parent;
    }

    // Collect query params
    const queryParams: Record<string, string> = {};
    currentRoute = route;
    while (currentRoute) {
      Object.assign(queryParams, currentRoute.queryParams);
      currentRoute = currentRoute.parent;
    }

    // Collect route data
    const data: Record<string, unknown> = {};
    currentRoute = route;
    while (currentRoute) {
      Object.assign(data, currentRoute.data);
      currentRoute = currentRoute.parent;
    }

    context.route = {
      url: toUrl,
      params,
      queryParams,
      data,
      fragment: route.fragment,
    };
  }

  return context;
}

/**
 * Builds HTTP context from Angular HTTP request
 */
export function buildHttpRequestContext(
  request: HttpRequest<unknown>
): HttpHookContext {
  const headers: Record<string, string> = {};
  request.headers.keys().forEach(key => {
    const value = request.headers.get(key);
    if (value) {
      headers[key] = value;
    }
  });

  return {
    request: {
      url: request.urlWithParams,
      method: request.method,
      headers,
      body: request.body,
    },
    timestamp: Date.now(),
  };
}

/**
 * Builds HTTP context from Angular HTTP response
 */
export function buildHttpResponseContext(
  request: HttpRequest<unknown>,
  response: HttpResponse<unknown> | HttpErrorResponse
): HttpHookContext {
  const requestContext = buildHttpRequestContext(request);
  
  const responseHeaders: Record<string, string> = {};
  if (response instanceof HttpResponse) {
    response.headers.keys().forEach(key => {
      const value = response.headers.get(key);
      if (value) {
        responseHeaders[key] = value;
      }
    });
  }

  return {
    ...requestContext,
    response: {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: response instanceof HttpResponse ? response.body : undefined,
    },
    timestamp: Date.now(),
  };
}

