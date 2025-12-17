/**
 * Pattern matching utilities for hook scoping
 * Framework agnostic - no Angular imports
 */

/**
 * Converts a glob pattern to a regular expression
 * Supports:
 * - ** - matches any number of path segments
 * - * - matches any characters except /
 * - ? - matches a single character except /
 * 
 * @param pattern - Glob pattern (e.g., '/admin/...', '/api/*/users')
 * @returns Regular expression that matches the pattern
 */
export function globToRegex(pattern: string): RegExp {
  // Escape special regex characters except *, ?, and /
  let regexPattern = pattern
    .replace(/[.+^${}()|\[\]\\]/g, '\\$&')
    // Convert ** to match any number of path segments
    .replace(/\*\*/g, '.*')
    // Convert * to match any characters except /
    .replace(/\*/g, '[^/]*')
    // Convert ? to match a single character except /
    .replace(/\?/g, '[^/]');

  // Anchor to start and end
  return new RegExp(`^${regexPattern}$`);
}

/**
 * Checks if a path matches a pattern or array of patterns
 * 
 * @param path - Path to check (e.g., '/admin/users')
 * @param patterns - Pattern(s) to match against (e.g., '/admin/**' or ['/admin/**', '/api/**'])
 * @returns True if path matches any pattern
 */
export function matchesPattern(path: string, patterns: string | string[] | undefined): boolean {
  if (!patterns) {
    return true; // No pattern = match all
  }

  const patternArray = Array.isArray(patterns) ? patterns : [patterns];
  
  return patternArray.some(pattern => {
    // Exact match
    if (pattern === path) {
      return true;
    }
    
    // Glob pattern match
    const regex = globToRegex(pattern);
    return regex.test(path);
  });
}

/**
 * Checks if a method matches a scope
 * 
 * @param method - HTTP method to check (e.g., 'POST')
 * @param scopeMethods - Method(s) from scope (e.g., 'POST' or ['GET', 'POST'])
 * @returns True if method matches
 */
export function matchesMethod(method: string, scopeMethods: string | string[] | undefined): boolean {
  if (!scopeMethods) {
    return true; // No method filter = match all
  }

  const methodArray = Array.isArray(scopeMethods) ? scopeMethods : [scopeMethods];
  return methodArray.some(m => m.toUpperCase() === method.toUpperCase());
}

/**
 * Checks if a route context matches a route hook scope
 * 
 * @param context - Route hook context
 * @param scope - Route hook scope
 * @returns True if context matches scope
 */
export function matchesRouteScope(
  context: { navigation: { to: string } },
  scope: { path?: string | string[]; method?: string | string[] } | undefined
): boolean {
  if (!scope) {
    return true; // No scope = match all
  }

  // Check path match
  if (scope.path !== undefined) {
    if (!matchesPattern(context.navigation.to, scope.path)) {
      return false;
    }
  }

  // Method check for routes is typically not applicable unless it's an API route
  // But we support it for completeness
  // Note: Route context doesn't have method, so method scope is ignored for routes
  // unless we extend the context in the future

  return true;
}

/**
 * Checks if an HTTP context matches an HTTP hook scope
 * 
 * @param context - HTTP hook context
 * @param scope - HTTP hook scope
 * @returns True if context matches scope
 */
export function matchesHttpScope(
  context: { request?: { url: string; method: string } },
  scope: { url?: string | string[]; method?: string | string[] } | undefined
): boolean {
  if (!scope) {
    return true; // No scope = match all
  }

  if (!context.request) {
    return false; // No request = no match
  }

  // Check URL match
  if (scope.url !== undefined) {
    // Extract path from full URL (remove protocol, domain, etc.)
    const urlPath = extractPathFromUrl(context.request.url);
    if (!matchesPattern(urlPath, scope.url)) {
      return false;
    }
  }

  // Check method match
  if (scope.method !== undefined) {
    if (!matchesMethod(context.request.method, scope.method)) {
      return false;
    }
  }

  return true;
}

/**
 * Extracts the path portion from a full URL
 * 
 * @param url - Full URL (e.g., 'https://example.com/api/users?foo=bar' or '/api/users')
 * @returns Path portion (e.g., '/api/users')
 */
function extractPathFromUrl(url: string): string {
  try {
    // If it's already a path (starts with /), return as is
    if (url.startsWith('/')) {
      // Remove query string and hash
      const path = url.split('?')[0].split('#')[0];
      return path;
    }

    // Try to parse as URL
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    // If URL parsing fails, assume it's already a path
    // Remove query string and hash
    return url.split('?')[0].split('#')[0];
  }
}

