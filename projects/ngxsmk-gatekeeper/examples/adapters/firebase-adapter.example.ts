/**
 * Example: Firebase Adapter Implementation
 * 
 * This is an example implementation of a Firebase adapter.
 * In a real scenario, this would be in a separate package:
 * @vendor/gatekeeper-adapter-firebase
 * 
 * To use this adapter:
 * 1. Install: npm install @vendor/gatekeeper-adapter-firebase
 * 2. Import and use as shown in adapter-usage.example.ts
 */

import { AuthAdapter, AuthResult, AuthUser } from 'ngxsmk-gatekeeper/lib/adapters';
import { MiddlewareContext } from 'ngxsmk-gatekeeper';

/**
 * Firebase adapter configuration
 */
export interface FirebaseAdapterConfig {
  /**
   * Firebase project configuration
   */
  apiKey: string;
  authDomain: string;
  projectId: string;
  /**
   * Custom token storage key (default: 'firebase_token')
   */
  tokenKey?: string;
  /**
   * Whether to use Firebase Admin SDK for server-side validation (optional)
   */
  useAdminSDK?: boolean;
}

/**
 * Firebase Adapter
 * 
 * Integrates Firebase Authentication with ngxsmk-gatekeeper.
 * 
 * This adapter:
 * - Validates Firebase ID tokens
 * - Extracts user information from tokens
 * - Handles token refresh
 * - Provides user custom claims (roles, permissions)
 */
export class FirebaseAdapter implements AuthAdapter {
  readonly id = '@vendor/gatekeeper-adapter-firebase';
  readonly name = 'Firebase Adapter';
  readonly version = '1.0.0';
  readonly description = 'Authentication adapter for Firebase';

  private readonly config: Required<Pick<FirebaseAdapterConfig, 'tokenKey'>> & FirebaseAdapterConfig;

  constructor(config: FirebaseAdapterConfig) {
    if (!config.apiKey || !config.authDomain || !config.projectId) {
      throw new Error('FirebaseAdapter requires apiKey, authDomain, and projectId');
    }

    this.config = {
      tokenKey: 'firebase_token',
      ...config,
    };
  }

  /**
   * Authenticates a request using Firebase token
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
          id: user.user_id || user.uid || '',
          email: user.email,
          name: user.name,
          roles: user.roles || [],
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
      // Get current token
      const currentToken = this.extractToken(context);

      if (!currentToken) {
        return {
          authenticated: false,
          error: 'No token found to refresh',
        };
      }

      // In Firebase, tokens are typically refreshed automatically by the SDK
      // For this example, we'll validate the current token
      const isValid = await this.validateToken(currentToken);

      if (!isValid) {
        return {
          authenticated: false,
          error: 'Token is invalid and cannot be refreshed',
        };
      }

      // Decode and return user
      const user = this.decodeToken(currentToken);

      return {
        authenticated: true,
        user: user ? {
          id: user.user_id || user.uid || '',
          email: user.email,
          name: user.name,
          roles: user.roles || [],
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

    // In a real implementation, you would call Firebase Auth signOut()
    // firebase.auth().signOut();
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
   * Validates Firebase ID token
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
      // 1. Verify token signature using Firebase's public keys
      // 2. Verify token audience and issuer
      // 3. Check token claims
      // 4. If useAdminSDK is true, use Firebase Admin SDK for validation

      // For this example, we'll just check if token exists and is not expired
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Decodes Firebase ID token (simple base64 decode, no signature verification)
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
   * Clears token from storage
   */
  private clearToken(context: MiddlewareContext): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.config.tokenKey);
    }
  }
}

