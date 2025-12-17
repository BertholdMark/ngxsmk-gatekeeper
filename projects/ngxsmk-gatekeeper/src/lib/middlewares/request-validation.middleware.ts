import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Validation schema type (can be extended for Zod, Yup, etc.)
 */
export type ValidationSchema = {
  validate: (data: unknown) => boolean | { valid: boolean; errors?: string[] };
} | ((data: unknown) => boolean | { valid: boolean; errors?: string[] });

/**
 * Configuration options for request validation middleware
 */
export interface RequestValidationMiddlewareOptions {
  /**
   * Validation schema for request body
   */
  bodySchema?: ValidationSchema;
  /**
   * Validation schema for query parameters
   */
  querySchema?: ValidationSchema;
  /**
   * Validation schema for route parameters
   */
  paramsSchema?: ValidationSchema;
  /**
   * Validation schema for headers
   */
  headersSchema?: ValidationSchema;
  /**
   * Whether to validate body
   * Default: true
   */
  validateBody?: boolean;
  /**
   * Whether to validate query parameters
   * Default: false
   */
  validateQuery?: boolean;
  /**
   * Whether to validate route parameters
   * Default: false
   */
  validateParams?: boolean;
  /**
   * Whether to validate headers
   * Default: false
   */
  validateHeaders?: boolean;
  /**
   * Redirect URL when validation fails
   */
  redirect?: string;
  /**
   * Custom error message
   */
  message?: string;
}

/**
 * Validates data against a schema
 */
function validateData(data: unknown, schema: ValidationSchema): { valid: boolean; errors?: string[] } {
  if (typeof schema === 'function') {
    const result = schema(data);
    if (typeof result === 'boolean') {
      return { valid: result };
    }
    return result;
  }

  if (schema && typeof schema === 'object' && 'validate' in schema) {
    const result = schema.validate(data);
    if (typeof result === 'boolean') {
      return { valid: result };
    }
    return result;
  }

  return { valid: false, errors: ['Invalid schema'] };
}

/**
 * Creates middleware that validates request data
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const validationMiddleware = createRequestValidationMiddleware({
 *   bodySchema: (data) => {
 *     if (typeof data === 'object' && data !== null) {
 *       return 'email' in data && typeof (data as { email: unknown }).email === 'string';
 *     }
 *     return false;
 *   },
 *   validateBody: true
 * });
 * ```
 */
export function createRequestValidationMiddleware(
  options: RequestValidationMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    bodySchema,
    querySchema,
    paramsSchema,
    headersSchema,
    validateBody = true,
    validateQuery = false,
    validateParams = false,
    validateHeaders = false,
    redirect,
    message = 'Request validation failed',
  } = options;

  return createMiddleware('request-validation', (context: MiddlewareContext) => {
    const errors: string[] = [];

    // Validate body
    if (validateBody && bodySchema) {
      const request = context['request'] as HttpRequest<unknown> | undefined;
      const body = request?.body || context['body'];
      const result = validateData(body, bodySchema);
      if (!result.valid) {
        errors.push('Body validation failed');
        if (result.errors) {
          errors.push(...result.errors);
        }
      }
    }

    // Validate query parameters
    if (validateQuery && querySchema) {
      const queryParams = context['queryParams'] || {};
      const result = validateData(queryParams, querySchema);
      if (!result.valid) {
        errors.push('Query parameters validation failed');
        if (result.errors) {
          errors.push(...result.errors);
        }
      }
    }

    // Validate route parameters
    if (validateParams && paramsSchema) {
      const params = context['params'] || {};
      const result = validateData(params, paramsSchema);
      if (!result.valid) {
        errors.push('Route parameters validation failed');
        if (result.errors) {
          errors.push(...result.errors);
        }
      }
    }

    // Validate headers
    if (validateHeaders && headersSchema) {
      const request = context['request'] as HttpRequest<unknown> | undefined;
      const headers: Record<string, string> = {};
      if (request?.headers) {
        request.headers.keys().forEach(key => {
          const value = request.headers.get(key);
          if (value) {
            headers[key] = value;
          }
        });
      }
      const result = validateData(headers, headersSchema);
      if (!result.valid) {
        errors.push('Headers validation failed');
        if (result.errors) {
          errors.push(...result.errors);
        }
      }
    }

    if (errors.length > 0) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: `${message}: ${errors.join(', ')}`,
        };
      }
      return false;
    }

    return true;
  });
}

