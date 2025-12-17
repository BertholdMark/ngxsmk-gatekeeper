/**
 * Example: Custom JWT Adapter Implementation
 * 
 * This is an example implementation of a custom JWT adapter.
 * In a real scenario, this would be in a separate package:
 * @vendor/gatekeeper-adapter-jwt
 * 
 * To use this adapter:
 * 1. Install: npm install @vendor/gatekeeper-adapter-jwt
 * 2. Import and use as shown in adapter-usage.example.ts
 */

import { AuthAdapter, AuthResult, AuthUser } from 'ngxsmk-gatekeeper/lib/adapters';
import { MiddlewareContext } from 'ngxsmk-gatekeeper';

/**
 * Custom JWT adapter configuration
 */
export interface JWTAdapterConfig {
  /**
   * JWT secret or public key for token verification
   */
  secret: string;
  /**
   * JWT issuer (optional)
   */
  issuer?: string;
  /**
   * JWT audience (optional)
   */
  audience?: string;
  /**
   * Token storage key (default: 'jwt_token')
   */
  tokenKey?: string;
  /**
   * Token header name (default: 'Authorization')
   */
  headerName?: string;
  /**
   * Token header prefix (default: 'Bearer ')
   */
  headerPrefix?: string;
  /**
   * Custom token extractor function (optional)
   */
  tokenExtractor?: (context: MiddlewareContext) => string | null;
  /**
   * Custom user mapper function (optional)
   */
  userMapper?: (decoded: Record<string, unknown>) => AuthUser | null;
}

/**
 * Custom JWT Adapter
 * 
 * Integrates custom JWT authentication with ngxsmk-gatekeeper.
 * 
 * This adapter:
 * - Validates JWT tokens using a secret or public key
 * - Extracts user information from token claims
 * - Supports custom token extraction and user mapping
 * - Handles token refresh
 */
export class JWTAdapter implements AuthAdapter {
  readonly id = '@vendor/gatekeeper-adapter-jwt';
  readonly name = 'Custom JWT Adapter';
  readonly version = '1.0.0';
  readonly description = 'Authentication adapter for custom JWT tokens';

  private readonly config: Required<Pick<JWTAdapterConfig, 'tokenKey' | 'headerName' | 'headerPrefix'>> & JWTAdapterConfig;

  constructor(config: JWTAdapterConfig) {
    if (!config.secret) {
      throw new Error('JWTAdapter requires a secret for token verification');
    }

    this.config = {
      tokenKey: 'jwt_token',
      headerName: 'Authorization',
      headerPrefix: 'Bearer ',
      ...config,
    };
  }

  /**
   * Authenticates a request using JWT token
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
      const decoded = this.decodeToken(token);

      if (!decoded) {
        return {
          authenticated: false,
          error: 'Failed to decode token',
        };
      }

      // Map decoded token to user
      const user = this.mapUser(decoded);

      if (!user) {
        return {
          authenticated: false,
          error: 'Failed to map token to user',
        };
      }

      return {
        authenticated: true,
        user,
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

      // Validate refresh token
      const isValid = await this.validateToken(refreshToken);
      if (!isValid) {
        return {
          authenticated: false,
          error: 'Invalid or expired refresh token',
        };
      }

      // Decode refresh token
      const decoded = this.decodeToken(refreshToken);
      if (!decoded) {
        return {
          authenticated: false,
          error: 'Failed to decode refresh token',
        };
      }

      // In a real implementation, you would:
      // 1. Call your token refresh endpoint
      // 2. Get a new access token
      // 3. Store the new token

      // For this example, we'll use the refresh token as the new access token
      const user = this.mapUser(decoded);

      return {
        authenticated: true,
        user: user || undefined,
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
  }

  /**
   * Extracts token from context
   */
  private extractToken(context: MiddlewareContext): string | null {
    // Use custom extractor if provided
    if (this.config.tokenExtractor) {
      return this.config.tokenExtractor(context);
    }

    // Try to get token from various sources
    // 1. From request headers (for HTTP requests)
    if (context.request) {
      const headerValue = context.request.headers.get(this.config.headerName);
      if (headerValue?.startsWith(this.config.headerPrefix)) {
        return headerValue.substring(this.config.headerPrefix.length);
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
   * Validates JWT token
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

      // Check issuer if configured
      if (this.config.issuer && decoded.iss !== this.config.issuer) {
        return false;
      }

      // Check audience if configured
      if (this.config.audience) {
        const aud = decoded.aud;
        if (Array.isArray(aud)) {
          if (!aud.includes(this.config.audience)) {
            return false;
          }
        } else if (aud !== this.config.audience) {
          return false;
        }
      }

      // In a real implementation, you would:
      // 1. Verify token signature using the secret or public key
      // 2. Use a JWT library like jsonwebtoken or jose
      // 3. Verify algorithm (HS256, RS256, etc.)

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
   * Maps decoded token to user
   */
  private mapUser(decoded: Record<string, unknown>): AuthUser | null {
    // Use custom mapper if provided
    if (this.config.userMapper) {
      return this.config.userMapper(decoded);
    }

    // Default mapping
    const userId = decoded.sub || decoded.user_id || decoded.id;
    if (!userId || typeof userId !== 'string') {
      return null;
    }

    return {
      id: userId,
      email: decoded.email as string | undefined,
      name: decoded.name as string | undefined,
      roles: (decoded.roles as string[]) || [],
      permissions: (decoded.permissions as string[]) || [],
      metadata: {
        ...decoded,
      },
    };
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
   * Clears token from storage
   */
  private clearToken(context: MiddlewareContext): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.config.tokenKey);
      window.localStorage.removeItem(`${this.config.tokenKey}_refresh`);
    }
  }
}

