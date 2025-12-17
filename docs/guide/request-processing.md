# Request Processing

Validate, limit, and process requests before they reach your application.

## Request Validation

Validate request data using custom schemas:

```typescript
import { createRequestValidationMiddleware } from 'ngxsmk-gatekeeper';

// Simple validation
const validationMiddleware = createRequestValidationMiddleware({
  bodySchema: (data) => {
    if (typeof data !== 'object' || data === null) {
      return { valid: false, errors: ['Body must be an object'] };
    }
    if (!('email' in data) || typeof (data as { email: unknown }).email !== 'string') {
      return { valid: false, errors: ['Email is required'] };
    }
    return { valid: true };
  },
  validateBody: true
});

// With Zod (example)
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1)
});

const zodValidation = createRequestValidationMiddleware({
  bodySchema: {
    validate: (data) => {
      const result = userSchema.safeParse(data);
      return {
        valid: result.success,
        errors: result.success ? undefined : result.error.errors.map(e => e.message)
      };
    }
  },
  validateBody: true
});
```

### Validate Multiple Parts

```typescript
const fullValidation = createRequestValidationMiddleware({
  bodySchema: validateBody,
  querySchema: validateQuery,
  paramsSchema: validateParams,
  headersSchema: validateHeaders,
  validateBody: true,
  validateQuery: true,
  validateParams: true,
  validateHeaders: false
});
```

## Request Size Limits

Enforce size limits to prevent DoS attacks:

```typescript
import { createRequestSizeMiddleware } from 'ngxsmk-gatekeeper';

const sizeLimitMiddleware = createRequestSizeMiddleware({
  maxBodySize: '10mb',
  maxQuerySize: '1kb',
  maxHeaderSize: '8kb',
  maxUrlSize: '2kb',
  redirect: '/request-too-large'
});
```

## Request Deduplication

Prevent duplicate requests:

```typescript
import { createRequestDeduplicationMiddleware } from 'ngxsmk-gatekeeper';

const dedupMiddleware = createRequestDeduplicationMiddleware({
  window: 1000, // 1 second
  maxDuplicates: 1,
  keyGenerator: (context) => {
    const request = context['request'];
    if (request) {
      return `${request.method}:${request.url}:${context['user']?.id}`;
    }
    return `${context['path']}:${Date.now()}`;
  }
});
```

## API Versioning

Handle API versioning:

```typescript
import { createAPIVersioningMiddleware } from 'ngxsmk-gatekeeper';

const versioningMiddleware = createAPIVersioningMiddleware({
  defaultVersion: 'v1',
  headerName: 'API-Version',
  queryParamName: 'version',
  supportedVersions: ['v1', 'v2', 'v3'],
  requireVersion: false,
  redirect: '/api/version-required'
});

// Usage in context
// After middleware, access version: context['apiVersion']
```

## Request Transformation

Transform requests before processing:

```typescript
import { createMiddleware } from 'ngxsmk-gatekeeper';

const transformMiddleware = createMiddleware('transform', (context) => {
  const request = context['request'];
  if (request) {
    // Add custom headers
    request.headers.set('X-Custom', 'value');
    
    // Normalize data
    if (request.body) {
      context['normalizedBody'] = normalizeData(request.body);
    }
  }
  return true;
});
```

## Combining Request Processing

```typescript
import { definePipeline } from 'ngxsmk-gatekeeper';

const requestProcessingPipeline = definePipeline('request-processing', [
  sizeLimitMiddleware,
  dedupMiddleware,
  validationMiddleware,
  versioningMiddleware
]);
```

## Examples

### E-commerce API Protection

```typescript
const ecommerceProtection = definePipeline('ecommerce', [
  createRequestSizeMiddleware({
    maxBodySize: '5mb',
    maxQuerySize: '500b'
  }),
  createRequestValidationMiddleware({
    bodySchema: validateOrderSchema,
    validateBody: true
  }),
  createRequestDeduplicationMiddleware({
    window: 2000,
    maxDuplicates: 1
  })
]);
```

### File Upload Protection

```typescript
const fileUploadProtection = definePipeline('file-upload', [
  createRequestSizeMiddleware({
    maxBodySize: '50mb',
    maxHeaderSize: '16kb'
  }),
  createRequestValidationMiddleware({
    bodySchema: validateFileMetadata,
    validateBody: true
  })
]);
```

## Best Practices

1. **Validate early** - Validate before processing
2. **Set reasonable limits** - Balance security and usability
3. **Handle errors gracefully** - Provide clear error messages
4. **Log validation failures** - Monitor for attacks
5. **Use schemas** - Prefer schema validation libraries

## Next Steps

- [Security Features](/guide/security) - Security middleware
- [Performance](/guide/performance) - Performance optimization

