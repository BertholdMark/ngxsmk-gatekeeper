import { createMiddleware } from 'ngxsmk-gatekeeper';
import { MiddlewareContext } from 'ngxsmk-gatekeeper/lib/core';

/**
 * <%- description %>
 */
export function create<%= middlewareName %>Middleware() {
  return createMiddleware('<%= fileName %>', (context: MiddlewareContext) => {
    // TODO: Implement your middleware logic here
    // Return true to allow, false to deny, or { allow: boolean, redirect?: string }
    
    return true;
  });
}

