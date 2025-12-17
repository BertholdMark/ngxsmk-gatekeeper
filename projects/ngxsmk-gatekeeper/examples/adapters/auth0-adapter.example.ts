/**
 * Example: Auth0 Adapter Implementation
 * 
 * This is an example implementation of an Auth0 adapter.
 * In a real scenario, this would be in a separate package:
 * @vendor/gatekeeper-adapter-auth0
 * 
 * To use this adapter:
 * 1. Install: npm install @vendor/gatekeeper-adapter-auth0
 * 2. Import and use as shown in adapter-usage.example.ts
 */

import { AuthAdapter, AuthResult, AuthUser } from 'ngxsmk-gatekeeper/lib/adapters';
import { MiddlewareContext } from 'ngxsmk-gatekeeper';

/**
 * Auth0 adapter configuration
 */
export interface Auth0AdapterConfig {
  /**
   * Auth0 domain (e.g., 'your-domain.auth0.com')
   */
  domain: string;
  /**
   * Auth0 client ID
   */
  clientId: string;
  /**
   * Auth0 client secret (optional, for server-side validation)
   */
  clientSecret?: string;
  /**
   * Auth0 audience (optional)
   */
  audience?: string;
  /**
   * Token storage key (default: 'auth0_token')
   */
  tokenKey?: string;
}

/**
 * Auth0 Adapter
 * 
 * Integrates Auth0 authentication with ngxsmk-gatekeeper.
 * 
 * This adapter:
 * - Validates Auth0 JWT tokens
 * - Extracts user information from tokens
 * - Handles token refresh
 * - Provides user roles and permissions
 */
export class Auth0Adapter implements AuthAdapter {
  readonly id = '@vendor/gatekeeper-adapter-auth0';
  readonly name = 'Auth0 Adapter';
  readonly version = '1.0.0';
  readonly description = 'Authentication adapter for Auth0';

  private readonly config: Required<Pick<Auth0AdapterConfig, 'tokenKey'>> & Auth0AdapterConfig;

  constructor(config: Auth0AdapterConfig) {
    if (!config.domain || !config.clientId) {
      throw new Error('Auth0Adapter requires domain and clientId');
    }

    this.config = {
      tokenKey: 'auth0_token',
      ...config,
    };
  }

  /**
   * Authenticates a request using Auth0 token
   */
  async authenticate(context: MiddlewareContext): Promise<AuthResult> {
    try {
      // Extract token from context
      const token = this.extractToken(context);

      if (!token) {
        return {
          authenticated: false,
          error: 'No authentication token found',
        };
      }

      // Validate token
      const isValid = await this.validateToken(token);
      if (!isValid) {
        return {
          authenticated: false,
          error: 'Invalid or expired token',
        };
      }

      // Decode token to get user information
      const user = this.decodeToken(token);

      if (!user) {
        return {
          authenticated: false,
          error: 'Failed to decode token',
        };
      }

      return {
        authenticated: true,
        user: {
          id: user.sub || user.user_id || '',
          email: user.email,
          name: user.name || user.nickname,
          roles: user['https://your-app.com/roles'] || [],
          permissions: user.permissions || [],
          metadata: {
            ...user,
          },
        },
      };
    } catch (error) {
      return {
        authenticated: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Refreshes authentication token
   */
  async refresh(context: MiddlewareContext): Promise<AuthResult> {
    try {
      // Get refresh token from storage
      const refreshToken = this.getRefreshToken(context);

      if (!refreshToken) {
        return {
          authenticated: false,
          error: 'No refresh token found',
        };
      }

      // Call Auth0 token endpoint to refresh
      const response = await fetch(`https://${this.config.domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          refresh_token: refreshToken,
          ...(this.config.audience && { audience: this.config.audience }),
        }),
      });

      if (!response.ok) {
        return {
          authenticated: false,
          error: 'Failed to refresh token',
        };
      }

      const data = await response.json();

      // Store new token
      this.storeToken(context, data.access_token);

      // Decode and return user
      const user = this.decodeToken(data.access_token);

      return {
        authenticated: true,
        user: user ? {
          id: user.sub || user.user_id || '',
          email: user.email,
          name: user.name || user.nickname,
          roles: user['https://your-app.com/roles'] || [],
          permissions: user.permissions || [],
        } : undefined,
      };
    } catch (error) {
      return {
        authenticated: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Logs out and clears authentication
   */
  async logout(context: MiddlewareContext): Promise<void> {
    // Clear token from storage
    this.clearToken(context);

    // Optionally call Auth0 logout endpoint
    // await fetch(`https://${this.config.domain}/v2/logout`, { ... });
  }

  /**
   * Extracts token from context
   */
  private extractToken(context: MiddlewareContext): string | null {
    // Try to get token from various sources
    // 1. From request headers (for HTTP requests)
    if (context.request) {
      const authHeader = context.request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    }

    // 2. From localStorage (for routes)
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(this.config.tokenKey);
    }

    // 3. From context metadata
    const token = (context as Record<string, unknown>).token as string | undefined;
    if (token) {
      return token;
    }

    return null;
  }

  /**
   * Validates Auth0 JWT token
   */
  private async validateToken(token: string): Promise<boolean> {
    try {
      // Decode token to check expiration
      const decoded = this.decodeToken(token);
      if (!decoded) {
        return false;
      }

      // Check expiration
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return false;
      }

      // In a real implementation, you would:
      // 1. Verify token signature using Auth0's public key
      // 2. Verify token audience and issuer
      // 3. Check token claims

      // For this example, we'll just check if token exists and is not expired
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Decodes JWT token (simple base64 decode, no signature verification)
   * 
   * In a real implementation, you should verify the token signature
   */
  private decodeToken(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  /**
   * Gets refresh token from storage
   */
  private getRefreshToken(context: MiddlewareContext): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(`${this.config.tokenKey}_refresh`);
    }
    return null;
  }

  /**
   * Stores token in storage
   */
  private storeToken(context: MiddlewareContext, token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.config.tokenKey, token);
    }
  }

  /**
   * Clears token from storage
   */
  private clearToken(context: MiddlewareContext): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.config.tokenKey);
      window.localStorage.removeItem(`${this.config.tokenKey}_refresh`);
    }
  }
}

