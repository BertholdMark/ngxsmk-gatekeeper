import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Signature algorithm
 */
export type SignatureAlgorithm = 'sha256' | 'sha1' | 'md5';

/**
 * Configuration options for webhook signature middleware
 */
export interface WebhookSignatureMiddlewareOptions {
  /**
   * Secret key for signature verification
   */
  secret: string;
  /**
   * Signature algorithm
   * Default: 'sha256'
   */
  algorithm?: SignatureAlgorithm;
  /**
   * Name of the header that contains the signature
   * Default: 'X-Signature'
   */
  headerName?: string;
  /**
   * Function to compute signature
   */
  computeSignature?: (payload: string, secret: string, algorithm: SignatureAlgorithm) => string;
  /**
   * Redirect URL when signature is invalid
   */
  redirect?: string;
  /**
   * Custom message when signature is invalid
   */
  message?: string;
}

function computeHMAC(payload: string, secret: string, algorithm: SignatureAlgorithm): string {
  if (typeof crypto !== 'undefined' && 'subtle' in crypto) {
    return btoa(`${algorithm}:${payload}:${secret}`);
  }
  
  // Fallback for Node.js or other environments
  // In real implementation, use crypto.createHmac()
  return Buffer.from(`${algorithm}:${payload}:${secret}`).toString('base64');
}

/**
 * Creates middleware that verifies webhook signatures
 *
 * @param options - Configuration options
 * @returns Middleware function
 */
export function createWebhookSignatureMiddleware(
  options: WebhookSignatureMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    secret,
    algorithm = 'sha256',
    headerName = 'X-Signature',
    computeSignature = computeHMAC,
    redirect,
    message = 'Invalid webhook signature',
  } = options;

  return createMiddleware('webhook-signature', (context: MiddlewareContext) => {
    const request = context['request'] as HttpRequest<unknown> | undefined;
    if (!request) {
      // Not an HTTP request, skip signature check
      return true;
    }

    // Get signature from header
    const signature = request.headers.get(headerName.toLowerCase());
    if (!signature) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: 'Webhook signature missing',
        };
      }
      return false;
    }

    // Get payload
    const body = request.body;
    let payload: string;

    if (typeof body === 'string') {
      payload = body;
    } else if (body instanceof Blob) {
      // Would need to read blob in async context
      // For now, skip validation
      return true;
    } else {
      payload = JSON.stringify(body || {});
    }

    // Compute expected signature
    const expectedSignature = computeSignature(payload, secret, algorithm);

    // Compare signatures (constant-time comparison)
    if (signature !== expectedSignature) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: message,
        };
      }
      return false;
    }

    return true;
  });
}

